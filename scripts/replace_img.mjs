import fs from 'fs';
import path from 'path';

function processFile(filePath, replacements) {
  const fullPath = path.join('c:/Users/91784/seven-appreciation', filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Add import if not exists
  if (content.includes('<Image ') && !content.includes("import Image from 'next/image';")) {
    content = content.replace(/(import React.*?;\n)/, "$1import Image from 'next/image';\n");
  }

  replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
  });

  // Re-check import in case we just added <Image>
  if (content.includes('<Image ') && !content.includes("import Image from 'next/image';")) {
    content = content.replace(/(import React.*?;\n)/, "$1import Image from 'next/image';\n");
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${filePath}`);
  }
}

// 1. members/page.tsx
processFile('src/app/members/page.tsx', [
  {
    from: /<img\s+src=\{member\.image\}\s+alt=\{member\.displayName\}\s+referrerPolicy="no-referrer"\s+className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"\s+\/>/g,
    to: `<Image src={member.image} alt={member.displayName} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />`
  },
  {
    from: /<img\s+src=\{moment\.url\}\s+alt=\{moment\.caption\}\s+referrerPolicy="no-referrer"\s+className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"\s+\/>/g,
    to: `<Image src={moment.url} alt={moment.caption || 'Moment'} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" />`
  }
]);

// 2. achievements/page.tsx
processFile('src/app/achievements/page.tsx', [
  {
    from: /<img src=\{m\.image\} alt=\{m\.displayName\} className="h-4 w-4 rounded-full object-cover" \/>/g,
    to: `<div className="relative h-4 w-4 overflow-hidden rounded-full"><Image src={m.image} alt={m.displayName} fill className="object-cover" sizes="16px" /></div>`
  },
  {
    from: /<img\s+src=\{getMemberImage\(milestone\.memberId\)\}\s+alt=\{milestone\.memberName \|\| 'All Seven'\}\s+className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-xs"\s+\/>/g,
    to: `<div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-xs"><Image src={getMemberImage(milestone.memberId)} alt={milestone.memberName || 'All Seven'} fill className="object-cover" sizes="32px" /></div>`
  },
  {
    from: /<img\s+src=\{getMemberImage\(ach\.memberId\)\}\s+alt=\{ach\.memberName\}\s+className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-xs"\s+\/>/g,
    to: `<div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-xs"><Image src={getMemberImage(ach.memberId)} alt={ach.memberName} fill className="object-cover" sizes="32px" /></div>`
  },
  {
    from: /<img\s+src=\{m\.image\}\s+alt=\{m\.displayName\}\s+className="h-10 w-10 rounded-full object-cover border border-white shadow-xs"\s+\/>/g,
    to: `<div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white shadow-xs"><Image src={m.image} alt={m.displayName} fill className="object-cover" sizes="40px" /></div>`
  }
]);

// 3. members/[slug]/page.tsx
processFile('src/app/members/[slug]/page.tsx', [
  {
    from: /<img\s+src=\{member\.image\}\s+alt=\{member\.displayName\}\s+referrerPolicy="no-referrer"\s+className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"\s+\/>/g,
    to: `<Image src={member.image} alt={member.displayName} fill priority className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />`
  },
  {
    from: /<img\s+src=\{msg\.userAvatar\}\s+alt=\{msg\.userName\}\s+className="h-6 w-6 rounded-full object-cover"\s+\/>/g,
    to: `<div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full"><Image src={msg.userAvatar} alt={msg.userName} fill className="object-cover" sizes="24px" /></div>`
  },
  {
    from: /<img\s+src=\{photo\.url\}\s+alt=\{photo\.caption\}\s+referrerPolicy="no-referrer"\s+className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"\s+\/>/g,
    to: `<Image src={photo.url} alt={photo.caption || 'Photo'} fill className="object-cover transition-transform duration-700 group-hover:scale-108" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />`
  }
]);
