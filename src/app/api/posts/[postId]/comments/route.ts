import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';
import { checkContentModeration } from '@/lib/moderation';

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return NextResponse.json(
      comments.map((c) => ({
        id: c.id,
        postId: c.postId,
        userId: c.userId,
        userName: c.user?.name || "Kind Supporter",
        userAvatar: c.user?.image || null,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req as unknown as Request);
    const sizeError = await checkPayloadSize(req as unknown as Request);
    if (sizeError) return sizeError;
    const rl = checkRateLimit('comment:' + session.user.id, RATE_LIMIT_POLICIES.comment);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const { postId } = await params;
    const body = await req.json();
    const result = commentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.flatten() }, { status: 400 });
    }

    const modResult = checkContentModeration(result.data.content);
    if (!modResult.isAllowed) {
      logSecurityEvent({ event: 'moderation_blocked', ip, userId: session.user.id, detail: modResult.flagReason, endpoint: '/api/posts/[postId]/comments' });
      return NextResponse.json({ error: modResult.guidanceMessage }, { status: 422 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content: result.data.content.trim(),
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return NextResponse.json({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      userName: comment.user?.name || "Kind Supporter",
      userAvatar: comment.user?.image || "",
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
