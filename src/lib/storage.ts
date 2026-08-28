import { AppreciationMessage, Post, Story, Report, Profile, Letter, SavedItem, UserPrefs, MemberSlug } from '@/types';

// Pre-seeded high quality initial data for out-of-the-box appreciation community experience
export const INITIAL_APPRECIATION_MESSAGES: AppreciationMessage[] = [
  {
    id: 'msg-1',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    userId: 'user-1',
    userName: 'Aria_Vocalist',
    userAvatar: null,
    content: 'Thank you Heeseung for always putting your whole heart into every melody. Your acoustic performance of "Off My Face" gave me comfort during my college exams!',
    status: 'approved',
    likesCount: 142,
    likedBy: [],
    createdAt: '2026-08-14T10:15:00Z'
  },
  {
    id: 'msg-2',
    memberId: 'jay',
    memberName: 'Jay',
    userId: 'user-2',
    userName: 'RockStarPulse',
    userAvatar: null,
    content: 'Jay, your guitar solos and passionate dedication on stage inspire me to practice my instrument every single day. Keep shining brightly!',
    status: 'approved',
    likesCount: 98,
    likedBy: [],
    createdAt: '2026-08-14T11:20:00Z'
  },
  {
    id: 'msg-3',
    memberId: 'jake',
    memberName: 'Jake',
    userId: 'user-3',
    userName: 'SunnyDays_J',
    userAvatar: null,
    content: 'Jake, your warm smile and comforting lyrics always make rainy days feel brighter. Thank you for showing that consistent hard work transforms dreams into reality.',
    status: 'approved',
    likesCount: 115,
    likedBy: [],
    createdAt: '2026-08-14T12:05:00Z'
  },
  {
    id: 'msg-4',
    memberId: 'sunghoon',
    memberName: 'Sunghoon',
    userId: 'user-4',
    userName: 'IceGrace',
    userAvatar: null,
    content: 'Sunghoon, the grace and poise you bring from your ice skating days to the music stage is truly breathtaking. Wishing you endless happiness!',
    status: 'approved',
    likesCount: 104,
    likedBy: [],
    createdAt: '2026-08-14T14:30:00Z'
  },
  {
    id: 'msg-5',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    userId: 'user-5',
    userName: 'PeachSun',
    userAvatar: null,
    content: 'Sunoo, your joyful facial expressions and angelic vocal color bring so much genuine happiness to our community. Thank you for being yourself!',
    status: 'approved',
    likesCount: 167,
    likedBy: [],
    createdAt: '2026-08-14T15:45:00Z'
  },
  {
    id: 'msg-6',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    userId: 'user-6',
    userName: 'LeaderAnchor',
    userAvatar: null,
    content: 'Jungwon, thank you for guiding the team with such wisdom, patience, and kindness. You are an exemplary leader and an absolute joy to support.',
    status: 'approved',
    likesCount: 189,
    likedBy: [],
    createdAt: '2026-08-14T16:10:00Z'
  },
  {
    id: 'msg-7',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    userId: 'user-7',
    userName: 'GrooveMaster',
    userAvatar: null,
    content: 'Ni-ki, watching your dance isolations and performance power leaves me in awe every time. Thank you for sharing your gift with the world!',
    status: 'approved',
    likesCount: 210,
    likedBy: [],
    createdAt: '2026-08-14T17:00:00Z'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    memberId: 'heeseung',
    memberName: 'Heeseung',
    userId: 'user-1',
    userName: 'Aria_Vocalist',
    userAvatar: null,
    category: 'Appreciation',
    title: 'Visualizing Heeseung’s Pitch Accuracy & Vocal Tone',
    content: 'I created a short musical analysis celebrating Heeseung’s vocal stability. The way he smoothly transitions into head voice while maintaining pitch clarity is an artistic masterclass!',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    status: 'approved',
    likesCount: 78,
    likedBy: [],
    commentsCount: 2,
    comments: [
      {
        id: 'c-1',
        postId: 'post-1',
        userId: 'user-3',
        userName: 'SunnyDays_J',
        userAvatar: null,
        content: 'Spot on analysis! His acoustic covers are pure art.',
        createdAt: '2026-08-14T18:10:00Z'
      }
    ],
    createdAt: '2026-08-14T16:00:00Z'
  },
  {
    id: 'post-2',
    category: 'Community',
    title: 'Welcome to Seven Appreciation — Our Safe, Peaceful Haven',
    userId: 'admin-1',
    userName: 'Community_Mod',
    userAvatar: null,
    content: 'Welcome everyone! Remember our core principle: "Support without attacking anyone else." Feel free to share positive stories, fan artwork, memories, and appreciation for all seven incredible individuals.',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    status: 'approved',
    likesCount: 250,
    likedBy: [],
    commentsCount: 5,
    createdAt: '2026-08-14T09:00:00Z'
  },
  {
    id: 'post-3',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    userId: 'user-5',
    userName: 'PeachSun',
    userAvatar: null,
    category: 'Artwork',
    title: 'Watercolor Fan Art of Sunoo’s Warm Smile',
    content: 'Painted this watercolor portrait over the weekend to express gratitude for Sunoo’s radiant positivity. Hope it brings a gentle smile to your day!',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    status: 'approved',
    likesCount: 134,
    likedBy: [],
    commentsCount: 3,
    createdAt: '2026-08-14T19:30:00Z'
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    memberId: 'jungwon',
    memberName: 'Jungwon',
    userId: 'user-6',
    userName: 'LeaderAnchor',
    userAvatar: null,
    title: 'How Jungwon’s Quiet Leadership Taught Me Emotional Resilience',
    storyBody: `When I took over managing my department’s team last year, I found myself overwhelmed by differing opinions and high pressure. I remembered observing how Jungwon handles leadership as the anchor of his group. 

    Instead of trying to assert dominance or shout over noise, he listens intently to every single voice first. He stays calm in high-stakes broadcasts and offers quiet, steadfast reassurance.

    Implementing Jungwon's listening-first leadership style completely turned my workplace atmosphere around. Thank you Jungwon for showing that leadership is about warmth, patience, and unwavering consistency.`,
    readingTimeMin: 3,
    likesCount: 89,
    likedBy: [],
    createdAt: '2026-08-13T14:20:00Z'
  },
  {
    id: 'story-2',
    memberId: 'ni-ki',
    memberName: 'Ni-ki',
    userId: 'user-7',
    userName: 'GrooveMaster',
    userAvatar: null,
    title: 'Overcoming Distance & Pursuing Passion — Ni-ki’s Inspiring Journey',
    storyBody: `Moving far from home at a young age to follow a dream takes incredible bravery. Whenever I feel nervous about moving to a new city for my career, I think about Ni-ki's courageous spirit. 

    His relentless hours in the dance studio and his commitment to mastering every move demonstrate that true passion knows no boundaries. Seeing him shine on world stages gives me courage every day.`,
    readingTimeMin: 4,
    likesCount: 112,
    likedBy: [],
    createdAt: '2026-08-12T11:00:00Z'
  }
];

export const CURRENT_USER_PROFILE: Profile = {
  id: 'local-profile',
  username: 'kind_heart',
  displayName: 'Kind Supporter',
  avatarUrl: null,
  bio: 'Here to spread kindness, genuine appreciation, and celebrate the journey of the seven! Support without attacking anyone else. 🌟',
  role: 'admin', // Enabled admin rights for demonstration of Moderation Panel
  joinedDate: 'August 2026',
  followingCount: 12,
  followersCount: 24
};

// Storage helper functions using LocalStorage with fallback
export function getStoredAppreciations(): AppreciationMessage[] {
  if (typeof window === 'undefined') return INITIAL_APPRECIATION_MESSAGES;
  const stored = localStorage.getItem('seven_appreciations');
  if (!stored) {
    localStorage.setItem('seven_appreciations', JSON.stringify(INITIAL_APPRECIATION_MESSAGES));
    return INITIAL_APPRECIATION_MESSAGES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_APPRECIATION_MESSAGES;
  }
}

export function saveAppreciations(data: AppreciationMessage[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('seven_appreciations', JSON.stringify(data));
  }
}

export function getStoredPosts(): Post[] {
  if (typeof window === 'undefined') return INITIAL_POSTS;
  const stored = localStorage.getItem('seven_posts');
  if (!stored) {
    localStorage.setItem('seven_posts', JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_POSTS;
  }
}

export function savePosts(data: Post[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('seven_posts', JSON.stringify(data));
  }
}

export function getStoredStories(): Story[] {
  if (typeof window === 'undefined') return INITIAL_STORIES;
  const stored = localStorage.getItem('seven_stories');
  if (!stored) {
    localStorage.setItem('seven_stories', JSON.stringify(INITIAL_STORIES));
    return INITIAL_STORIES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_STORIES;
  }
}

export function saveStories(data: Story[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('seven_stories', JSON.stringify(data));
  }
}

export function getStoredReports(): Report[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('seven_reports');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveReport(report: Report) {
  if (typeof window !== 'undefined') {
    const current = getStoredReports();
    current.unshift(report);
    localStorage.setItem('seven_reports', JSON.stringify(current));
  }
}

export const INITIAL_LETTERS: Letter[] = [
  {
    id: 'letter-1',
    memberId: 'sunoo',
    memberName: 'Sunoo',
    userId: 'user-5',
    userName: 'PeachSun',
    userAvatar: null,
    title: 'A lamp I keep on',
    body: 'On the days I come home late and the apartment is too quiet, I play a stage clip where you are laughing before the first note. I do not need a reply. I just wanted you to know a stranger’s kitchen feels less empty because you exist.',
    visibility: 'shared',
    createdAt: '2026-08-10T21:00:00Z'
  },
  {
    id: 'letter-2',
    userId: 'user-6',
    userName: 'LeaderAnchor',
    userAvatar: null,
    title: 'To all seven, on a long commute',
    body: 'I do not pick a favorite light. I pick the whole room. Thank you for staying a team in public, for the way you look at each other when a move lands, and for making support look like something I can practice in my own life.',
    visibility: 'shared',
    createdAt: '2026-08-11T08:30:00Z'
  }
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function getStoredLetters(): Letter[] {
  return readJson('seven_letters', INITIAL_LETTERS);
}

export function saveLetters(data: Letter[]) {
  writeJson('seven_letters', data);
}

export function getStoredProfile(): Profile {
  return readJson('seven_profile', CURRENT_USER_PROFILE);
}

export function saveProfile(data: Profile) {
  writeJson('seven_profile', data);
}

export function getStoredPrefs(): UserPrefs {
  return readJson('seven_prefs', { theme: 'light', cheeredMemberIds: [] });
}

export function savePrefs(data: UserPrefs) {
  writeJson('seven_prefs', data);
}

export function toggleCheeredMember(slug: MemberSlug): UserPrefs {
  const prefs = getStoredPrefs();
  const exists = prefs.cheeredMemberIds.includes(slug);
  const next: UserPrefs = {
    ...prefs,
    cheeredMemberIds: exists
      ? prefs.cheeredMemberIds.filter((id) => id !== slug)
      : [...prefs.cheeredMemberIds, slug]
  };
  savePrefs(next);
  return next;
}

export function getStoredSavedItems(): SavedItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('seven_saved');
  if (!stored) return [];
  try {
    return JSON.parse(stored) as SavedItem[];
  } catch {
    return [];
  }
}

export function saveSavedItems(data: SavedItem[]) {
  writeJson('seven_saved', data);
}

export function isItemSaved(type: SavedItem['type'], id: string) {
  return getStoredSavedItems().some((item) => item.type === type && item.id === id);
}

export function toggleSavedItem(type: SavedItem['type'], id: string): SavedItem[] {
  const current = getStoredSavedItems();
  const exists = current.some((item) => item.type === type && item.id === id);
  const next = exists
    ? current.filter((item) => !(item.type === type && item.id === id))
    : [{ type, id, savedAt: new Date().toISOString() }, ...current];
  saveSavedItems(next);
  return next;
}

export function getTrackComforts(): Record<string, string[]> {
  return readJson<Record<string, string[]>>('seven_track_comforts', {});
}

export function toggleTrackComfort(trackId: string, userId = 'local-profile') {
  const current = getTrackComforts();
  const liked = current[trackId] ?? [];
  const has = liked.includes(userId);
  current[trackId] = has ? liked.filter((id) => id !== userId) : [...liked, userId];
  writeJson('seven_track_comforts', current);
  return current;
}

export function isLetterReadable(letter: Letter, now = new Date()) {
  if (!letter.sealedUntil) return true;
  return new Date(letter.sealedUntil).getTime() <= now.getTime();
}

