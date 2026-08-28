import { ModerationCheckResult } from '@/types';

// Comparative / Ranking patterns that violate "Support without attacking / Appreciate without comparing"
const COMPARISON_REGEXES: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\b(better than|best member|worst member|worse than|more talented than|less talented than)\b/i,
    reason: 'Comparison / Member Ranking'
  },
  {
    pattern: /\b(who is better|who is the best|who deserves more|why is .* worse)\b/i,
    reason: 'Member Ranking / Versus Query'
  },
  {
    pattern: /\b(deserves more than|should be replaced|carried the group|ruining the group|useless member)\b/i,
    reason: 'Divisive Member Comparison'
  },
  {
    pattern: /\b(if you (like|love|support) .* you (should|must) (hate|dislike|attack))\b/i,
    reason: 'Fan War / Divisive Mobbing'
  },
  {
    pattern: /\b(go attack|hate train|boycott|solo stan war|flop member|overrated|underrated compared to)\b/i,
    reason: 'Fan War / Targeted Attack'
  }
];

// Personal privacy / doxxing detection
const PRIVACY_REGEXES: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
    reason: 'Phone Number Detected (Privacy Protection)'
  },
  {
    pattern: /\b(home address|private phone|hotel location|flight schedule|hotel room|dorm address)\b/i,
    reason: 'Private Location / Schedule Leak'
  }
];

// Profanity / Abuse keywords — only words that are almost exclusively used abusively
const PROFANITY_REGEX = /\b(bastard|bitch|slut)\b/i;

export function checkContentModeration(content: string): ModerationCheckResult {
  const trimmed = content.trim();

  if (!trimmed) {
    return {
      isAllowed: false,
      score: 1.0,
      flagReason: 'Empty Content',
      guidanceMessage: 'Please enter a non-empty message.'
    };
  }

  // 1. Check for Comparisons and Fan War behaviors
  for (const item of COMPARISON_REGEXES) {
    if (item.pattern.test(trimmed)) {
      return {
        isAllowed: false,
        score: 0.95,
        flagReason: item.reason,
        guidanceMessage:
          'Our core principle is: "Support without attacking anyone else." Messages comparing, ranking, or putting down any member or fan group are strictly prohibited.'
      };
    }
  }

  // 2. Check for Privacy Leaks
  for (const item of PRIVACY_REGEXES) {
    if (item.pattern.test(trimmed)) {
      return {
        isAllowed: false,
        score: 0.99,
        flagReason: item.reason,
        guidanceMessage:
          'For safety and privacy, posting private personal information (phone numbers, addresses, private schedules) is not allowed.'
      };
    }
  }

  // 3. Check for Direct Profanity / Harassment
  if (PROFANITY_REGEX.test(trimmed)) {
    return {
      isAllowed: false,
      score: 0.85,
      flagReason: 'Inappropriate or Abusive Language',
      guidanceMessage:
        'Please keep your message warm, respectful, and encouraging. Hateful or abusive language is prohibited.'
    };
  }

  // Clean and approved
  return {
    isAllowed: true,
    score: 0.0,
    guidanceMessage: 'Message aligns with our community guidelines!'
  };
}
