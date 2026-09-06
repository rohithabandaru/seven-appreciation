import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = dayKey(new Date());

    const weekStart = dayKey(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
    const monthStart = dayKey(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));

    const [todayRows, weekRows, monthRows, totalUnique] = await Promise.all([
      prisma.visitLog.count({ where: { day: today } }),
      prisma.visitLog.count({ where: { day: { gte: weekStart } } }),
      prisma.visitLog.count({ where: { day: { gte: monthStart } } }),
      prisma.visitLog.groupBy({ by: ['fingerprint'], _count: { _all: true } }),
    ]);

    const last7Days = await prisma.visitLog.groupBy({
      by: ['day'],
      where: { day: { gte: weekStart } },
      _count: { _all: true },
      orderBy: { day: 'asc' },
    });

    const series: { day: string; visits: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
      const found = last7Days.find((r) => r.day === d);
      series.push({ day: d, visits: found?._count._all ?? 0 });
    }

    return NextResponse.json({
      today: todayRows,
      week: weekRows,
      month: monthRows,
      totalUnique: totalUnique.length,
      series,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}