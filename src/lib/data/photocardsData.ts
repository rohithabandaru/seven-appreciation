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

export const PHOTOCARDS_DATA: Photocard[] = [
  // ================= HEESEUNG (5 CARDS) =================
  {
    id: 'pc-hs-1',
    memberSlug: 'heeseung',
    memberName: 'Heeseung',
    era: 'Romance : Untold',
    cardName: 'Moonlight Serenade Heeseung',
    rarity: 'Holo',
    image: '/images/members/heeseung.jpg',
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
    image: '/images/members/heeseung_2.jpg',
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
    image: '/images/members/heeseung_3.jpg',
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
    image: '/images/members/heeseung_4.jpg',
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
    cardName: 'Dawn Horizon Heeseung',
    rarity: 'Common',
    image: '/images/members/heeseung.jpg',
    quote: 'The first chapter of our eternal journey.',
    signature: 'HeeSeung ★',
    cardNumber: 'EN-005',
    accentColor: '#8B5CF6'
  },

  // ================= JAY (5 CARDS) =================
  {
    id: 'pc-jay-1',
    memberSlug: 'jay',
    memberName: 'Jay',
    era: 'Romance : Untold',
    cardName: 'Electric Heart Jay',
    rarity: 'Holo',
    image: '/images/members/jay.jpg',
    quote: 'Passionate and fierce, every single chord.',
    signature: 'JAY 🎸',
    cardNumber: 'EN-006',
    accentColor: '#EC4899'
  },
  {
    id: 'pc-jay-2',
    memberSlug: 'jay',
    memberName: 'Jay',
    era: 'Dark Blood',
    cardName: 'Midnight Rebel Jay',
    rarity: 'Rare',
    image: '/images/members/jay_3.jpg',
    quote: 'Never let anyone dim your inner fire.',
    signature: 'JAY 🎸',
    cardNumber: 'EN-007',
    accentColor: '#8B5CF6'
  },
  {
    id: 'pc-jay-3',
    memberSlug: 'jay',
    memberName: 'Jay',
    era: 'Manifesto : Day 1',
    cardName: 'Rock Star Spirit Jay',
    rarity: 'Common',
    image: '/images/members/jay_concert_1.jpg',
    quote: 'Play loud, live with conviction.',
    signature: 'JAY 🎸',
    cardNumber: 'EN-008',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-jay-4',
    memberSlug: 'jay',
    memberName: 'Jay',
    era: 'Dimension : Dilemma',
    cardName: 'Neon Wave Jay',
    rarity: 'Rare',
    image: '/images/members/jay.jpg',
    quote: 'Unstoppable rhythm, unstoppable dream.',
    signature: 'JAY 🎸',
    cardNumber: 'EN-009',
    accentColor: '#10B981'
  },
  {
    id: 'pc-jay-5',
    memberSlug: 'jay',
    memberName: 'Jay',
    era: 'Border : Day One',
    cardName: 'Origin Fire Jay',
    rarity: 'Secret',
    image: '/images/members/jay_3.jpg',
    quote: 'From the first beat to infinity.',
    signature: 'JAY 🎸',
    cardNumber: 'EN-010',
    accentColor: '#EF4444'
  },

  // ================= JAKE (5 CARDS) =================
  {
    id: 'pc-jake-1',
    memberSlug: 'jake',
    memberName: 'Jake',
    era: 'Romance : Untold',
    cardName: 'Golden Hour Jake',
    rarity: 'Holo',
    image: '/images/members/jake.jpg',
    quote: 'Your smile makes every rainy day brighter.',
    signature: 'JAKE 🐶',
    cardNumber: 'EN-011',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-jake-2',
    memberSlug: 'jake',
    memberName: 'Jake',
    era: 'Dimension : Dilemma',
    cardName: 'Summer Breeze Jake',
    rarity: 'Rare',
    image: '/images/members/jake_2.jpg',
    quote: 'Keep running towards what you love.',
    signature: 'JAKE 🐶',
    cardNumber: 'EN-012',
    accentColor: '#10B981'
  },
  {
    id: 'pc-jake-3',
    memberSlug: 'jake',
    memberName: 'Jake',
    era: 'Dark Blood',
    cardName: 'Twilight Charm Jake',
    rarity: 'Common',
    image: '/images/members/jake_concert_1.jpg',
    quote: 'Always here to cheer you on.',
    signature: 'JAKE 🐶',
    cardNumber: 'EN-013',
    accentColor: '#3B82F6'
  },
  {
    id: 'pc-jake-4',
    memberSlug: 'jake',
    memberName: 'Jake',
    era: 'Manifesto : Day 1',
    cardName: 'Courageous Voice Jake',
    rarity: 'Rare',
    image: '/images/members/jake.jpg',
    quote: 'Believe in yourself and take the leap.',
    signature: 'JAKE 🐶',
    cardNumber: 'EN-014',
    accentColor: '#8B5CF6'
  },
  {
    id: 'pc-jake-5',
    memberSlug: 'jake',
    memberName: 'Jake',
    era: 'Border : Day One',
    cardName: 'First Light Jake',
    rarity: 'Secret',
    image: '/images/members/jake_2.jpg',
    quote: 'Together we make the impossible real.',
    signature: 'JAKE 🐶',
    cardNumber: 'EN-015',
    accentColor: '#EC4899'
  },

  // ================= SUNGHOON (5 CARDS) =================
  {
    id: 'pc-sh-1',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Dark Blood',
    cardName: 'Ice Prince Sunghoon',
    rarity: 'Secret',
    image: '/images/members/sunghoon.jpg',
    quote: 'Graceful on the ice, unstoppable on stage.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-016',
    accentColor: '#06B6D4'
  },
  {
    id: 'pc-sh-2',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Romance : Untold',
    cardName: 'Starlight Sunghoon',
    rarity: 'Rare',
    image: '/images/members/sunghoon_2.jpg',
    quote: 'Trust the process and stay true to yourself.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-017',
    accentColor: '#6366F1'
  },
  {
    id: 'pc-sh-3',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Manifesto : Day 1',
    cardName: 'Diamond Glare Sunghoon',
    rarity: 'Common',
    image: '/images/members/sunghoon_4.jpg',
    quote: 'Focus on your dreams with clear eyes.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-018',
    accentColor: '#8B5CF6'
  },
  {
    id: 'pc-sh-4',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Dimension : Dilemma',
    cardName: 'Pure Elegance Sunghoon',
    rarity: 'Holo',
    image: '/images/members/sunghoon_concert_1.jpg',
    quote: 'Perfection is born from daily discipline.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-019',
    accentColor: '#3B82F6'
  },
  {
    id: 'pc-sh-5',
    memberSlug: 'sunghoon',
    memberName: 'Sunghoon',
    era: 'Border : Day One',
    cardName: 'Frost Glaze Sunghoon',
    rarity: 'Common',
    image: '/images/members/sunghoon.jpg',
    quote: 'Gliding toward our shared future.',
    signature: 'SungHoon ❄️',
    cardNumber: 'EN-020',
    accentColor: '#10B981'
  },

  // ================= SUNOO (5 CARDS) =================
  {
    id: 'pc-sn-1',
    memberSlug: 'sunoo',
    memberName: 'Sunoo',
    era: 'Romance : Untold',
    cardName: 'Radiant Sunshine Sunoo',
    rarity: 'Holo',
    image: '/images/members/sunoo.jpg',
    quote: 'Bringing warm happiness to your day! ✨',
    signature: 'SUNOO ☀️',
    cardNumber: 'EN-021',
    accentColor: '#FB923C'
  },
  {
    id: 'pc-sn-2',
    memberSlug: 'sunoo',
    memberName: 'Sunoo',
    era: 'Border : Day One',
    cardName: 'Sweet Aura Sunoo',
    rarity: 'Rare',
    image: '/images/members/sunoo_2.jpg',
    quote: 'Never forget to smile and be kind.',
    signature: 'SUNOO ☀️',
    cardNumber: 'EN-022',
    accentColor: '#F43F5E'
  },
  {
    id: 'pc-sn-3',
    memberSlug: 'sunoo',
    memberName: 'Sunoo',
    era: 'Dark Blood',
    cardName: 'Peach Bloom Sunoo',
    rarity: 'Common',
    image: '/images/members/sunoo.jpg',
    quote: 'A flower blooming in full light.',
    signature: 'SUNOO ☀️',
    cardNumber: 'EN-023',
    accentColor: '#EC4899'
  },
  {
    id: 'pc-sn-4',
    memberSlug: 'sunoo',
    memberName: 'Sunoo',
    era: 'Dimension : Dilemma',
    cardName: 'Sunny Joy Sunoo',
    rarity: 'Rare',
    image: '/images/members/sunoo_2.jpg',
    quote: 'Laughter is the shortest distance between hearts.',
    signature: 'SUNOO ☀️',
    cardNumber: 'EN-024',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-sn-5',
    memberSlug: 'sunoo',
    memberName: 'Sunoo',
    era: 'Manifesto : Day 1',
    cardName: 'Golden Angel Sunoo',
    rarity: 'Secret',
    image: '/images/members/sunoo.jpg',
    quote: 'May your days be filled with light.',
    signature: 'SUNOO ☀️',
    cardNumber: 'EN-025',
    accentColor: '#E11D48'
  },

  // ================= JUNGWON (5 CARDS) =================
  {
    id: 'pc-jw-1',
    memberSlug: 'jungwon',
    memberName: 'Jungwon',
    era: 'Dark Blood',
    cardName: 'Steadfast Leader Jungwon',
    rarity: 'Secret',
    image: '/images/members/jungwon.jpg',
    quote: 'We will always protect and guide each other.',
    signature: 'JungWon 🐱',
    cardNumber: 'EN-026',
    accentColor: '#10B981'
  },
  {
    id: 'pc-jw-2',
    memberSlug: 'jungwon',
    memberName: 'Jungwon',
    era: 'Romance : Untold',
    cardName: 'Pure Anchor Jungwon',
    rarity: 'Rare',
    image: '/images/members/jungwon_2.jpg',
    quote: 'Thank you for walking this path with us.',
    signature: 'JungWon 🐱',
    cardNumber: 'EN-027',
    accentColor: '#3B82F6'
  },
  {
    id: 'pc-jw-3',
    memberSlug: 'jungwon',
    memberName: 'Jungwon',
    era: 'Manifesto : Day 1',
    cardName: 'Dimple Smile Jungwon',
    rarity: 'Common',
    image: '/images/members/jungwon_3.png',
    quote: 'Every step we take is meaningful.',
    signature: 'JungWon 🐱',
    cardNumber: 'EN-028',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-jw-4',
    memberSlug: 'jungwon',
    memberName: 'Jungwon',
    era: 'Dimension : Dilemma',
    cardName: 'Guardian Spirit Jungwon',
    rarity: 'Holo',
    image: '/images/members/jungwon_concert_1.jpg',
    quote: 'Strong hearts, gentle voices.',
    signature: 'JungWon 🐱',
    cardNumber: 'EN-029',
    accentColor: '#8B5CF6'
  },
  {
    id: 'pc-jw-5',
    memberSlug: 'jungwon',
    memberName: 'Jungwon',
    era: 'Border : Day One',
    cardName: 'First Beacon Jungwon',
    rarity: 'Common',
    image: '/images/members/jungwon.jpg',
    quote: 'Standing tall as the team’s pillar.',
    signature: 'JungWon 🐱',
    cardNumber: 'EN-030',
    accentColor: '#06B6D4'
  },

  // ================= NI-KI (5 CARDS) =================
  {
    id: 'pc-nk-1',
    memberSlug: 'ni-ki',
    memberName: 'Ni-ki',
    era: 'Dark Blood',
    cardName: 'Rhythm Prodigy Ni-ki',
    rarity: 'Holo',
    image: '/images/members/ni-ki.jpg',
    quote: 'Dancing with my soul, connecting through beat.',
    signature: 'NI-KI 🐆',
    cardNumber: 'EN-031',
    accentColor: '#8B5CF6'
  },
  {
    id: 'pc-nk-2',
    memberSlug: 'ni-ki',
    memberName: 'Ni-ki',
    era: 'Manifesto : Day 1',
    cardName: 'Stage Dynamo Ni-ki',
    rarity: 'Rare',
    image: '/images/members/ni-ki_3.jpg',
    quote: 'Step by step, conquering the highest peaks.',
    signature: 'NI-KI 🐆',
    cardNumber: 'EN-032',
    accentColor: '#EF4444'
  },
  {
    id: 'pc-nk-3',
    memberSlug: 'ni-ki',
    memberName: 'Ni-ki',
    era: 'Romance : Untold',
    cardName: 'Golden Motion Ni-ki',
    rarity: 'Common',
    image: '/images/members/ni-ki_4.jpg',
    quote: 'Creating magic in every routine.',
    signature: 'NI-KI 🐆',
    cardNumber: 'EN-033',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-nk-4',
    memberSlug: 'ni-ki',
    memberName: 'Ni-ki',
    era: 'Dimension : Dilemma',
    cardName: 'Velocity Groove Ni-ki',
    rarity: 'Secret',
    image: '/images/members/ni-ki_2.jpg',
    quote: 'No limits, only limitless energy.',
    signature: 'NI-KI 🐆',
    cardNumber: 'EN-034',
    accentColor: '#10B981'
  },
  {
    id: 'pc-nk-5',
    memberSlug: 'ni-ki',
    memberName: 'Ni-ki',
    era: 'Border : Day One',
    cardName: 'Young Panther Ni-ki',
    rarity: 'Rare',
    image: '/images/members/ni-ki_3.png',
    quote: 'Born to perform, driven to inspire.',
    signature: 'NI-KI 🐆',
    cardNumber: 'EN-035',
    accentColor: '#EC4899'
  },

  // ================= SPECIAL EDITION GROUP CARDS (3 CARDS) =================
  {
    id: 'pc-all-1',
    memberSlug: 'all',
    memberName: 'ENHYPEN',
    era: 'Special Edition',
    cardName: 'Eternal Seven Legend Card',
    rarity: 'Secret',
    image: '/images/members/all_members.jpg',
    quote: 'Seven boys, one destiny, infinite memories.',
    signature: 'ENHYPEN x ENGENE Forever',
    cardNumber: 'EN-SECRET-01',
    accentColor: '#F59E0B'
  },
  {
    id: 'pc-all-2',
    memberSlug: 'all',
    memberName: 'ENHYPEN',
    era: 'Dark Blood',
    cardName: 'Crimson Covenant Seven',
    rarity: 'Secret',
    image: '/images/members/all_members.jpg',
    quote: 'Blood, sweat, and glory bound together.',
    signature: 'ENHYPEN World Tour Edition',
    cardNumber: 'EN-SECRET-02',
    accentColor: '#E11D48'
  },
  {
    id: 'pc-all-3',
    memberSlug: 'all',
    memberName: 'ENHYPEN',
    era: 'Romance : Untold',
    cardName: 'Untold Destiny Masterpiece',
    rarity: 'Secret',
    image: '/images/members/all_members.jpg',
    quote: 'Every path led us to this one stage.',
    signature: 'The Seven Stars ★',
    cardNumber: 'EN-SECRET-03',
    accentColor: '#8B5CF6'
  }
];
