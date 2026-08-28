import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/ip';

const CACHE_TTL_MS = 60_000;
const CACHE_MAX_SIZE = 10_000;
const CACHE_CLEANUP_MS = 5 * 60 * 1000;
const bannedCache = new Map<string, { banned: boolean; checkedAt: number }>();
let lastCacheCleanup = Date.now();

function evictStaleCache() {
  const now = Date.now();
  if (now - lastCacheCleanup < CACHE_CLEANUP_MS) return;
  lastCacheCleanup = now;
  for (const [key, entry] of bannedCache) {
    if (now - entry.checkedAt > CACHE_TTL_MS * 2) {
      bannedCache.delete(key);
    }
  }
}

async function isBanned(ip: string): Promise<boolean> {
  const cached = bannedCache.get(ip);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL_MS) {
    return cached.banned;
  }

  try {
    const record = await prisma.bannedIP.findUnique({ where: { ip } });
    const banned = !!record;
    if (bannedCache.size >= CACHE_MAX_SIZE) {
      evictStaleCache();
    }
    bannedCache.set(ip, { banned, checkedAt: Date.now() });
    return banned;
  } catch {
    const cachedFallback = bannedCache.get(ip);
    return cachedFallback?.banned ?? false;
  }
}

export async function proxy(request: NextRequest) {
  const sessionCookie =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!sessionCookie) {
    return NextResponse.next();
  }

  const ip = getClientIp(request as unknown as Request);
  if (ip === 'unknown') {
    return NextResponse.next();
  }

  const banned = await isBanned(ip);
  if (banned) {
    return NextResponse.json(
      { error: 'Your account has been suspended.' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|uploads/).*)',
  ],
};
