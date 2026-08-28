import { MEMBERS_DATA } from '@/lib/data/membersData';
import { UpcomingBirthday } from '@/types';

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11
};

export function parseBirthDate(birthDate: string): { month: number; day: number; year: number } | null {
  const match = birthDate.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return null;
  return { month, day: Number(match[2]), year: Number(match[3]) };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getUpcomingBirthdays(now = new Date()): UpcomingBirthday[] {
  const today = startOfDay(now);

  return MEMBERS_DATA.map((member) => {
    const parsed = parseBirthDate(member.birthDate);
    if (!parsed) return null;

    let next = new Date(today.getFullYear(), parsed.month, parsed.day);
    if (next < today) {
      next = new Date(today.getFullYear() + 1, parsed.month, parsed.day);
    }

    const daysUntil = Math.round((next.getTime() - today.getTime()) / 86_400_000);
    const turningAge = next.getFullYear() - parsed.year;

    return {
      slug: member.slug,
      displayName: member.displayName,
      koreanName: member.koreanName,
      image: member.image,
      birthDate: member.birthDate,
      monthDay: next.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
      daysUntil,
      turningAge
    } satisfies UpcomingBirthday;
  })
    .filter((item): item is UpcomingBirthday => item !== null)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function getMemberBirthday(slug: string, now = new Date()) {
  return getUpcomingBirthdays(now).find((item) => item.slug === slug) ?? null;
}

export function formatBirthdayLabel(birthday: UpcomingBirthday) {
  if (birthday.daysUntil === 0) return `Today is ${birthday.displayName}'s birthday`;
  if (birthday.daysUntil === 1) return `${birthday.displayName}'s birthday is tomorrow`;
  return `${birthday.daysUntil} days until ${birthday.displayName}'s birthday`;
}
