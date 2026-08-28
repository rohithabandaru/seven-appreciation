import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions, isDbAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validations";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin" || !(await isDbAdmin(session.user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit('admin:' + session.user.id, RATE_LIMIT_POLICIES.admin);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count(),
    ]);

    return NextResponse.json({
      data: reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);

    const sizeError = await checkPayloadSize(req);
    if (sizeError) return sizeError;

    const rl = checkRateLimit('report:' + session.user.id, RATE_LIMIT_POLICIES.report);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await req.json();
    const result = reportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.flatten() }, { status: 400 });
    }

    const { reason, contentType, contentId, contentSnippet } = result.data;

    // Duplicate report check: prevent flooding with same content reports
    const recentDuplicate = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        contentType: result.data.contentType,
        contentId: result.data.contentId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });
    if (recentDuplicate) {
      logSecurityEvent({ event: 'report_duplicate_blocked', ip, userId: session.user.id, detail: `Duplicate report for ${result.data.contentType}:${result.data.contentId}`, endpoint: '/api/reports' });
      return NextResponse.json({ error: 'You have already reported this content recently.' }, { status: 409 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reporterIp: ip,
        reason,
        contentType,
        contentId,
        contentSnippet,
        status: "pending",
      }
    });

    logSecurityEvent({ event: 'report_submitted', ip, userId: session.user.id, detail: `${result.data.contentType}:${result.data.contentId}`, endpoint: '/api/reports' });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Failed to process report:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
