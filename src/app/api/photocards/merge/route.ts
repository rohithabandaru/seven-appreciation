import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — merge localStorage card IDs into the database
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { cardIds } = await req.json();
    if (!Array.isArray(cardIds)) {
      return NextResponse.json({ error: "cardIds array required" }, { status: 400 });
    }
    if (cardIds.length > 0) {
      await prisma.unlockedPhotocard.createMany({
        data: cardIds.map((cardId: string) => ({
          userId: session.user.id,
          cardId,
        })),
        skipDuplicates: true,
      });
    }
    // Return full merged set
    const records = await prisma.unlockedPhotocard.findMany({
      where: { userId: session.user.id },
      select: { cardId: true },
    });
    return NextResponse.json({ cardIds: records.map((r) => r.cardId) });
  } catch (error) {
    console.error("Failed to merge photocards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
