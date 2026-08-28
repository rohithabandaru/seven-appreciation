import fs from 'fs';
import path from 'path';
import https from 'https';

const members = [
  { slug: 'heeseung', search: 'HEESEUNG (ENHYPEN)' },
  { slug: 'jay', search: 'JAY (ENHYPEN)' },
  { slug: 'jake', search: 'Sim Jae-yun' },
  { slug: 'sunghoon', search: 'Park Sunghoon' },
  { slug: 'sunoo', search: 'SUNOO (ENHYPEN)' },
  { slug: 'jungwon', search: 'JUNGWON (ENHYPEN)' },
  { slug: 'ni-ki', search: 'NI-KI (ENHYPEN)' }
];

const targetDir = path.resolve('public/images/members');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'SevenAppreciationApp/1.0 (contact@enhypen-appreciation.app)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
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
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Searching Wikimedia Commons for member photos...');
  for (const m of members) {
    try {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(m.search)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size|mime&format=json`;
      const res = await fetchJson(searchUrl);
      const pages = res.query?.pages ? Object.values(res.query.pages) : [];
      console.log(`Found ${pages.length} results for ${m.slug}`);
      
      let index = 1;
      for (const page of pages) {
        const info = page.imageinfo?.[0];
        if (info && (info.mime === 'image/jpeg' || info.mime === 'image/png')) {
          const ext = info.mime === 'image/png' ? 'png' : 'jpg';
          const filename = index === 1 ? `${m.slug}.${ext}` : `${m.slug}_${index}.${ext}`;
          const dest = path.join(targetDir, filename);
          console.log(`Downloading ${info.url} -> ${filename} (${info.size} bytes)...`);
          try {
            await downloadFile(info.url, dest);
            console.log(`✓ Saved ${filename}`);
            index++;
          } catch (err) {
            console.error(`Failed to download ${info.url}:`, err.message);
          }
        }
      }
    } catch (e) {
      console.error(`Error processing ${m.slug}:`, e.message);
    }
  }
}

run();
