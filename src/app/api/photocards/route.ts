import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — return user's unlocked card IDs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ cardIds: [] });
    }
    const records = await prisma.unlockedPhotocard.findMany({
      where: { userId: session.user.id },
      select: { cardId: true },
    });
    return NextResponse.json({ cardIds: records.map((r) => r.cardId) });
  } catch (error) {
    console.error("Failed to fetch photocards:", error);
    return NextResponse.json({ cardIds: [] });
  }
}

// POST — unlock cards for the current user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { cardIds } = await req.json();
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json({ error: "cardIds array required" }, { status: 400 });
    }
    // Upsert each card (ignore duplicates)
    await prisma.unlockedPhotocard.createMany({
      data: cardIds.map((cardId: string) => ({
        userId: session.user.id,
        cardId,
      })),
      skipDuplicates: true,
    });
    // Return full set
    const records = await prisma.unlockedPhotocard.findMany({
      where: { userId: session.user.id },
      select: { cardId: true },
    });
    return NextResponse.json({ cardIds: records.map((r) => r.cardId) });
  } catch (error) {
    console.error("Failed to unlock photocards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
