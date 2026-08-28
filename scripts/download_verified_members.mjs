import fs from 'fs';
import path from 'path';
import https from 'https';

const memberFiles = {
  heeseung: [
    'HEESEUNG (ENHYPEN) 220624.jpg',
    'Heeseung 241107.jpg',
    'Heeseung of Enhypen at Prada Beauty event Sept 11 2024.png',
    'Evan (Heeseung) in 2026.jpg'
  ],
  jay: [
    'JAY (ENHYPEN) 220624.jpg',
    'Jay 241107.jpg',
    'Jay (Enhypen) at Prada Beauty event Sept 11 2024.png'
  ],
  jake: [
    'Sim Jae-yun, 2022.jpg',
    'Jake 241107.jpg',
    'Jake (Enhypen) at Tiffany event.png'
  ],
  sunghoon: [
    'Park Sunghoon (1).jpg',
    'Sunghoon 241107.jpg',
    'Park Sung-hoon in 2022.jpg'
  ],
  sunoo: [
    'SUNOO (ENHYPEN) 220624.jpg',
    'Sunoo 241107.jpg',
    'Sunoo (Enhypen) at Prada Beauty event Sept 11 2024.png'
  ],
  jungwon: [
    'JUNGWON (ENHYPEN) 220709.jpg',
    'Jungwon 241107.jpg',
    'Jungwon (Enhypen) at Prada Beauty event Sept 11 2024.png'
  ],
  'ni-ki': [
    'NI-KI (ENHYPEN) 220624.jpg',
    'Ni-ki 241107.jpg',
    'Ni-ki (Enhypen) at Prada Beauty event Sept 11 2024.png'
  ]
};

const targetDir = path.resolve('public/images/members');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Clean directory of any bad downloads first
fs.readdirSync(targetDir).forEach(f => {
  try { fs.unlinkSync(path.join(targetDir, f)); } catch {}
});

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'SevenAppreciationApp/1.0 (contact@enhypen-appreciation.app)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'SevenAppreciationApp/1.0 (contact@enhypen-appreciation.app)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', reject);
  });
}

async function getImageUrlForTitle(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const res = await fetchJson(url);
  const pages = res.query?.pages ? Object.values(res.query.pages) : [];
  if (pages.length > 0 && pages[0].imageinfo?.[0]?.url) {
    return pages[0].imageinfo[0].url;
  }
  return null;
}

async function searchEnhypenMember(memberName) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent('"' + memberName + '" ENHYPEN')}&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const res = await fetchJson(url);
  const pages = res.query?.pages ? Object.values(res.query.pages) : [];
  return pages.map(p => p.imageinfo?.[0]?.url).filter(Boolean);
}

async function main() {
  console.log('Downloading official photos for all 7 members...');
  
  for (const [slug, files] of Object.entries(memberFiles)) {
    console.log(`\n--- Member: ${slug.toUpperCase()} ---`);
    let downloadedCount = 0;

    // Try direct file list
    for (let i = 0; i < files.length; i++) {
      const fileTitle = files[i];
      try {
        const directUrl = await getImageUrlForTitle(fileTitle);
        if (directUrl) {
          const ext = directUrl.endsWith('.png') ? 'png' : 'jpg';
          const filename = downloadedCount === 0 ? `${slug}.${ext}` : `${slug}_${downloadedCount + 1}.${ext}`;
          const dest = path.join(targetDir, filename);
          console.log(`Downloading ${fileTitle} -> ${filename}...`);
          await downloadFile(directUrl, dest);
          console.log(`✓ Saved ${filename}`);
          downloadedCount++;
        }
      } catch (err) {
        console.warn(`Could not download ${fileTitle}:`, err.message);
      }
    }

    // If less than 2 photos, fallback to specific search
    if (downloadedCount === 0) {
      console.log(`Searching for "${slug} ENHYPEN"...`);
      const searchUrls = await searchEnhypenMember(slug);
      for (const sUrl of searchUrls) {
        const ext = sUrl.endsWith('.png') ? 'png' : 'jpg';
        const filename = downloadedCount === 0 ? `${slug}.${ext}` : `${slug}_${downloadedCount + 1}.${ext}`;
        const dest = path.join(targetDir, filename);
        console.log(`Downloading from search: ${sUrl} -> ${filename}...`);
        try {
          await downloadFile(sUrl, dest);
          console.log(`✓ Saved ${filename}`);
          downloadedCount++;
        } catch (e) {
          console.warn(`Failed search download:`, e.message);
        }
      }
    }
  }

  console.log('\nFinished checking member photos.');
}

main();
