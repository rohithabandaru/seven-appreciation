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

    // Ensure a pack-claim row exists for today.
    await prisma.packClaim.upsert({
      where: { userId_day: { userId, day } },
      update: {},
      create: { userId, day, packsOpened: 0 },
    });

    // Reroll until the pack contains at least one card the user has not
    // unlocked yet, so an all-duplicate pack never wastes a daily slot.
    // The bound prevents an infinite loop when a user has (nearly) everything.
    const MAX_REROLLS = 50;
    let pulled = pickPackCards();
    let ownedSet = new Set<string>();
    for (let attempt = 0; attempt < MAX_REROLLS; attempt++) {
      const owned = await prisma.unlockedPhotocard.findMany({
        where: { userId, cardId: { in: pulled.map((c) => c.id) } },
        select: { cardId: true },
      });
      ownedSet = new Set(owned.map((r) => r.cardId));
      if (pulled.some((c) => !ownedSet.has(c.id))) {
        break;
      }
      pulled = pickPackCards();
    }

    // Atomic daily gate: updateMany only succeeds while the user still has
    // packs left today, so concurrent requests cannot exceed the limit.
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