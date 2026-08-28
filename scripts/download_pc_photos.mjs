import fs from 'fs';
import path from 'path';
import https from 'https';

const TARGET_DIR = path.resolve('public/images/members');

// High quality verified ENHYPEN photos from Wikimedia Commons
const DOWNLOADS = [
  {
    filename: 'jay_2.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/230522_Jay_%28Enhypen%29.jpg/800px-230522_Jay_%28Enhypen%29.jpg'
  },
  {
    filename: 'jay_3.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/240712_Jay_%28Enhypen%29.jpg/800px-240712_Jay_%28Enhypen%29.jpg'
  },
  {
    filename: 'jake_2.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/230522_Jake_%28Enhypen%29.jpg/800px-230522_Jake_%28Enhypen%29.jpg'
  },
  {
    filename: 'jake_3.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/240712_Jake_%28Enhypen%29.jpg/800px-240712_Jake_%28Enhypen%29.jpg'
  },
  {
    filename: 'sunghoon_2.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/230522_Sunghoon_%28Enhypen%29.jpg/800px-230522_Sunghoon_%28Enhypen%29.jpg'
  },
  {
    filename: 'sunghoon_3.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/240712_Sunghoon_%28Enhypen%29.jpg/800px-240712_Sunghoon_%28Enhypen%29.jpg'
  },
  {
    filename: 'sunoo_3.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/230522_Sunoo_%28Enhypen%29.jpg/800px-230522_Sunoo_%28Enhypen%29.jpg'
  },
  {
    filename: 'jungwon_2.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/230522_Jungwon_%28Enhypen%29.jpg/800px-230522_Jungwon_%28Enhypen%29.jpg'
  }
];

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const item of DOWNLOADS) {
    const target = path.join(TARGET_DIR, item.filename);
    try {
      console.log(`Downloading ${item.filename}...`);
      await download(item.url, target);
      console.log(`Saved ${item.filename}`);
    } catch (e) {
      console.error(`Error downloading ${item.filename}:`, e.message);
    }
  }
  console.log('All downloads complete!');
}

run();
