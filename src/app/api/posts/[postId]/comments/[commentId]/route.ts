import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req as unknown as Request);
    const rl = checkRateLimit('delete_comment:' + session.user.id, RATE_LIMIT_POLICIES.comment);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const { postId, commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: { select: { userId: true } }
      }
    });

    if (!comment || comment.postId !== postId) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const isAdmin = (session.user as { role?: string }).role === 'admin';
    const isCommentAuthor = comment.userId === session.user.id;
    const isPostAuthor = comment.post.userId === session.user.id;

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      logSecurityEvent({
        event: 'unauthorized_access_attempt',
        ip,
        userId: session.user.id,
        detail: `Attempted to delete comment ${commentId}`,
        endpoint: `/api/posts/${postId}/comments/${commentId}`,
      });
      return NextResponse.json({ error: "Forbidden: You cannot delete this comment" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    logSecurityEvent({
      event: 'admin_action',
      ip,
      userId: session.user.id,
      detail: `Comment ${commentId} deleted by ${isAdmin ? 'admin' : isCommentAuthor ? 'author' : 'post_owner'}`,
      endpoint: `/api/posts/${postId}/comments/${commentId}`,
    });

    return NextResponse.json({ success: true, message: "Comment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
