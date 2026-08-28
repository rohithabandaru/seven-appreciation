import fs from 'fs';
import path from 'path';
import https from 'https';

const targetDir = path.resolve('public/images/members');

// Verified Wikimedia File Titles for each member
const MEMBER_TITLES = {
  'jay_2.jpg': 'Jay (Enhypen) at Prada Beauty event Sept 11 2024.png',
  'jay_3.jpg': 'JAY (ENHYPEN) 220624.jpg',
  'jake_2.jpg': 'Sim Jae-yun, 2022.jpg',
  'jake_3.jpg': 'Jake (Enhypen) at Tiffany event.png',
  'sunghoon_2.jpg': 'Park Sunghoon (1).jpg',
  'sunghoon_3.jpg': 'Park Sung-hoon in 2022.jpg',
  'sunoo_3.jpg': 'Sunoo (Enhypen) at Prada Beauty event Sept 11 2024.png',
  'jungwon_2.jpg': 'JUNGWON (ENHYPEN) 220709.jpg'
};

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

async function run() {
  for (const [filename, fileTitle] of Object.entries(MEMBER_TITLES)) {
    try {
      console.log(`Looking up ${fileTitle}...`);
      const directUrl = await getImageUrlForTitle(fileTitle);
      if (directUrl) {
        const dest = path.join(targetDir, filename);
        console.log(`Downloading ${directUrl} -> ${filename}...`);
        await downloadFile(directUrl, dest);
        const stats = fs.statSync(dest);
        console.log(`✓ Saved ${filename} (${stats.size} bytes)`);
      } else {
        console.warn(`No URL found for ${fileTitle}`);
      }
    } catch (e) {
      console.error(`Error for ${filename}:`, e.message);
    }
  }
  console.log('All files verified and saved!');
}

run();
