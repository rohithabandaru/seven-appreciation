import fs from 'fs';
import path from 'path';
import https from 'https';

const targetDir = path.resolve('public/images/members');

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

async function searchAndDownload(slug, query, maxCount = 4) {
  console.log(`Searching for "${query}" for ${slug}...`);
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const res = await fetchJson(searchUrl);
  const pages = res.query?.pages ? Object.values(res.query.pages) : [];
  
  let count = 2; // start after primary
  for (const p of pages) {
    if (count > maxCount) break;
    const info = p.imageinfo?.[0];
    if (info && (info.mime === 'image/jpeg' || info.mime === 'image/png')) {
      const title = p.title.toLowerCase();
      // Ensure relevance to enhypen
      if (title.includes('enhypen') || title.includes(slug) || title.includes('220624') || title.includes('220709') || title.includes('241107')) {
        const ext = info.mime === 'image/png' ? 'png' : 'jpg';
        const filename = `${slug}_${count}.${ext}`;
        const dest = path.join(targetDir, filename);
        if (!fs.existsSync(dest)) {
          console.log(`Downloading ${p.title} -> ${filename}...`);
          try {
            await downloadFile(info.url, dest);
            console.log(`✓ Saved ${filename}`);
            count++;
          } catch (e) {
            console.warn(`Failed ${filename}: ${e.message}`);
          }
        } else {
          count++;
        }
      }
    }
  }
}

async function run() {
  await searchAndDownload('jay', 'Jay ENHYPEN');
  await searchAndDownload('jake', 'Jake ENHYPEN');
  await searchAndDownload('sunghoon', 'Sunghoon ENHYPEN');
  await searchAndDownload('sunoo', 'Sunoo ENHYPEN');
  await searchAndDownload('jungwon', 'Jungwon ENHYPEN');
  await searchAndDownload('ni-ki', 'Ni-ki ENHYPEN');
  console.log('Done downloading member gallery photos.');
}

run();
