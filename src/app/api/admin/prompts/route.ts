import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminPromptSchema } from '@/lib/validations';
import { readJsonBodySizeLimited } from '@/lib/rate-limit';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompts = await prisma.dailyPrompt.findMany({
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { checkIns: true },
        },
      },
      take: 90,
    });

    return NextResponse.json({
      data: prompts.map((p: any) => ({
        id: p.id,
        date: p.date,
        question: p.question,
        category: p.category,
        memberId: p.memberId,
        isActive: p.isActive,
        createdAt: p.createdAt,
        checkInsCount: p._count.checkIns,
      })),
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bodyResult = await readJsonBodySizeLimited<Record<string, unknown>>(request);
    if (!bodyResult.ok) return bodyResult.error;

    const parseResult = adminPromptSchema.safeParse(bodyResult.data);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { date, question, category, memberId, isActive } = parseResult.data;

    // Check date uniqueness
    const existing = await prisma.dailyPrompt.findUnique({ where: { date } });
    if (existing) {
      return NextResponse.json(
        { error: `A prompt already exists for ${date}. Please pick a different date or edit the existing prompt.` },
        { status: 409 }
      );
    }

    const prompt = await prisma.dailyPrompt.create({
      data: {
        date,
        question,
        category,
        memberId: memberId ?? null,
        isActive,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
