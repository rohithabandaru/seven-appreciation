import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_PACKS_PER_DAY,
  getDayKey,
  pickPackCards,
} from "@/lib/photocards";
import {
  checkRateLimit,
  RATE_LIMIT_POLICIES,
  rateLimitResponse,
  readJsonBodySizeLimited,
} from "@/lib/rate-limit";

// POST — open one booster pack (server-generated cards, daily limit enforced)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const rl = await checkRateLimit('pack:' + userId, RATE_LIMIT_POLICIES.pack);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterMs);
    }

    const bodyResult = await readJsonBodySizeLimited<Record<string, never>>(req);
    if (!bodyResult.ok) return bodyResult.error;

    const day = getDayKey();
    const pulled = pickPackCards();

    // Atomic daily gate: updateMany only succeeds while the user still has
    // packs left today, so concurrent requests cannot exceed the limit.
    await prisma.packClaim.upsert({
      where: { userId_day: { userId, day } },
      update: {},
      create: { userId, day, packsOpened: 0 },
    });
    const gated = await prisma.packClaim.updateMany({
      where: { userId, day, packsOpened: { lt: MAX_PACKS_PER_DAY } },
      data: { packsOpened: { increment: 1 } },
    });

    if (gated.count === 0) {
      return NextResponse.json(
        { error: "Daily pack limit reached. Come back tomorrow!", remainingPacks: 0 },
        { status: 429 }
      );
    }

    await prisma.unlockedPhotocard.createMany({
      data: pulled.map((card) => ({ userId, cardId: card.id })),
      skipDuplicates: true,
    });

    const existing = await prisma.unlockedPhotocard.findMany({
      where: { userId, cardId: { in: pulled.map((c) => c.id) } },
      select: { cardId: true },
    });
    const ownedSet = new Set(existing.map((r) => r.cardId));
    const alreadyOwned = pulled.filter((c) => ownedSet.has(c.id));

    const claim = await prisma.packClaim.findUnique({
      where: { userId_day: { userId, day } },
    });
    const remainingPacks = Math.max(0, MAX_PACKS_PER_DAY - (claim?.packsOpened ?? 1));

    return NextResponse.json({
      cards: pulled,
      alreadyOwned: alreadyOwned.map((c) => c.id),
      remainingPacks,
    });
  } catch (error) {
    console.error("Failed to open pack:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}