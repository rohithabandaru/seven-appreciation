/**
 * In-memory sliding-window rate limiter.
 *
 * Architecture: single-server (next start) — one Node.js process.
 * In-memory is appropriate: simple, zero dependencies, no DB overhead.
 *
 * For serverless/multi-instance, replace with a shared store (e.g., Redis, Postgres).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup every 5 minutes — removes entries with no recent requests.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const maxWindow = Math.max(
    ...Object.values(RATE_LIMIT_POLICIES).map((p) => p.windowMs)
  );
  const cutoff = now - maxWindow;

  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

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
 * Check rate limit for a given key under a given policy.
 * Returns whether the request is allowed and metadata.
 */
export function checkRateLimit(
  key: string,
  policy: RateLimitPolicy
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowStart = now - policy.windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  const totalHits = entry.timestamps.length;

  if (totalHits >= policy.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + policy.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 1000),
      totalHits,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: policy.maxRequests - totalHits - 1,
    retryAfterMs: 0,
    totalHits: totalHits + 1,
  };
}

/**
 * Get the current hit count for a key within a policy window (without incrementing).
 */
export function getHitCount(key: string, policy: RateLimitPolicy): number {
  const now = Date.now();
  const windowStart = now - policy.windowMs;
  const entry = store.get(key);
  if (!entry) return 0;
  return entry.timestamps.filter((t) => t > windowStart).length;
}

/**
 * Reset/clear rate limit timestamps for a specific key (or clear all entries if no key is provided).
 */
export function resetRateLimit(key?: string): void {
  if (key) {
    store.delete(key);
  } else {
    store.clear();
  }
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
