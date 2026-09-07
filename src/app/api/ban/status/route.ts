import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';

// GET — public check whether the caller's own IP is banned.
// Used by the login page to show a clear "Access Denied" message.
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req as unknown as Request);

    const rl = await checkRateLimit('ban-status:' + ip, RATE_LIMIT_POLICIES.session);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const banned = await prisma.bannedIP.findUnique({ where: { ip } });

    return NextResponse.json({ banned: !!banned });
  } catch (error) {
    console.error("Failed to check banned IP:", error);
    return NextResponse.json({ banned: false });
  }
}