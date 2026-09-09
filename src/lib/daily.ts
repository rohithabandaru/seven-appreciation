import { prisma } from '@/lib/prisma';
import { MemberSlug } from '@/types';

export interface PromptSeed {
  question: string;
  category: string;
  memberId?: MemberSlug | null;
}

export const CURATED_PROMPT_POOL: PromptSeed[] = [
  {
    question: 'Which ENHYPEN song was the soundtrack to your most unforgettable memory, and why?',
    category: 'MUSIC & MEMORY',
    memberId: null,
  },
  {
    question: 'What is a small detail about Heeseung that always makes your day a little brighter?',
    category: 'MEMBER LOVE',
    memberId: 'heeseung',
  },
  {
    question: 'If you could thank Jay for one moment of comfort or inspiration, what would you say?',
    category: 'GRATITUDE',
    memberId: 'jay',
  },
  {
    question: 'What is something Jake said or did that made you feel proud to be an ENGENE?',
    category: 'PRIDE & JOY',
    memberId: 'jake',
  },
  {
    question: 'How has Sunghoon’s grace and quiet persistence inspired you in your own daily life?',
    category: 'INSPIRATION',
    memberId: 'sunghoon',
  },
  {
    question: 'What is your favorite warm smile or mood-lifting moment from Sunoo?',
    category: 'COMFORT',
    memberId: 'sunoo',
  },
  {
    question: 'What quality in Jungwon’s leadership touches your heart the most?',
    category: 'LEADERSHIP & LOVE',
    memberId: 'jungwon',
  },
  {
    question: 'What stage performance of Ni-ki’s left you completely breathless?',
    category: 'STAGE MAGIC',
    memberId: 'ni-ki',
  },
  {
    question: 'What is one promise you want to keep with ENHYPEN as we walk this path together?',
    category: 'ENGENE BOND',
    memberId: null,
  },
  {
    question: 'Describe ENHYPEN’s music in three words that define your journey with them.',
    category: 'COMMUNITY REFLECTION',
    memberId: null,
  },
  {
    question: 'When was a time ENHYPEN’s vocals or choreography gave you energy when you felt drained?',
    category: 'HEALING',
    memberId: null,
  },
  {
    question: 'What message of love or strength would you send to a fellow ENGENE having a tough day?',
    category: 'ENGENE KINDNESS',
    memberId: null,
  },
];

/**
 * Returns UTC calendar date formatted as YYYY-MM-DD.
 */
export function getUtcDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Returns UTC yesterday's calendar date formatted as YYYY-MM-DD.
 */
export function getUtcYesterdayString(date: Date = new Date()): string {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - 1);
  return getUtcDateString(d);
}

/**
 * Gets or creates the active daily prompt for today (UTC).
 */
export async function getOrCreateTodayPrompt(db: typeof prisma = prisma) {
  const todayStr = getUtcDateString();

  let prompt = await db.dailyPrompt.findUnique({
    where: { date: todayStr },
  });

  if (!prompt) {
    // Generate deterministic seed based on UTC day
    const daysSinceEpoch = Math.floor(new Date(todayStr).getTime() / (1000 * 60 * 60 * 24));
    const seedIndex = Math.abs(daysSinceEpoch) % CURATED_PROMPT_POOL.length;
    const seed = CURATED_PROMPT_POOL[seedIndex];

    try {
      prompt = await db.dailyPrompt.create({
        data: {
          date: todayStr,
          question: seed.question,
          category: seed.category,
          memberId: seed.memberId ?? null,
          isActive: true,
        },
      });
    } catch {
      // If concurrent request created it first, fetch it
      prompt = await db.dailyPrompt.findUnique({
        where: { date: todayStr },
      });
    }
  }

  return prompt;
}

export interface StreakCalculationResult {
  newCurrentStreak: number;
  newLongestStreak: number;
  newTotalCheckIns: number;
  isFirstCheckInToday: boolean;
}

/**
 * Calculates updated streak state based on the user's last check-in date.
 */
export function calculateNewStreak(
  lastCheckInDate: string | null,
  currentStreak: number,
  longestStreak: number,
  totalCheckIns: number,
  todayStr: string = getUtcDateString()
): StreakCalculationResult {
  if (lastCheckInDate === todayStr) {
    return {
      newCurrentStreak: currentStreak,
      newLongestStreak: longestStreak,
      newTotalCheckIns: totalCheckIns,
      isFirstCheckInToday: false,
    };
  }

  const yesterdayStr = getUtcYesterdayString(new Date(todayStr));
  let newCurrentStreak: number;

  if (lastCheckInDate === yesterdayStr) {
    newCurrentStreak = currentStreak + 1;
  } else {
    // Streak reset or first ever check-in
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(longestStreak, newCurrentStreak);
  const newTotalCheckIns = totalCheckIns + 1;

  return {
    newCurrentStreak,
    newLongestStreak,
    newTotalCheckIns,
    isFirstCheckInToday: true,
  };
}
