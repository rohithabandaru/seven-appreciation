export type MemberSlug = 'heeseung' | 'jay' | 'jake' | 'sunghoon' | 'sunoo' | 'jungwon' | 'ni-ki';

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface Achievement {
  id: string;
  memberId: MemberSlug;
  memberName: string;
  title: string;
  category: 'Music' | 'Performance' | 'Milestone' | 'Global Impact' | 'Artistry';
  eventDate: string;
  description: string;
  verifiedSourceUrl?: string;
}

export interface MemberPhoto {
  id: string;
  memberSlug?: MemberSlug;
  url: string;
  caption: string;
  category: 'Concept' | 'Stage' | 'Casual' | 'Studio' | 'Fan Art' | 'Behind The Scenes';
  date?: string;
  credit?: string;
  likesCount?: number;
  createdAt?: string | Date;
}

export interface OfficialLink {
  platform: string;
  url: string;
  label: string;
}

export interface Member {
  id: string;
  slug: MemberSlug;
  name: string;
  displayName: string;
  koreanName: string;
  image: string;
  heroImage: string;
  quote: string;
  role: string;
  birthDate: string;
  bio: string;
  colorGradient: string;
  accentColor: string;
  journey: Milestone[];
  achievements: Achievement[];
  inspirationStories: string[];
  officialLinks: OfficialLink[];
  photos?: MemberPhoto[];
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  role: 'user' | 'moderator' | 'admin';
  joinedDate: string;
  followingCount: number;
  followersCount: number;
}

export interface AppreciationMessage {
  id: string;
  memberId: MemberSlug;
  memberName: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  status: 'approved' | 'pending' | 'flagged' | 'removed';
  likesCount: number;
  likedBy: string[];
  createdAt: string;
}

export type PostCategory = 
  | 'Appreciation' 
  | 'Inspiration' 
  | 'Story' 
  | 'Achievement' 
  | 'Memory' 
  | 'Artwork' 
  | 'Fan Project' 
  | 'Encouragement' 
  | 'Community';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  memberId?: MemberSlug;
  memberName?: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  category?: PostCategory | string;
  type?: string;
  title: string;
  content: string;
  imageUrl?: string;
  status: 'approved' | 'pending' | 'flagged' | 'removed';
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  comments?: Comment[];
  isBookmarked?: boolean;
  createdAt: string | Date;
  user?: {
    name?: string | null;
    image?: string | null;
  };
}

export interface Story {
  id: string;
  memberId: MemberSlug;
  memberName: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  title: string;
  storyBody: string;
  readingTimeMin: number;
  likesCount: number;
  likedBy: string[];
  createdAt: string;
}

export type ReportCategory = 
  | 'Fan war / comparison' 
  | 'Hate' 
  | 'Harassment' 
  | 'Personal information' 
  | 'Rumor / misinformation' 
  | 'Targeted attack' 
  | 'Spam' 
  | 'Inappropriate content' 
  | 'Copyright concern' 
  | 'Other';

export interface Report {
  id: string;
  contentType: 'appreciation' | 'post' | 'comment' | 'story';
  contentId: string;
  contentSnippet: string;
  reporterId: string;
  reason: ReportCategory;
  details?: string;
  status: 'pending' | 'dismissed' | 'actioned';
  actionTaken?: 'dismiss' | 'hide' | 'remove' | 'warn_user' | 'ban_user';
  reporterIp?: string;
  createdAt: string;
}

export interface ModerationCheckResult {
  isAllowed: boolean;
  score: number;
  flagReason?: string;
  violatingTerms?: string[];
  guidanceMessage?: string;
}

export type LetterVisibility = 'shared' | 'private';

export interface Letter {
  id: string;
  memberId?: MemberSlug;
  memberName?: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  title: string;
  body: string;
  imageUrl?: string;
  visibility: LetterVisibility;
  sealedUntil?: string;
  createdAt: string;
}

export type ComfortMoodId =
  | 'tired'
  | 'anxious'
  | 'lonely'
  | 'proud'
  | 'grateful'
  | 'unmotivated'
  | 'homesick'
  | 'hopeful';

export interface ComfortMood {
  id: ComfortMoodId;
  label: string;
  prompt: string;
  accent: string;
}

export interface ComfortNote {
  moodId: ComfortMoodId;
  memberId: MemberSlug;
  memberName: string;
  quote: string;
  note: string;
  nextStep: string;
  nextHref: string;
}

export interface ComfortTrack {
  id: string;
  title: string;
  era: string;
  year: string;
  moodTags: string[];
  whyItComforts: string;
  memberIds: MemberSlug[];
  listenUrl: string;
}

export interface SavedItem {
  type: 'post' | 'story' | 'letter' | 'track';
  id: string;
  savedAt: string;
}

export interface UserPrefs {
  theme: 'light' | 'dark';
  cheeredMemberIds: MemberSlug[];
}

export interface UpcomingBirthday {
  slug: MemberSlug;
  displayName: string;
  koreanName: string;
  image: string;
  birthDate: string;
  monthDay: string;
  daysUntil: number;
  turningAge: number;
}
