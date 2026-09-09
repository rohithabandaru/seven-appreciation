import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [streak, badges] = await Promise.all([
      prisma.userStreak.findUnique({
        where: { userId },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        orderBy: { awardedAt: 'asc' },
      }),
    ]);

    return NextResponse.json({
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
      badges: badges.map((b) => ({
        id: b.id,
        badgeType: b.badgeType,
        awardedAt: b.awardedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
