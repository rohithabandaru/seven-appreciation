import { BadgeDefinition, BadgeType } from '@/types';

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  FIRST_SPARK: {
    type: 'FIRST_SPARK',
    name: 'First Spark ✨',
    description: 'Shared your first Daily ENGENE moment.',
    icon: '✨',
    thresholdDays: 1,
    category: 'spark',
  },
  THREE_DAY_STREAK: {
    type: 'THREE_DAY_STREAK',
    name: 'Three-Day Flame 🔥',
    description: 'Maintained a 3-day daily check-in streak.',
    icon: '🔥',
    thresholdDays: 3,
    category: 'streak',
  },
  SEVEN_DAY_STREAK: {
    type: 'SEVEN_DAY_STREAK',
    name: 'Seven Stars Bond 💎',
    description: 'Checked in 7 days in a row with ENHYPEN.',
    icon: '💎',
    thresholdDays: 7,
    category: 'streak',
  },
  FOURTEEN_DAY_STREAK: {
    type: 'FOURTEEN_DAY_STREAK',
    name: 'Fortnight of Devotion 🌟',
    description: 'Kept the fire burning for 14 continuous days.',
    icon: '🌟',
    thresholdDays: 14,
    category: 'streak',
  },
  THIRTY_DAY_STREAK: {
    type: 'THIRTY_DAY_STREAK',
    name: 'Solar Radiance 👑',
    description: 'Reached a monumental 30-day daily check-in streak.',
    icon: '👑',
    thresholdDays: 30,
    category: 'streak',
  },
};
