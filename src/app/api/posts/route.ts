import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';
import { checkContentModeration } from '@/lib/moderation';

function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith('/uploads/')) return true;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'images.unsplash.com') return true;
    if (parsed.hostname === 'upload.wikimedia.org') return true;
    return false;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PostWhereInput = { status: 'approved' };
    if (memberId) {
      whereClause.memberId = memberId;
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { name: true, image: true }
          },
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
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    let userLikedPostIds: Set<string> = new Set();
    if (userId) {
      const userLikes = await prisma.postLike.findMany({
        where: { userId, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      });
      userLikedPostIds = new Set(userLikes.map((l) => l.postId));
    }

    const mapped = posts.map((p) => ({
      id: p.id,
      memberId: p.memberId,
      userId: p.userId,
      userName: p.user?.name || 'Kind Supporter',
      userAvatar: p.user?.image || null,
      category: p.type,
      type: p.type,
      title: p.title || '',
      content: p.content || '',
      imageUrl: p.mediaUrl || null,
      status: p.status,
      likesCount: p._count.likes,
      likedBy: userLikedPostIds.has(p.id) ? [userId] : [],
      commentsCount: p.comments.length,
      comments: p.comments.map((c) => ({
        id: c.id,
        postId: c.postId,
        userId: c.userId,
        userName: c.user?.name || 'Kind Supporter',
        userAvatar: c.user?.image || null,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: p.createdAt.toISOString(),
    }));

    return new NextResponse(JSON.stringify({
      data: mapped,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const ip = getClientIp(req as unknown as Request);
    const sizeError = await checkPayloadSize(req as unknown as Request);
    if (sizeError) return sizeError;
    const rl = checkRateLimit('post:' + session.user.id, RATE_LIMIT_POLICIES.post);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await req.json();
    const result = postSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: result.error.flatten() }), { status: 400 });
    }

    const { type, title, content, memberId, imageUrl } = result.data;

    if (imageUrl && !isAllowedImageUrl(imageUrl)) {
      logSecurityEvent({ event: 'upload_invalid_url', ip, userId: session.user.id, detail: imageUrl, endpoint: '/api/posts' });
      return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 });
    }

    if (imageUrl && imageUrl.startsWith('data:')) {
      logSecurityEvent({ event: 'upload_base64_rejected', ip, userId: session.user.id, detail: 'Base64 data URL rejected', endpoint: '/api/posts' });
      return NextResponse.json({ error: 'Base64 images are not allowed.' }, { status: 400 });
    }

    const modResult = checkContentModeration(content);
    if (!modResult.isAllowed) {
      logSecurityEvent({ event: 'moderation_blocked', ip, userId: session.user.id, detail: modResult.flagReason, endpoint: '/api/posts' });
      return NextResponse.json({ error: modResult.guidanceMessage }, { status: 422 });
    }

    const newPost = await prisma.post.create({
      data: {
        userId: session.user.id,
        memberId: memberId || null,
        type: type,
        title: title || type,
        content,
        mediaUrl: imageUrl || null,
        status: "pending",
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    });

    // Auto-sync: If post has an image and a member, add to gallery automatically.
    // Only runs when the post has been approved; pending posts are added on approval.
    if (newPost.status === 'approved' && newPost.mediaUrl && newPost.memberId) {
      try {
        await prisma.memberPhoto.create({
          data: {
            memberSlug: newPost.memberId,
            url: newPost.mediaUrl,
            caption: newPost.title || `${newPost.memberId} - Community Post`,
            category: 'Fan Art',
            credit: newPost.user?.name || session.user.name || 'Community Contributor',
            uploadedBy: session.user.id,
            date: new Date().toISOString().split('T')[0],
          }
        });
      } catch (galleryErr) {
        // Non-critical: don't fail the post if gallery sync fails
        console.error('Gallery auto-sync failed:', galleryErr);
      }
    }

    const mappedPost = {
      id: newPost.id,
      memberId: newPost.memberId,
      userId: newPost.userId,
      userName: newPost.user?.name || session.user.name || 'Kind Supporter',
      userAvatar: newPost.user?.image || session.user.image || null,
      category: newPost.type,
      type: newPost.type,
      title: newPost.title || '',
      content: newPost.content || '',
      imageUrl: newPost.mediaUrl || null,
      status: newPost.status,
      likesCount: 0,
      likedBy: [],
      commentsCount: 0,
      comments: [],
      createdAt: newPost.createdAt.toISOString(),
    };

    return new NextResponse(JSON.stringify(mappedPost), { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const { id, action } = body;

    if (!id || !action) {
      return new NextResponse(JSON.stringify({ error: "Missing id or action" }), { status: 400 });
    }

    if (action === 'like' || action === 'unlike') {
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) {
        return new NextResponse(JSON.stringify({ error: "Post not found" }), { status: 404 });
      }

      if (action === 'like') {
        await prisma.postLike.upsert({
          where: { userId_postId: { userId: session.user.id, postId: id } },
          create: { userId: session.user.id, postId: id },
          update: {},
        });
      } else {
        await prisma.postLike.deleteMany({
          where: { userId: session.user.id, postId: id },
        });
      }

      const count = await prisma.postLike.count({ where: { postId: id } });
      return new NextResponse(JSON.stringify({ likesCount: count }), { status: 200 });
    }

    return new NextResponse(JSON.stringify({ error: "Unknown action" }), { status: 400 });
  } catch (error) {
    console.error("Failed to update post:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
