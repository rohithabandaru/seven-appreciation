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

async function searchAndDownload(query, targetFilename) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const res = await fetchJson(url);
  const pages = res.query?.pages ? Object.values(res.query.pages) : [];
  for (const page of pages) {
    const directUrl = page.imageinfo?.[0]?.url;
    if (directUrl && (directUrl.endsWith('.jpg') || directUrl.endsWith('.png') || directUrl.endsWith('.jpeg'))) {
      const dest = path.join(targetDir, targetFilename);
      try {
        console.log(`Downloading ${query} -> ${targetFilename}...`);
        await downloadFile(directUrl, dest);
        console.log(`✓ Successfully saved ${targetFilename}`);
        return true;
      } catch (e) {
        console.warn(`Failed ${directUrl}: ${e.message}`);
      }
    }
  }
  return false;
}

async function run() {
  await searchAndDownload('"Jay" ENHYPEN 2023 OR 2024', 'jay_2.jpg');
  await searchAndDownload('"Jay" "ENHYPEN" stage OR portrait', 'jay_3.jpg');
  await searchAndDownload('"Jake" ENHYPEN 2023 OR 2024', 'jake_2.jpg');
  await searchAndDownload('"Jake" "ENHYPEN" stage OR portrait', 'jake_3.jpg');
  await searchAndDownload('"Sunghoon" ENHYPEN 2023 OR 2024', 'sunghoon_2.jpg');
  await searchAndDownload('"Sunghoon" "ENHYPEN" stage OR portrait', 'sunghoon_3.jpg');
  await searchAndDownload('"Sunoo" ENHYPEN 2023 OR 2024', 'sunoo_3.jpg');
  await searchAndDownload('"Jungwon" ENHYPEN 2023 OR 2024', 'jungwon_2.jpg');
  console.log('Done downloading all distinct photocard images!');
}

run();
