import { PHOTOCARDS_DATA, Photocard } from '@/lib/data/photocardsData';

/**
 * Server-authoritative photocard logic.
 * The binder catalog is static data bundled with the app; the ONLY ways to
 * own cards are (a) the 3 starter cards granted at registration and (b) a
 * booster pack opened through POST /api/photocards/pack, which enforces a
 * daily limit per user. No client can unlock arbitrary cards anymore.
 */

export const MAX_PACKS_PER_DAY = 3;

export const CARDS_PER_PACK = 2;

export const STARTER_CARD_IDS = ['pc-hs-1', 'pc-jw-1', 'pc-nk-1'] as const;

/** UTC day key, e.g. "2026-09-06", used for per-user daily pack claims. */
export function getDayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function isValidCardId(id: string): boolean {
  return PHOTOCARDS_DATA.some((c) => c.id === id);
}

/**
 * Weighted rarity draw (mirrors the original booster odds):
 *  15% -> Secret/Holo pool, 30% -> Rare pool, 55% -> Common pool.
 * Player-grade RNG is fine here: the daily claim gate is the anti-abuse control.
 */
export function pickPackCards(rng: () => number = Math.random): Photocard[] {
  const getRandomCard = (): Photocard => {
    const roll = rng();
    let pool = PHOTOCARDS_DATA;
    if (roll < 0.15) {
      pool = PHOTOCARDS_DATA.filter((c) => c.rarity === 'Secret' || c.rarity === 'Holo');
    } else if (roll < 0.45) {
      pool = PHOTOCARDS_DATA.filter((c) => c.rarity === 'Rare');
    } else {
      pool = PHOTOCARDS_DATA.filter((c) => c.rarity === 'Common');
    }
    if (pool.length === 0) pool = PHOTOCARDS_DATA;
    return pool[Math.floor(rng() * pool.length)];
  };

  const card1 = getRandomCard();
  let card2 = getRandomCard();
  while (card2.id === card1.id && PHOTOCARDS_DATA.length > 1) {
    card2 = getRandomCard();
  }
  return [card1, card2];
}