/**
 * Fixed-window rate limiter backed by the database.
 *
 * Architecture: Vercel serverless (multiple ephemeral instances). An
 * in-memory limiter would be per-instance, letting an attacker spread
 * attempts across instances. Persisting state to Postgres shares the
 * limit across all instances, so abuse prevention is exact regardless
 * of how many serverless instances a request lands on.
 *
 * A fixed-window counter per (key, windowStart) with an atomic upsert
 * is used: it is race-free under concurrent requests, keeps one row per
 * window (bounded growth), and each request is a single round-trip.
 *
 * Stale rows are pruned periodically so the table never grows unbounded.
 */

import { prisma } from '@/lib/prisma';

const OLD_WINDOWS_MS = 24 * 60 * 60 * 1000;
const PRUNE_PROBABILITY = 0.01;

export interface RateLimitPolicy {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed within the window */
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  totalHits: number;
}

/**
 * Check rate limit for a key under a policy.
 * Records the hit and returns whether the request is allowed.
 */
export async function checkRateLimit(
  key: string,
  policy: RateLimitPolicy
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / policy.windowMs) * policy.windowMs);

  if (Math.random() < PRUNE_PROBABILITY) {
    void pruneStaleWindows();
  }

  const record = await prisma.rateLimit.upsert({
    where: { key_windowStart: { key, windowStart } },
    update: { hits: { increment: 1 } },
    create: { key, windowStart, hits: 1 },
  });

  const totalHits = record.hits;
  if (totalHits > policy.maxRequests) {
    const elapsedMs = now - windowStart.getTime();
    const retryAfterMs = Math.max(policy.windowMs - elapsedMs, 1000);
    return { allowed: false, remaining: 0, retryAfterMs, totalHits };
  }

  return {
    allowed: true,
    remaining: policy.maxRequests - totalHits,
    retryAfterMs: 0,
    totalHits,
  };
}

/**
 * Get the current hit count for a key within the current window (without incrementing).
 */
export async function getHitCount(key: string, policy: RateLimitPolicy): Promise<number> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / policy.windowMs) * policy.windowMs);
  const record = await prisma.rateLimit.findUnique({
    where: { key_windowStart: { key, windowStart } },
  });
  return record?.hits ?? 0;
}

/**
 * Reset/clear rate limit rows for a specific key (or clear all entries if no key is provided).
 */
export async function resetRateLimit(key?: string): Promise<void> {
  if (key) {
    await prisma.rateLimit.deleteMany({ where: { key } });
    return;
  }
  await prisma.rateLimit.deleteMany({});
}

/** Remove rows whose window fully elapsed (all policies use windows < 1h). */
async function pruneStaleWindows(): Promise<void> {
  const cutoff = new Date(Date.now() - OLD_WINDOWS_MS);
  await prisma.rateLimit.deleteMany({ where: { updatedAt: { lt: cutoff } } });
}

// ── Rate Limit Policies ──────────────────────────────────────────────────────

export const RATE_LIMIT_POLICIES = {
  /** Login: 5 attempts per 15 minutes per IP */
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },

  /** Login per email: 10 attempts per 15 minutes per email */
  loginPerEmail: { windowMs: 15 * 60 * 1000, maxRequests: 10 },

  /** Registration: 3 per hour per IP */
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 },

  /** Appreciations: 10 per hour per user */
  appreciation: { windowMs: 60 * 60 * 1000, maxRequests: 10 },

  /** Posts: 5 per 15 minutes per user */
  post: { windowMs: 15 * 60 * 1000, maxRequests: 5 },

  /** Comments: 10 per 15 minutes per user */
  comment: { windowMs: 15 * 60 * 1000, maxRequests: 10 },

  /** Reports: 10 per hour per user */
  report: { windowMs: 60 * 60 * 1000, maxRequests: 10 },

  /** Letters: 5 per hour per user */
  letter: { windowMs: 60 * 60 * 1000, maxRequests: 5 },

  /** Likes (all types): 30 per 15 minutes per user */
  like: { windowMs: 15 * 60 * 1000, maxRequests: 30 },

  /** Follow: 20 per 15 minutes per user */
  follow: { windowMs: 15 * 60 * 1000, maxRequests: 20 },

  /** Block: 20 per 15 minutes per user */
  block: { windowMs: 15 * 60 * 1000, maxRequests: 20 },

  /** Milestones: 5 per hour per user */
  milestone: { windowMs: 60 * 60 * 1000, maxRequests: 5 },

  /** Photos: 10 per hour per user */
  photo: { windowMs: 60 * 60 * 1000, maxRequests: 10 },

  /** Admin: 100 per hour per user */
  admin: { windowMs: 60 * 60 * 1000, maxRequests: 100 },

  /** NextAuth session endpoint: 30 per 5 minutes per IP */
  session: { windowMs: 5 * 60 * 1000, maxRequests: 30 },

  /** Live Lounge messages: 20 per 5 minutes per user */
  liveMessage: { windowMs: 5 * 60 * 1000, maxRequests: 20 },

  /** Live Lounge hearts: 30 per 5 minutes per user */
  liveHeart: { windowMs: 5 * 60 * 1000, maxRequests: 30 },

  /** Analytics tracking: 60 per 15 minutes per IP */
  analyticsTrack: { windowMs: 15 * 60 * 1000, maxRequests: 60 },
} as const;

// ── Helper: apply rate limit and return 429 response ─────────────────────────

export function rateLimitResponse(retryAfterMs: number): Response {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  return Response.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    }
  );
}

// ── Payload size check ───────────────────────────────────────────────────────

const MAX_BODY_BYTES = 512 * 1024; // 512 KB

export async function checkPayloadSize(request: Request): Promise<Response | null> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return Response.json(
      { error: 'Request body too large.' },
      { status: 413 }
    );
  }
  return null;
}