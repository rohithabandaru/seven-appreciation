import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeParam = searchParams.get('exclude') || '';
    const excludeIds = excludeParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    const where = {
      status: 'approved' as const,
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    };

    // 1. Try to fetch from AppreciationMessage table
    let count = await prisma.appreciationMessage.count({ where });

    if (count > 0) {
      const randomSkip = Math.floor(Math.random() * count);
      const messages = await prisma.appreciationMessage.findMany({
        where,
        skip: randomSkip,
        take: 1,
      });

      const msg = messages[0];
      if (msg) {
        return NextResponse.json({
          message: {
            id: msg.id,
            memberId: msg.memberId,
            memberName: msg.memberName,
            userName: msg.userName,
            userAvatar: msg.userAvatar,
            content: msg.content,
            likesCount: msg.likesCount,
            createdAt: msg.createdAt,
          },
          empty: false,
        });
      }
    }

    // 2. Fallback to approved posts
    const postWhere = {
      status: 'approved',
      content: { not: null },
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    };

    const postCount = await prisma.post.count({ where: postWhere });

    if (postCount > 0) {
      const randomSkip = Math.floor(Math.random() * postCount);
      const posts = await prisma.post.findMany({
        where: postWhere,
        include: {
          user: {
            select: { name: true, image: true },
          },
          _count: {
            select: { likes: true },
          },
        },
        skip: randomSkip,
        take: 1,
      });

      const post = posts[0];
      if (post && post.content) {
        return NextResponse.json({
          message: {
            id: post.id,
            memberId: post.memberId,
            memberName: post.memberId || 'ENHYPEN',
            userName: post.user?.name || 'Kind ENGENE',
            userAvatar: post.user?.image || null,
            content: post.content,
            likesCount: post._count.likes,
            createdAt: post.createdAt,
          },
          empty: false,
        });
      }
    }

    return NextResponse.json({
      message: null,
      empty: true,
    });
  } catch (error) {
    console.error('Error fetching random love:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
