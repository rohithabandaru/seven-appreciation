import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isDbAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, readJsonBodySizeLimited } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';

// GET — check if an IP is banned (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin" || !(await isDbAdmin(session.user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    const searchParams = req.nextUrl.searchParams;
    const targetIp = searchParams.get('ip') || ip;

    const banned = await prisma.bannedIP.findUnique({ where: { ip: targetIp } });

    return NextResponse.json({ banned: !!banned });
  } catch (error) {
    console.error("Failed to check banned IP:", error);
    return NextResponse.json({ banned: false });
  }
}

// POST — ban an IP (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin" || !(await isDbAdmin(session.user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await checkRateLimit('admin:' + session.user.id, RATE_LIMIT_POLICIES.admin);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const bodyResult = await readJsonBodySizeLimited<{ ip: string; reason?: string }>(req);
    if (!bodyResult.ok) return bodyResult.error;
    const reqBody = bodyResult.data as { ip: string; reason?: string };
    const { ip, reason } = reqBody;

    if (!ip) {
      return NextResponse.json({ error: "IP address is required" }, { status: 400 });
    }

    // bannedBy is always derived from the authenticated admin session — never from request body
    const adminUserId = session.user.id;

    const record = await prisma.bannedIP.upsert({
      where: { ip },
      update: { reason, bannedBy: adminUserId },
      create: { ip, reason, bannedBy: adminUserId },
    });

    logSecurityEvent({ event: 'ip_banned', ip: reqBody.ip, userId: session.user.id, detail: reason, endpoint: '/api/ban' });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Failed to ban IP:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE — unban an IP
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin" || !(await isDbAdmin(session.user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await checkRateLimit('admin:' + session.user.id, RATE_LIMIT_POLICIES.admin);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const bodyResult = await readJsonBodySizeLimited<{ ip: string }>(req);
    if (!bodyResult.ok) return bodyResult.error;
    const reqBody = bodyResult.data as { ip: string };
    const { ip } = reqBody;

    if (!ip) {
      return NextResponse.json({ error: "IP address is required" }, { status: 400 });
    }

    await prisma.bannedIP.deleteMany({ where: { ip } });

    logSecurityEvent({ event: 'ip_unbanned', ip: reqBody.ip, userId: session.user.id, endpoint: '/api/ban' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unban IP:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
