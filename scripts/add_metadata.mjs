import fs from 'fs';
import path from 'path';

const segments = [
  { path: 'achievements', title: 'Achievements & Milestones', desc: 'Verified milestones and accomplishments of the seven members.' },
  { path: 'admin', title: 'Mod Hub', desc: 'Moderation hub for Seven Appreciation community.' },
  { path: 'appreciation', title: 'Appreciation Wall', desc: 'A wall of heartfelt appreciation notes dedicated to the seven members.' },
  { path: 'binder', title: 'Virtual Photocards Binder', desc: 'Collect and view your virtual photocards of the seven members.' },
  { path: 'community', title: 'Community Feed', desc: 'Join the supportive community feed sharing love for the seven members.' },
  { path: 'gallery', title: 'Photo Gallery', desc: 'Curated photo gallery of the seven members.' },
  { path: 'guidelines', title: 'Community Guidelines', desc: 'Rules and guidelines for maintaining a positive, supportive space.' },
  { path: 'members', title: 'The Seven Members', desc: 'Learn more about the inspiring journeys of the seven members.' },
  { path: 'members/[slug]', title: 'Member Profile', desc: 'Dedicated profile and appreciation for the member.' },
  { path: 'profile', title: 'Your Profile', desc: 'Your Seven Appreciation community profile.' },
  { path: 'search', title: 'Search Community', desc: 'Search through appreciation posts, stories, and members.' },
  { path: 'stories', title: 'Inspiration Stories', desc: 'Heartwarming stories of how the seven members have inspired fans.' },
];

const basePath = 'c:/Users/91784/seven-appreciation/src/app';

segments.forEach(seg => {
  const dirPath = path.join(basePath, seg.path);
  if (!fs.existsSync(dirPath)) {
    console.log('Skipping missing dir:', dirPath);
    return;
  }
  
  const layoutPath = path.join(dirPath, 'layout.tsx');
  const content = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${seg.title} | Seven Appreciation",
  description: "${seg.desc}",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;

  if (!fs.existsSync(layoutPath)) {
    fs.writeFileSync(layoutPath, content);
    console.log('Created:', layoutPath);
  } else {
    console.log('Already exists:', layoutPath);
  }
});
