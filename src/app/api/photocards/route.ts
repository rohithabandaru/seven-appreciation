import { NextResponse } from "next/server";
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