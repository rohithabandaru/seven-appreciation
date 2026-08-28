import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { milestoneSchema, likeSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';
import { checkContentModeration } from '@/lib/moderation';

// GET /api/milestones – fetch all community milestones
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    const where: Prisma.CommunityMilestoneWhereInput = { status: 'approved' };
    if (memberId && memberId !== 'all') {
      where.memberId = memberId;
    }

    const milestones = await prisma.communityMilestone.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(milestones);
  } catch (error: unknown) {
    console.error('GET /api/milestones error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/milestones – create a new community milestone
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req as unknown as Request);
    const sizeError = await checkPayloadSize(req as unknown as Request);
    if (sizeError) return sizeError;
    const rl = checkRateLimit('milestone:' + session.user.id, RATE_LIMIT_POLICIES.milestone);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await req.json();
    const result = milestoneSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { memberId, title, description, eventDate, category, sourceUrl } = result.data;

    const modResult = checkContentModeration(title + ' ' + description);
    if (!modResult.isAllowed) {
      logSecurityEvent({ event: 'moderation_blocked', ip, userId: session.user.id, detail: modResult.flagReason, endpoint: '/api/milestones' });
      return NextResponse.json({ error: modResult.guidanceMessage }, { status: 422 });
    }

    const milestone = await prisma.communityMilestone.create({
      data: {
        memberId: memberId || null,
        memberName: memberId || 'All Seven',
        userName: session.user.name || 'Kind Supporter',
        userId: session.user.id,
        userAvatar: session.user.image || null,
        title: title.trim(),
        description: description.trim(),
        eventDate: eventDate.trim(),
        category: category || 'Milestone',
        sourceUrl: sourceUrl?.trim() || null,
        status: 'pending',
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/milestones error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/milestones – like a milestone
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit('like:' + session.user.id, RATE_LIMIT_POLICIES.like);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await req.json();
    const result = likeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const { id: milestoneId } = result.data;
    const userId = session.user.id;

    const existingLike = await prisma.milestoneLike.findUnique({
      where: {
        userId_milestoneId: {
          userId,
          milestoneId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.milestoneLike.delete({ where: { id: existingLike.id } }),
        prisma.communityMilestone.update({
          where: { id: milestoneId },
          data: { likesCount: { decrement: 1 } }
        })
      ]);
    } else {
      // Like
      await prisma.$transaction([
        prisma.milestoneLike.create({ data: { userId, milestoneId } }),
        prisma.communityMilestone.update({
          where: { id: milestoneId },
          data: { likesCount: { increment: 1 } }
        })
      ]);
    }

    const updated = await prisma.communityMilestone.findUnique({ where: { id: milestoneId } });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('PATCH /api/milestones error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
