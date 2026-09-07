export type PhotocardRarity = 'Common' | 'Rare' | 'Holo' | 'Secret';

export interface Photocard {
  id: string;
  memberSlug: string;
  memberName: string;
  era: 'Romance : Untold' | 'Dark Blood' | 'Manifesto : Day 1' | 'Dimension : Dilemma' | 'Border : Day One' | 'Special Edition';
  cardName: string;
  rarity: PhotocardRarity;
  image: string;
  quote: string;
  signature: string;
  cardNumber: string;
  accentColor: string;
}

/**
 * Every card references a real, distinct photo of the member/group.
 * No color-shifted "variants" of the same base photo are used.
 * Commons had limited distinct photos per member, so Jay, Jake and Sunoo
 * each have a single card and the collection totals 23.
 */
export const PHOTOCARDS_DATA: Photocard[] = [
  // ================= HEESEUNG (5 CARDS) =================
  {
    id: 'pc-hs-1',
    memberSlug: 'heeseung',
    memberName: 'Heeseung',
    era: 'Romance : Untold',
    cardName: 'Moonlight Serenade Heeseung',
    rarity: 'Holo',
    image: '/images/photocards/heeseung_heeseung.jpg',
    quote: 'Singing with all my heart for ENGENE.',
    signature: 'HeeSeung ★',
    cardNumber: 'EN-001',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-hs-2',
    memberSlug: 'heeseung',
    memberName: 'Heeseung',
    era: 'Dark Blood',
    cardName: 'Crimson Velvet Heeseung',
    rarity: 'Rare',
    image: '/images/photocards/heeseung_heeseung_2.jpg',
    quote: 'Even in darkness, our melody will find you.',
    signature: 'HeeSeung ★',
    cardNumber: 'EN-002',
    accentColor: '#E11D48'
  },
  {
    id: 'pc-hs-3',
    memberSlug: 'heeseung',
    memberName: 'Heeseung',
    era: 'Manifesto : Day 1',
    cardName: 'Street Vibe Heeseung',
    rarity: 'Common',
    image: '/images/photocards/heeseung_heeseung_3.jpg',
    quote: 'Shouting out our truth together.',
    signature: 'HeeSeung ★',
    cardNumber: 'EN-003',
    accentColor: '#3B82F6'
  },
  {
    id: 'pc-hs-4',
    memberSlug: 'heeseung',
    memberName: 'Heeseung',
    era: 'Dimension : Dilemma',
    cardName: 'Acoustic Soul Heeseung',
    rarity: 'Secret',
    image: '/images/photocards/heeseung_heeseung_4.jpg',
    quote: 'Every chord connects us across borders.',
    signature: 'HeeSeung ★',
    cardNumber: 'EN-004',
    accentColor: '#EC4899'
  },
  {
    id: 'pc-hs-5',
    memberSlug: 'heeseung',
    memberName: 'Heeseung',
    era: 'Border : Day One',
    cardName: 'Golden Dawn Heeseung',
    rarity: 'Common',
    image: '/images/photocards/heeseung_heeseung_new_1.jpg',
    quote: 'The first chapter of our eternal journey.',
    signature: 'HeeSeung ★',
    cardNumber: 'EN-005',
    accentColor: '#F59E0B'
  },

  // ================= JAY (1 CARD) =================
  {
    id: 'pc-jay-1',
    memberSlug: 'jay',
    memberName: 'Jay',
    era: 'Romance : Untold',
    cardName: 'Electric Heart Jay',
    rarity: 'Holo',
    image: '/images/photocards/jay_jay.jpg',
    quote: 'Passionate and fierce, every single chord.',
    signature: 'JAY 🎸',
    cardNumber: 'EN-006',
    accentColor: '#EC4899'
  },

  // ================= JAKE (1 CARD) =================
  {
    id: 'pc-jake-1',
    memberSlug: 'jake',
    memberName: 'Jake',
    era: 'Romance : Untold',
    cardName: 'Golden Hour Jake',
    rarity: 'Holo',
    image: '/images/photocards/jake_jake.jpg',
    quote: 'Your smile makes every rainy day brighter.',
    signature: 'JAKE 🐶',
    cardNumber: 'EN-007',
    accentColor: '#F59E0B'
  },

  // ================= SUNGHOON (5 CARDS) =================
  {
    id: 'pc-sh-1',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Dark Blood',
    cardName: 'Ice Prince Sunghoon',
    rarity: 'Secret',
    image: '/images/photocards/sunghoon_sunghoon.jpg',
    quote: 'Graceful on the ice, unstoppable on stage.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-008',
    accentColor: '#06B6D4'
  },
  {
    id: 'pc-sh-2',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Manifesto : Day 1',
    cardName: 'Diamond Glare Sunghoon',
    rarity: 'Common',
    image: '/images/photocards/sunghoon_sunghoon_4.jpg',
    quote: 'Focus on your dreams with clear eyes.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-009',
    accentColor: '#8B5CF6'
  },
  {
    id: 'pc-sh-3',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Border : Day One',
    cardName: 'Frost Gentle Sunghoon',
    rarity: 'Common',
    image: '/images/photocards/sunghoon_sunghoon_new_2.jpg',
    quote: 'Gliding toward our shared future.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-010',
    accentColor: '#3B82F6'
  },
  {
    id: 'pc-sh-4',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Romance : Untold',
    cardName: 'Starlight Sunghoon',
    rarity: 'Rare',
    image: '/images/photocards/sunghoon_sunghoon_real_1.jpg',
    quote: 'Trust the process and stay true to yourself.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-011',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-sh-5',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Dimension : Dilemma',
    cardName: 'Violet Prism Sunghoon',
    rarity: 'Holo',
    image: '/images/photocards/sunghoon_sunghoon_real_2.jpg',
    quote: 'Perfection is born from daily discipline.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-012',
    accentColor: '#8B5CF6'
  },

  // ================= SUNOO (1 CARD) =================
  {
    id: 'pc-sn-1',
    memberSlug: 'sunoo',
    memberName: 'Sunoo',
    era: 'Romance : Untold',
    cardName: 'Radiant Sunshine Sunoo',
    rarity: 'Holo',
    image: '/images/photocards/sunoo_sunoo.jpg',
    quote: 'Bringing warm happiness to your day! ✨',
    signature: 'SUNOO ☀️',
    cardNumber: 'EN-013',
    accentColor: '#FB923C'
  },

  // ================= JUNGWON (2 CARDS) =================
  {
    id: 'pc-jw-1',
    memberSlug: 'jungwon',
    memberName: 'Jungwon',
    era: 'Dark Blood',
    cardName: 'Steadfast Leader Jungwon',
    rarity: 'Secret',
    image: '/images/photocards/jungwon_jungwon.jpg',
    quote: 'We will always protect and guide each other.',
    signature: 'JungWon 🐱',
    cardNumber: 'EN-014',
    accentColor: '#10B981'
  },
  {
    id: 'pc-jw-2',
    memberSlug: 'jungwon',
    memberName: 'Jungwon',
    era: 'Romance : Untold',
    cardName: 'Pure Anchor Jungwon',
    rarity: 'Rare',
    image: '/images/photocards/jungwon_jungwon_3.jpg',
    quote: 'Thank you for walking this path with us.',
    signature: 'JungWon 🐱',
    cardNumber: 'EN-015',
    accentColor: '#3B82F6'
  },

  // ================= NI-KI (3 CARDS) =================
  {
    id: 'pc-nk-1',
    memberSlug: 'ni-ki',
    memberName: 'Ni-ki',
    era: 'Dark Blood',
    cardName: 'Rhythm Prodigy Ni-ki',
    rarity: 'Holo',
    image: '/images/photocards/ni-ki_ni-ki.jpg',
    quote: 'Dancing with my soul, connecting through beat.',
    signature: 'NI-KI 🐆',
    cardNumber: 'EN-016',
    accentColor: '#8B5CF6'
  },
  {
    id: 'pc-nk-2',
    memberSlug: 'ni-ki',
    memberName: 'Ni-ki',
    era: 'Manifesto : Day 1',
    cardName: 'Stage Dynamo Ni-ki',
    rarity: 'Rare',
    image: '/images/photocards/ni-ki_ni-ki_3.jpg',
    quote: 'Step by step, conquering the highest peaks.',
    signature: 'NI-KI 🐆',
    cardNumber: 'EN-017',
    accentColor: '#EF4444'
  },
  {
    id: 'pc-nk-3',
    memberSlug: 'ni-ki',
    memberName: 'Ni-ki',
    era: 'Romance : Untold',
    cardName: 'Golden Motion Ni-ki',
    rarity: 'Common',
    image: '/images/photocards/ni-ki_ni-ki_3.png.jpg',
    quote: 'Creating magic in every routine.',
    signature: 'NI-KI 🐆',
    cardNumber: 'EN-018',
    accentColor: '#F59E0B'
  },

  // ================= SPECIAL EDITION GROUP CARDS (5 CARDS) =================
  {
    id: 'pc-all-1',
    memberSlug: 'all',
    memberName: 'ENHYPEN',
    era: 'Special Edition',
    cardName: 'Eternal Seven Legend Card',
    rarity: 'Secret',
    image: '/images/photocards/all_all_members.jpg',
    quote: 'Seven boys, one destiny, infinite memories.',
    signature: 'ENHYPEN x ENGENE Forever',
    cardNumber: 'EN-SECRET-01',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-all-2',
    memberSlug: 'all',
    memberName: 'ENHYPEN',
    era: 'Special Edition',
    cardName: 'Evergreen Energy Seven',
    rarity: 'Secret',
    image: '/images/photocards/all_all_real_3.jpg',
    quote: 'Seven lights burning bright on one stage.',
    signature: 'The Seven Stars ★',
    cardNumber: 'EN-SECRET-02',
    accentColor: '#10B981'
  },
  {
    id: 'pc-all-3',
    memberSlug: 'all',
    memberName: 'ENHYPEN',
    era: 'Special Edition',
    cardName: 'Golden Disc Seven',
    rarity: 'Secret',
    image: '/images/photocards/all_all_real_4.jpg',
    quote: 'Awarded for the love we share together.',
    signature: 'ENHYPEN OFFICIAL',
    cardNumber: 'EN-SECRET-03',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-all-4',
    memberSlug: 'all',
    memberName: 'ENHYPEN',
    era: 'Special Edition',
    cardName: 'First Dawn Seven',
    rarity: 'Secret',
    image: '/images/photocards/all_all_real_5.jpg',
    quote: 'Where our journey first caught the light.',
    signature: 'Border : Day One ★',
    cardNumber: 'EN-SECRET-04',
    accentColor: '#3B82F6'
  },
  {
    id: 'pc-all-5',
    memberSlug: 'all',
    memberName: 'ENHYPEN',
    era: 'Special Edition',
    cardName: 'Parade of Stars Seven',
    rarity: 'Secret',
    image: '/images/photocards/all_all_real_6.jpg',
    quote: 'Taking our light to every corner of the world.',
    signature: 'ENHYPEN OFFICIAL',
    cardNumber: 'EN-SECRET-05',
    accentColor: '#E11D48'
  }
];
