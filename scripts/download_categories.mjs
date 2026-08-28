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

async function searchCategory(cat) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=Category:${encodeURIComponent(cat)}&gcmnamespace=6&gcmlimit=20&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const res = await fetchJson(url);
  const pages = res.query?.pages ? Object.values(res.query.pages) : [];
  return pages.map(p => ({ title: p.title, url: p.imageinfo?.[0]?.url })).filter(x => x.url);
}

async function main() {
  const categories = [
    { slug: 'jay', cat: 'Jay (ENHYPEN)' },
    { slug: 'jake', cat: 'Jake (ENHYPEN)' },
    { slug: 'sunghoon', cat: 'Park Sung-hoon (figure skater)' },
    { slug: 'sunoo', cat: 'Sunoo' },
    { slug: 'jungwon', cat: 'Jungwon' },
    { slug: 'ni-ki', cat: 'Ni-ki' }
  ];

  for (const c of categories) {
    console.log(`Checking category for ${c.slug}...`);
    try {
      const items = await searchCategory(c.cat);
      console.log(`Found ${items.length} items for ${c.slug}`);
      let count = 2;
      for (const item of items) {
        if (!item.title.toLowerCase().includes('signature') && !item.title.toLowerCase().includes('logo') && !item.title.toLowerCase().includes('audio')) {
          const ext = item.url.endsWith('.png') ? 'png' : 'jpg';
          const filename = `${c.slug}_${count}.${ext}`;
          const dest = path.join(targetDir, filename);
          if (!fs.existsSync(dest) && count <= 4) {
            console.log(`Downloading ${item.title} -> ${filename}`);
            try {
              await downloadFile(item.url, dest);
              console.log(`✓ Saved ${filename}`);
              count++;
            } catch (e) {
              console.warn(`Error downloading: ${e.message}`);
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Error for ${c.slug}:`, err.message);
    }
  }

  // Also download group photo
  try {
    const groupSearch = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:241014_Enhypen.jpg|File:Enhypen_members.jpg&prop=imageinfo&iiprop=url&format=json`;
    const gRes = await fetchJson(groupSearch);
    const gPages = gRes.query?.pages ? Object.values(gRes.query.pages) : [];
    if (gPages.length > 0 && gPages[0].imageinfo?.[0]?.url) {
      console.log('Downloading group photo...');
      await downloadFile(gPages[0].imageinfo[0].url, path.join(targetDir, 'all_members.jpg'));
      console.log('✓ Saved all_members.jpg');
    }
  } catch (e) {
    console.warn('Group photo error:', e.message);
  }
}

main();
