import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateTodayPrompt, getUtcDateString } from '@/lib/daily';

export async function GET(request: Request) {
  try {
    const prompt = await getOrCreateTodayPrompt();
    if (!prompt) {
      return NextResponse.json({ error: 'No active prompt found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Fetch user check-in, user streak, today's community count, and paginated community check-ins
    const [userCheckIn, streak, communityCount, recentCheckIns] = await Promise.all([
      userId
        ? prisma.dailyCheckIn.findUnique({
            where: {
              userId_promptId: {
                userId,
                promptId: prompt.id,
              },
            },
          })
        : null,
      userId
        ? prisma.userStreak.findUnique({
            where: { userId },
          })
        : null,
      prisma.dailyCheckIn.count({
        where: {
          promptId: prompt.id,
          status: 'approved',
        },
      }),
      prisma.dailyCheckIn.findMany({
        where: {
          promptId: prompt.id,
          status: 'approved',
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      prompt: {
        id: prompt.id,
        date: prompt.date,
        question: prompt.question,
        category: prompt.category,
        memberId: prompt.memberId,
        isActive: prompt.isActive,
      },
      completed: !!userCheckIn,
      userResponse: userCheckIn
        ? {
            id: userCheckIn.id,
            message: userCheckIn.message,
            createdAt: userCheckIn.createdAt,
          }
        : null,
      streak: streak
        ? {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            lastCheckInDate: streak.lastCheckInDate,
            totalCheckIns: streak.totalCheckIns,
          }
        : {
            currentStreak: 0,
            longestStreak: 0,
            lastCheckInDate: null,
            totalCheckIns: 0,
          },
      communityCount,
      recentResponses: recentCheckIns.map((ci) => ({
        id: ci.id,
        message: ci.message,
        createdAt: ci.createdAt,
        user: {
          name: ci.user?.name || 'Kind ENGENE',
          image: ci.user?.image || null,
        },
      })),
      pagination: {
        page,
        limit,
        total: communityCount,
        totalPages: Math.ceil(communityCount / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching today prompt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
