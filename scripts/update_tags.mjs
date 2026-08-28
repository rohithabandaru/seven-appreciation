import fs from 'fs';
import path from 'path';

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      findFiles(path.join(dir, file), fileList);
    } else if (file === 'page.tsx') {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = findFiles('c:/Users/91784/seven-appreciation/src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('bg-[#FFFDF9] text-zinc-900')) {
    content = content.replace(/bg-\[#FFFDF9\] text-zinc-900/g, "");
    changed = true;
  }
  if (content.includes('<main className=""') && !content.includes('id="main-content"')) {
    content = content.replace(/<main className=""/g, '<main id="main-content" className=""');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
