import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma'
import { appreciationSchema, likeSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize } from '@/lib/rate-limit';
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

    return NextResponse.json({
      data: messages,
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
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(request as unknown as Request);
    const sizeError = await checkPayloadSize(request as unknown as Request);
    if (sizeError) return sizeError;
    const rl = checkRateLimit('appreciation:' + session.user.id, RATE_LIMIT_POLICIES.appreciation);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await request.json()
    const result = appreciationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.flatten() }, { status: 400 })
    }

    const { memberId, content } = result.data

    const modResult = checkContentModeration(content);
    if (!modResult.isAllowed) {
      logSecurityEvent({ event: 'moderation_blocked', ip, userId: session.user.id, detail: modResult.flagReason, endpoint: '/api/appreciations' });
      return NextResponse.json({ error: modResult.guidanceMessage }, { status: 422 });
    }

    const message = await prisma.appreciationMessage.create({
      data: {
        memberId,
        memberName: memberId,
        userName: session.user.name || 'Kind Supporter',
        userId: session.user.id,
        userAvatar: session.user.image || null,
        content: content.trim(),
        likesCount: 1
      }
    })

    // Automatically like own post
    await prisma.appreciationLike.create({
      data: {
        userId: session.user.id,
        appreciationId: message.id
      }
    });

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

    const rl = checkRateLimit('like:' + session.user.id, RATE_LIMIT_POLICIES.like);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await request.json()
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
