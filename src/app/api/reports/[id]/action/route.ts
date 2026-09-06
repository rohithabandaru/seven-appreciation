import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isDbAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, readJsonBodySizeLimited } from '@/lib/rate-limit';
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

    const rl = await checkRateLimit('admin:' + session.user.id, RATE_LIMIT_POLICIES.admin);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const { id: reportId } = await params;
    const bodyResult = await readJsonBodySizeLimited<{ action: (typeof VALID_ACTIONS)[number]; detail?: string | null }>(request);
    if (!bodyResult.ok) return bodyResult.error;
    const body = bodyResult.data as { action: (typeof VALID_ACTIONS)[number]; detail?: string | null };
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
      let targetUserId: string | null = null;
      try {
        switch (report.contentType) {
          case 'post':
          case 'story': {
            const post = await prisma.post.findUnique({
              where: { id: report.contentId },
              select: { userId: true },
            }).catch(() => null);
            targetUserId = post?.userId ?? null;
            if (post) {
              await prisma.post.update({
                where: { id: report.contentId },
                data: { status: newStatus },
              }).catch(() => {});
            }
            break;
          }
          case 'appreciation': {
            const appreciation = await prisma.appreciationMessage.findUnique({
              where: { id: report.contentId },
              select: { userId: true },
            }).catch(() => null);
            targetUserId = appreciation?.userId ?? null;
            await prisma.appreciationMessage.update({
              where: { id: report.contentId },
              data: { status: newStatus },
            }).catch(() => {});
            break;
          }
          case 'milestone': {
            const milestone = await prisma.communityMilestone.findUnique({
              where: { id: report.contentId },
              select: { userId: true },
            }).catch(() => null);
            targetUserId = milestone?.userId ?? null;
            await prisma.communityMilestone.update({
              where: { id: report.contentId },
              data: { status: newStatus },
            }).catch(() => {});
            break;
          }
          case 'comment': {
            const comment = await prisma.comment.findUnique({
              where: { id: report.contentId },
              select: { userId: true },
            }).catch(() => null);
            targetUserId = comment?.userId ?? null;
            if (comment) {
              await prisma.comment.delete({
                where: { id: report.contentId },
              }).catch(() => {});
            }
            break;
          }
          case 'letter': {
            const letter = await prisma.letter.findUnique({
              where: { id: report.contentId },
              select: { userId: true },
            }).catch(() => null);
            targetUserId = letter?.userId ?? null;
            await prisma.letter.delete({
              where: { id: report.contentId },
            }).catch(() => {});
            break;
          }
          case 'photo': {
            const photo = await prisma.memberPhoto.findUnique({
              where: { id: report.contentId },
              select: { uploadedBy: true },
            }).catch(() => null);
            targetUserId = photo?.uploadedBy ?? null;
            await prisma.memberPhoto.delete({
              where: { id: report.contentId },
            }).catch(() => {});
            break;
          }
          default:
            logSecurityEvent({
              event: 'moderation_unknown_type',
              userId: session.user.id,
              detail: `Unknown contentType "${report.contentType}" on report ${reportId}`,
              endpoint: '/api/reports/[id]/action',
            });
        }

        // Ban the AUTHOR of the reported content, never the reporter.
        // Approval = account-level ban row enforced at login + via proxy.ts.
        if (action === 'ban_user' && targetUserId) {
          await prisma.bannedUser.upsert({
            where: { userId: targetUserId },
            update: { reason: `Banned via moderation action on report ${reportId}`, bannedBy: session.user.id },
            create: { userId: targetUserId, reason: `Banned via moderation action on report ${reportId}`, bannedBy: session.user.id },
          }).catch(() => {});
          logSecurityEvent({
            event: 'user_banned',
            userId: targetUserId,
            detail: `Banned via moderation action on report ${reportId}`,
            endpoint: '/api/reports/[id]/action',
          });
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
