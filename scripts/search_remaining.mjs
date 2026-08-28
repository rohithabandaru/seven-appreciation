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

async function searchAndDownload(query, filename, skipIndex = 0) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const res = await fetchJson(url);
  const pages = res.query?.pages ? Object.values(res.query.pages) : [];
  const validPages = pages.filter(p => {
    const u = p.imageinfo?.[0]?.url;
    return u && (u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.jpeg'));
  });
  
  if (validPages[skipIndex]) {
    const directUrl = validPages[skipIndex].imageinfo[0].url;
    const dest = path.join(targetDir, filename);
    console.log(`Downloading ${directUrl} -> ${filename}...`);
    await downloadFile(directUrl, dest);
    const stats = fs.statSync(dest);
    console.log(`✓ Saved ${filename} (${stats.size} bytes)`);
    return true;
  }
  return false;
}

async function run() {
  await searchAndDownload('ENHYPEN Jay', 'jay_2.jpg', 1);
  await searchAndDownload('ENHYPEN Jake', 'jake_3.jpg', 1);
  await searchAndDownload('ENHYPEN Sunghoon', 'sunghoon_3.jpg', 1);
  await searchAndDownload('ENHYPEN Sunoo', 'sunoo_3.jpg', 1);
  console.log('Search downloads complete!');
}

run();
