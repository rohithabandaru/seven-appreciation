import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/ip';
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse } from '@/lib/rate-limit';

const dayKey = () => new Date().toISOString().slice(0, 10);

function fingerprint(ip: string, userAgent: string): string {
  const salt = process.env.ANALYTICS_SALT ?? 'seven-appreciation';
  return createHash('sha256')
    .update(`${ip}|${userAgent}|${salt}`)
    .digest('hex')
    .slice(0, 32);
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit('visit:' + ip, RATE_LIMIT_POLICIES.analyticsTrack);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const userAgent = request.headers.get('user-agent') || '';
    const fp = fingerprint(ip, userAgent);
    const day = dayKey();

    let path: string | null = null;
    try {
      const body = await request.json();
      path = typeof body?.path === 'string' ? body.path.slice(0, 300) : null;
    } catch {
      // no body — fine, path stays null
    }

    await prisma.visitLog.upsert({
      where: { fingerprint_day: { fingerprint: fp, day } },
      update: { path: path ?? undefined },
      create: { fingerprint: fp, day, path },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Error recording visit:', error);
    return Response.json({ ok: false }, { status: 500 });
  }
}