import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isDbAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/security-logger';

const VALID_ACTIONS = ['dismiss', 'hide', 'remove', 'warn_user', 'ban_user'] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin" || !(await isDbAdmin(session.user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit('admin:' + session.user.id, RATE_LIMIT_POLICIES.admin);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const { id: reportId } = await params;
    const body = await request.json();
    const { action, detail } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Update report status
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'dismiss' ? 'dismissed' : 'actioned',
        actionTaken: action,
      },
    });

    // Persist the moderation action with admin identity from session
    const moderationAction = await prisma.moderationAction.create({
      data: {
        reportId,
        adminId: session.user.id,
        action,
        detail: detail || null,
      },
    });

    // Actually update the underlying content visibility for hide/remove/ban_user actions
    if (action === 'hide' || action === 'remove' || action === 'ban_user') {
      const newStatus = action === 'hide' ? 'hidden' : 'removed';
      try {
        switch (report.contentType) {
          case 'post':
          case 'story':
            await prisma.post.update({
              where: { id: report.contentId },
              data: { status: newStatus },
            }).catch(() => {});
            break;
          case 'appreciation':
            await prisma.appreciationMessage.update({
              where: { id: report.contentId },
              data: { status: newStatus },
            }).catch(() => {});
            break;
          case 'milestone':
            await prisma.communityMilestone.update({
              where: { id: report.contentId },
              data: { status: newStatus },
            }).catch(() => {});
            break;
          case 'comment':
            await prisma.comment.delete({
              where: { id: report.contentId },
            }).catch(() => {});
            break;
          case 'letter':
            await prisma.letter.delete({
              where: { id: report.contentId },
            }).catch(() => {});
            break;
          case 'photo':
            await prisma.memberPhoto.delete({
              where: { id: report.contentId },
            }).catch(() => {});
            break;
          default:
            logSecurityEvent({
              event: 'moderation_unknown_type',
              userId: session.user.id,
              detail: `Unknown contentType "${report.contentType}" on report ${reportId}`,
              endpoint: '/api/reports/[id]/action',
            });
        }

        if (action === 'ban_user' && report.reporterIp) {
          await prisma.bannedIP.upsert({
            where: { ip: report.reporterIp },
            update: { reason: `Banned via moderation action on report ${reportId}`, bannedBy: session.user.id },
            create: { ip: report.reporterIp, reason: `Banned via moderation action on report ${reportId}`, bannedBy: session.user.id },
          }).catch(() => {});
        }
      } catch (contentError) {
        logSecurityEvent({
          event: 'moderation_content_update_failed',
          userId: session.user.id,
          detail: `Failed to ${action} ${report.contentType}:${report.contentId}`,
          endpoint: '/api/reports/[id]/action',
        });
        console.error('Failed to update content visibility:', contentError);
      }
    }

    logSecurityEvent({
      event: 'admin_action',
      userId: session.user.id,
      detail: `${action} on report ${reportId}`,
      endpoint: '/api/reports/[id]/action',
    });

    return NextResponse.json({
      success: true,
      action: moderationAction,
      reportStatus: action === 'dismiss' ? 'dismissed' : 'actioned',
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to execute moderation action:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
