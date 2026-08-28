import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isDbAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from '@/lib/security-logger';
import { getClientIp } from '@/lib/ip';

async function requireAdmin(req: NextRequest | Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  const admin = await isDbAdmin(session.user.id);
  if (!admin) {
    const ip = getClientIp(req as unknown as Request);
    logSecurityEvent({
      event: 'admin_auth_failed',
      ip,
      userId: session.user.id,
      detail: 'Non-admin attempted to access admin posts endpoint',
      endpoint: '/api/admin/posts',
    });
    return null;
  }
  return session.user.id;
}

export async function GET(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where = { status };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { name: true, image: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      data: posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Failed to fetch admin posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, action } = body || {};

    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid id or action' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { user: { select: { name: true, image: true } } },
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const updated = await prisma.post.update({
      where: { id },
      data: { status: newStatus },
      include: { user: { select: { name: true, image: true } } },
    });

    if (action === 'approve' && post.mediaUrl && post.memberId) {
      try {
        await prisma.memberPhoto.create({
          data: {
            memberSlug: post.memberId,
            url: post.mediaUrl,
            caption: post.title || `${post.memberId} - Community Post`,
            category: 'Fan Art',
            credit: post.user?.name || 'Community Contributor',
            uploadedBy: post.userId,
            date: new Date().toISOString().split('T')[0],
          },
        });
      } catch (galleryErr) {
        console.error('Gallery sync failed on post approval:', galleryErr);
      }
    }

    logSecurityEvent({
      event: 'post_moderation',
      ip: getClientIp(req as unknown as Request),
      userId: adminId,
      detail: `${action} post ${id}`,
      endpoint: '/api/admin/posts',
    });

    return NextResponse.json({ post: updated }, { status: 200 });
  } catch (error) {
    console.error('Failed to moderate post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
