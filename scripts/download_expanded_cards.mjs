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

async function searchAndSave(query, filename) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const res = await fetchJson(url);
  const pages = res.query?.pages ? Object.values(res.query.pages) : [];
  for (const p of pages) {
    const u = p.imageinfo?.[0]?.url;
    if (u && (u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.jpeg'))) {
      const dest = path.join(targetDir, filename);
      try {
        await downloadFile(u, dest);
        if (fs.statSync(dest).size > 1000) {
          console.log(`✓ Saved ${filename} (${fs.statSync(dest).size} bytes)`);
          return true;
        }
      } catch {}
    }
  }
  return false;
}

async function run() {
  console.log('Downloading expanded photocard set...');
  await searchAndSave('ENHYPEN "Jay" 2022 OR 2023', 'jay_card_3.jpg');
  await searchAndSave('ENHYPEN "Jay" stage concert', 'jay_card_4.jpg');
  await searchAndSave('ENHYPEN "Jay" portrait', 'jay_card_5.jpg');

  await searchAndSave('ENHYPEN "Jake" 2022 OR 2023', 'jake_card_3.jpg');
  await searchAndSave('ENHYPEN "Jake" stage concert', 'jake_card_4.jpg');
  await searchAndSave('ENHYPEN "Jake" portrait', 'jake_card_5.jpg');

  await searchAndSave('ENHYPEN "Sunoo" 2022 OR 2023', 'sunoo_card_3.jpg');
  await searchAndSave('ENHYPEN "Sunoo" stage concert', 'sunoo_card_4.jpg');
  await searchAndSave('ENHYPEN "Sunoo" portrait', 'sunoo_card_5.jpg');

  await searchAndSave('ENHYPEN "Sunghoon" 2022 OR 2023', 'sunghoon_card_4.jpg');
  await searchAndSave('ENHYPEN "Sunghoon" stage concert', 'sunghoon_card_5.jpg');

  await searchAndSave('ENHYPEN "Jungwon" 2022 OR 2023', 'jungwon_card_4.jpg');
  await searchAndSave('ENHYPEN "Jungwon" stage concert', 'jungwon_card_5.jpg');

  await searchAndSave('ENHYPEN "Ni-ki" 2022 OR 2023', 'ni-ki_card_4.jpg');
  await searchAndSave('ENHYPEN "Ni-ki" stage concert', 'ni-ki_card_5.jpg');

  await searchAndSave('ENHYPEN group photo 2023 OR 2024', 'all_members_2.jpg');
  await searchAndSave('ENHYPEN group red carpet 2022 OR 2023', 'all_members_3.jpg');

  console.log('Finished downloading expanded set!');
}

run();
