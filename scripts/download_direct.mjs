import fs from 'fs';
import path from 'path';
import https from 'https';

const targetDir = path.resolve('public/images/members');

// Target URLs of high resolution Wikimedia commons ENHYPEN images
const DIRECT_URLS = {
  // Jay
  'jay_concert_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/JAY_%28ENHYPEN%29_220624.jpg',
  
  // Jake
  'jake_concert_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/6/66/Sim_Jae-yun%2C_2022.jpg',

  // Sunghoon
  'sunghoon_concert_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Park_Sunghoon_%281%29.jpg',

  // Sunoo
  'sunoo_concert_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/87/SUNOO_%28ENHYPEN%29_220624.jpg',

  // Jungwon
  'jungwon_concert_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/JUNGWON_%28ENHYPEN%29_220709.jpg',

  // Ni-ki
  'ni-ki_concert_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/NI-KI_%28ENHYPEN%29_220624.jpg'
};

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

async function run() {
  for (const [filename, url] of Object.entries(DIRECT_URLS)) {
    try {
      const dest = path.join(targetDir, filename);
      await downloadFile(url, dest);
      console.log(`✓ Saved ${filename} (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.warn(`Error for ${filename}:`, e.message);
    }
  }
}

run();
