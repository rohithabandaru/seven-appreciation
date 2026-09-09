import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dailyCheckInSchema } from '@/lib/validations';
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize, readJsonBodySizeLimited } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';
import { checkContentModeration } from '@/lib/moderation';
import { calculateNewStreak, getUtcDateString } from '@/lib/daily';
import { evaluateAndAwardBadges } from '@/lib/badges';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const ip = getClientIp(request);
    const sizeError = await checkPayloadSize(request);
    if (sizeError) return sizeError;

    const rl = await checkRateLimit(`dailyCheckIn:${userId}`, RATE_LIMIT_POLICIES.dailyCheckIn);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const bodyResult = await readJsonBodySizeLimited<Record<string, unknown>>(request);
    if (!bodyResult.ok) return bodyResult.error;

    const parseResult = dailyCheckInSchema.safeParse(bodyResult.data);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { promptId, message } = parseResult.data;

    // Content moderation check
    const modResult = checkContentModeration(message);
    if (!modResult.isAllowed) {
      logSecurityEvent({
        event: 'moderation_blocked',
        ip,
        userId,
        detail: modResult.flagReason,
        endpoint: '/api/daily/check-in',
      });
      return NextResponse.json({ error: modResult.guidanceMessage }, { status: 422 });
    }

    // Verify prompt exists and is active
    const prompt = await prisma.dailyPrompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt || !prompt.isActive) {
      return NextResponse.json({ error: 'Daily prompt not found or inactive' }, { status: 404 });
    }

    // Check if user already submitted for this prompt
    const existingCheckIn = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_promptId: {
          userId,
          promptId,
        },
      },
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { error: 'You have already checked in for this daily prompt today.' },
        { status: 409 }
      );
    }

    const todayStr = getUtcDateString();

    // Fetch existing streak record
    const existingStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    const streakCalc = calculateNewStreak(
      existingStreak?.lastCheckInDate ?? null,
      existingStreak?.currentStreak ?? 0,
      existingStreak?.longestStreak ?? 0,
      existingStreak?.totalCheckIns ?? 0,
      todayStr
    );

    // Run in transaction: create check-in and update/create streak
    const [checkIn, updatedStreak] = await prisma.$transaction([
      prisma.dailyCheckIn.create({
        data: {
          userId,
          promptId,
          message: message.trim(),
          status: 'approved',
        },
      }),
      prisma.userStreak.upsert({
        where: { userId },
        create: {
          userId,
          currentStreak: streakCalc.newCurrentStreak,
          longestStreak: streakCalc.newLongestStreak,
          lastCheckInDate: todayStr,
          totalCheckIns: streakCalc.newTotalCheckIns,
        },
        update: {
          currentStreak: streakCalc.newCurrentStreak,
          longestStreak: streakCalc.newLongestStreak,
          lastCheckInDate: todayStr,
          totalCheckIns: streakCalc.newTotalCheckIns,
        },
      }),
    ]);

    // Check and award badges
    const newBadges = await evaluateAndAwardBadges(
      userId,
      updatedStreak.currentStreak,
      updatedStreak.totalCheckIns
    );

    return NextResponse.json(
      {
        checkIn: {
          id: checkIn.id,
          promptId: checkIn.promptId,
          message: checkIn.message,
          createdAt: checkIn.createdAt,
        },
        streak: {
          currentStreak: updatedStreak.currentStreak,
          longestStreak: updatedStreak.longestStreak,
          lastCheckInDate: updatedStreak.lastCheckInDate,
          totalCheckIns: updatedStreak.totalCheckIns,
        },
        newBadges,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in daily check-in:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
