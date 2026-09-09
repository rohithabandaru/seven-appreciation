import { prisma } from '@/lib/prisma';
import { BadgeDefinition, BadgeType } from '@/types';
import { BADGE_DEFINITIONS } from './badge-definitions';

export { BADGE_DEFINITIONS };

/**
 * Evaluates streaks & check-ins to award any newly earned badges to the user.
 * Safe against duplicate insertions and returns only the newly unlocked badges.
 */
export async function evaluateAndAwardBadges(
  userId: string,
  currentStreak: number,
  totalCheckIns: number,
  db: typeof prisma = prisma
): Promise<BadgeDefinition[]> {
  const existingBadges = await db.userBadge.findMany({
    where: { userId },
    select: { badgeType: true },
  });

  const existingTypes = new Set(existingBadges.map((b: { badgeType: string }) => b.badgeType));
  const newBadgesToAward: BadgeType[] = [];

  if (totalCheckIns >= 1 && !existingTypes.has('FIRST_SPARK')) {
    newBadgesToAward.push('FIRST_SPARK');
  }

  if (currentStreak >= 3 && !existingTypes.has('THREE_DAY_STREAK')) {
    newBadgesToAward.push('THREE_DAY_STREAK');
  }

  if (currentStreak >= 7 && !existingTypes.has('SEVEN_DAY_STREAK')) {
    newBadgesToAward.push('SEVEN_DAY_STREAK');
  }

  if (currentStreak >= 14 && !existingTypes.has('FOURTEEN_DAY_STREAK')) {
    newBadgesToAward.push('FOURTEEN_DAY_STREAK');
  }

  if (currentStreak >= 30 && !existingTypes.has('THIRTY_DAY_STREAK')) {
    newBadgesToAward.push('THIRTY_DAY_STREAK');
  }

  if (newBadgesToAward.length === 0) {
    return [];
  }

  const createdBadges: BadgeDefinition[] = [];

  for (const badgeType of newBadgesToAward) {
    try {
      await db.userBadge.create({
        data: {
          userId,
          badgeType,
        },
      });
      createdBadges.push(BADGE_DEFINITIONS[badgeType]);
    } catch {
      // Ignore unique constraint race conditions
    }
  }

  return createdBadges;
}
