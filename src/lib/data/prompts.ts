export const DAILY_PROMPTS = [
  "What is your absolute favorite vocal performance or live moment by Heeseung?",
  "Which Jay guitar solo or iconic stage outfit lives rent-free in your mind?",
  "What is a moment where Jake made you smile or feel comforted?",
  "Share your favorite Sunghoon figure skating or stage performance memory!",
  "What Sunoo expression or moment never fails to brighten your day?",
  "Which Jungwon leadership moment or cute dimple moment made you proud?",
  "What Ni-ki dance performance or choreography shocked you the most?",
  "If you could describe ENHYPEN's music journey in three words, what would they be?",
  "What was the first ENHYPEN song you ever listened to, and how did it feel?",
  "Share a story of how ENHYPEN's music helped you through a tough day.",
  "Which album era had your absolute favorite concept photos?",
  "If you could recommend one ENHYPEN song to a new listener, which one would it be?",
  "What is your favorite b-side track that deserves more love?",
  "Share your favorite memory from an ENHYPEN concert, tour, or live stream!",
  "What is an underrated vocal harmony or line distribution moment you adore?",
];

export function getDailyPrompt(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
}
