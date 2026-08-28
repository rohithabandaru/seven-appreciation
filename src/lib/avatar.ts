const AVATAR_COLORS = [
  'bg-rose-400', 'bg-amber-400', 'bg-purple-400', 'bg-emerald-400',
  'bg-sky-400', 'bg-pink-400', 'bg-teal-400', 'bg-orange-400',
  'bg-indigo-400', 'bg-lime-500', 'bg-cyan-400', 'bg-fuchsia-400',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getAvatarColorClass(name: string): string {
  return AVATAR_COLORS[hashCode(name || 'user') % AVATAR_COLORS.length];
}

const UNSPLASH_HOST = 'images.unsplash.com';

export function isRealUserImage(image: string | null | undefined): boolean {
  if (!image) return false;
  if (image.startsWith('/images/members/')) return false;
  try {
    const url = new URL(image);
    if (url.hostname === UNSPLASH_HOST) return false;
  } catch {
    if (image.startsWith(UNSPLASH_HOST)) return false;
  }
  return true;
}
