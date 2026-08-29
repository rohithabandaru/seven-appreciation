import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { likes: true } },
        comments: {
          select: {
            id: true,
            postId: true,
            userId: true,
            content: true,
            createdAt: true,
            user: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let isLiked = false;
    if (userId) {
      const userLike = await prisma.postLike.findUnique({
        where: { userId_postId: { userId, postId } }
      });
      isLiked = !!userLike;
    }

    return NextResponse.json({
      id: post.id,
      memberId: post.memberId,
      userId: post.userId,
      userName: post.user?.name || 'Kind Supporter',
      userAvatar: post.user?.image || null,
      category: post.type,
      type: post.type,
      title: post.title || '',
      content: post.content || '',
      imageUrl: post.mediaUrl || null,
      status: post.status,
      likesCount: post._count.likes,
      likedBy: isLiked && userId ? [userId] : [],
      commentsCount: post.comments.length,
      comments: post.comments.map((c) => ({
        id: c.id,
        postId: c.postId,
        userId: c.userId,
        userName: c.user?.name || 'Kind Supporter',
        userAvatar: c.user?.image || null,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: post.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req as unknown as Request);
    const rl = checkRateLimit('delete_post:' + session.user.id, RATE_LIMIT_POLICIES.post);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const { postId } = await params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin = (session.user as { role?: string }).role === 'admin';
    const isOwner = post.userId === session.user.id;

    if (!isOwner && !isAdmin) {
      logSecurityEvent({
        event: 'unauthorized_access_attempt',
        ip,
        userId: session.user.id,
        detail: `Attempted to delete post ${postId} owned by ${post.userId}`,
        endpoint: `/api/posts/${postId}`,
      });
      return NextResponse.json({ error: "Forbidden: You cannot delete this post" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    logSecurityEvent({
      event: 'admin_action',
      ip,
      userId: session.user.id,
      detail: `Post ${postId} deleted by ${isAdmin ? 'admin' : 'owner'}`,
      endpoint: `/api/posts/${postId}`,
    });

    return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
