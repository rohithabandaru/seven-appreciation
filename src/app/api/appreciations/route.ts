import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma'
import { appreciationSchema, likeSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize, readJsonBodySizeLimited } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';
import { checkContentModeration } from '@/lib/moderation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const where: Prisma.AppreciationMessageWhereInput = { status: 'approved' };
    if (memberId) {
      where.memberId = memberId;
    }
    const [messages, total] = await Promise.all([
      prisma.appreciationMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.appreciationMessage.count({ where }),
    ])

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    let likedIds: string[] = [];
    if (userId && messages.length > 0) {
      const likes = await prisma.appreciationLike.findMany({
        where: { userId, appreciationId: { in: messages.map((m) => m.id) } },
        select: { appreciationId: true },
      });
      likedIds = likes.map((l) => l.appreciationId);
    }

    const data = messages.map((m) => ({
      ...m,
      likedBy: likedIds.includes(m.id) && userId ? [userId] : [],
    }));

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching appreciations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const userName = session?.user?.name || 'Kind ENGENE';
    const userAvatar = session?.user?.image || null;

    const ip = getClientIp(request as unknown as Request);
    const sizeError = await checkPayloadSize(request as unknown as Request);
    if (sizeError) return sizeError;
    const rateLimitKey = userId ? `appreciation:${userId}` : `appreciation:ip:${ip}`;
    const rl = await checkRateLimit(rateLimitKey, RATE_LIMIT_POLICIES.appreciation);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const bodyResult = await readJsonBodySizeLimited<Record<string, unknown>>(request)
    if (!bodyResult.ok) return bodyResult.error
    const body = bodyResult.data as Record<string, unknown>
    const result = appreciationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.flatten() }, { status: 400 })
    }

    const { memberId, content } = result.data

    const modResult = checkContentModeration(content);
    if (!modResult.isAllowed) {
      logSecurityEvent({ event: 'moderation_blocked', ip, userId: userId || undefined, detail: modResult.flagReason, endpoint: '/api/appreciations' });
      return NextResponse.json({ error: modResult.guidanceMessage }, { status: 422 });
    }

    const message = await prisma.appreciationMessage.create({
      data: {
        memberId,
        memberName: memberId,
        userName,
        userId,
        userAvatar,
        content: content.trim(),
        likesCount: 1
      }
    })

    if (userId) {
      // Automatically like own post if logged in
      try {
        await prisma.appreciationLike.create({
          data: {
            userId,
            appreciationId: message.id
          }
        });
      } catch {
        // Ignore if like already exists
      }
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating appreciation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await checkRateLimit('like:' + session.user.id, RATE_LIMIT_POLICIES.like);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const bodyResult = await readJsonBodySizeLimited<Record<string, unknown>>(request)
    if (!bodyResult.ok) return bodyResult.error
    const body = bodyResult.data as Record<string, unknown>
    const result = likeSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { id: appreciationId } = result.data
    const userId = session.user.id

    // Secure toggle logic
    const existingLike = await prisma.appreciationLike.findUnique({
      where: {
        userId_appreciationId: {
          userId,
          appreciationId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.appreciationLike.delete({
          where: { id: existingLike.id }
        }),
        prisma.appreciationMessage.update({
          where: { id: appreciationId },
          data: { likesCount: { decrement: 1 } }
        })
      ])
    } else {
      // Like
      await prisma.$transaction([
        prisma.appreciationLike.create({
          data: { userId, appreciationId }
        }),
        prisma.appreciationMessage.update({
          where: { id: appreciationId },
          data: { likesCount: { increment: 1 } }
        })
      ])
    }

    const updated = await prisma.appreciationMessage.findUnique({ where: { id: appreciationId } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating appreciation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
