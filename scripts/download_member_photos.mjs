import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const DEST = path.resolve('public/images/members');

// Using Wikipedia Commons and other open/public domain images of K-pop idols at events
// These are press photos from public events, freely available
const PHOTOS = {
  jay: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Jay_%28singer%29_at_Incheon_Airport_on_March_11%2C_2023_%282%29.jpg/440px-Jay_%28singer%29_at_Incheon_Airport_on_March_11%2C_2023_%282%29.jpg',
      file: 'jay_2.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Jay_%28singer%29_at_Incheon_Airport_on_March_11%2C_2023.jpg/440px-Jay_%28singer%29_at_Incheon_Airport_on_March_11%2C_2023.jpg',
      file: 'jay_3.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/240714_%EC%9D%B8%EA%B0%80_%EC%A0%9C%EC%9D%B4_06.jpg/440px-240714_%EC%9D%B8%EA%B0%80_%EC%A0%9C%EC%9D%B4_06.jpg',
      file: 'jay_4.jpg'
    }
  ],
  jake: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Jake_at_Incheon_Airport_on_November_15%2C_2023_%283%29.jpg/440px-Jake_at_Incheon_Airport_on_November_15%2C_2023_%283%29.jpg',
      file: 'jake_2.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Jake_at_Incheon_Airport_on_November_15%2C_2023_%281%29.jpg/440px-Jake_at_Incheon_Airport_on_November_15%2C_2023_%281%29.jpg',
      file: 'jake_3.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Jake_at_Incheon_Airport_on_November_15%2C_2023_%282%29.jpg/440px-Jake_at_Incheon_Airport_on_November_15%2C_2023_%282%29.jpg',
      file: 'jake_4.jpg'
    }
  ],
  sunghoon: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Park_Sung-hoon_at_Incheon_Airport_on_March_11%2C_2023_%282%29.jpg/440px-Park_Sung-hoon_at_Incheon_Airport_on_March_11%2C_2023_%282%29.jpg',
      file: 'sunghoon_2.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Park_Sung-hoon_at_Incheon_Airport_on_March_11%2C_2023.jpg/440px-Park_Sung-hoon_at_Incheon_Airport_on_March_11%2C_2023.jpg',
      file: 'sunghoon_3.jpg'
    }
  ],
  sunoo: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Kim_Sunoo_at_Incheon_Airport_on_March_11%2C_2023_%282%29.jpg/440px-Kim_Sunoo_at_Incheon_Airport_on_March_11%2C_2023_%282%29.jpg',
      file: 'sunoo_2.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Kim_Sunoo_at_Incheon_Airport_on_March_11%2C_2023.jpg/440px-Kim_Sunoo_at_Incheon_Airport_on_March_11%2C_2023.jpg',
      file: 'sunoo_3.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/240714_%EC%9D%B8%EA%B0%80_%EC%84%A0%EC%9A%B0_04.jpg/440px-240714_%EC%9D%B8%EA%B0%80_%EC%84%A0%EC%9A%B0_04.jpg',
      file: 'sunoo_4.jpg'
    }
  ],
  jungwon: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Yang_Jungwon_at_Incheon_Airport_on_March_11%2C_2023.jpg/440px-Yang_Jungwon_at_Incheon_Airport_on_March_11%2C_2023.jpg',
      file: 'jungwon_2.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Yang_Jungwon_at_Incheon_Airport_on_March_11%2C_2023_%282%29.jpg/440px-Yang_Jungwon_at_Incheon_Airport_on_March_11%2C_2023_%282%29.jpg',
      file: 'jungwon_4.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/240714_%EC%9D%B8%EA%B0%80_%EC%A0%95%EC%9B%90_06.jpg/440px-240714_%EC%9D%B8%EA%B0%80_%EC%A0%95%EC%9B%90_06.jpg',
      file: 'jungwon_5.jpg'
    }
  ]
};

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const doRequest = (requestUrl, redirectCount = 0) => {
      if (redirectCount > 5) return reject(new Error('Too many redirects'));
      
      client.get(requestUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doRequest(res.headers.location, redirectCount + 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${requestUrl}`));
        }
        
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(destPath);
          console.log(`  ✅ ${path.basename(destPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
          resolve();
        });
        fileStream.on('error', reject);
      }).on('error', reject);
    };
    
    doRequest(url);
  });
}

async function main() {
  console.log('📸 Downloading distinct member photos...\n');
  
  for (const [member, photos] of Object.entries(PHOTOS)) {
    console.log(`\n👤 ${member.charAt(0).toUpperCase() + member.slice(1)}:`);
    for (const photo of photos) {
      const dest = path.join(DEST, photo.file);
      try {
        await downloadFile(photo.url, dest);
      } catch (err) {
        console.log(`  ❌ ${photo.file}: ${err.message}`);
      }
    }
  }
  
  console.log('\n✨ Done! Verifying file sizes to check for duplicates...\n');
  
  // Verify no duplicates by checking file sizes
  for (const [member, photos] of Object.entries(PHOTOS)) {
    const sizes = [];
    for (const photo of photos) {
      const fp = path.join(DEST, photo.file);
      if (fs.existsSync(fp)) {
        const size = fs.statSync(fp).size;
        sizes.push({ file: photo.file, size });
      }
    }
    // Check main photo too
    const mainFile = path.join(DEST, `${member}.jpg`);
    if (fs.existsSync(mainFile)) {
      sizes.push({ file: `${member}.jpg`, size: fs.statSync(mainFile).size });
    }
    
    const uniqueSizes = new Set(sizes.map(s => s.size));
    if (uniqueSizes.size < sizes.length) {
      console.log(`⚠️  ${member}: Some files have identical sizes (possible duplicates)`);
    } else {
      console.log(`✅ ${member}: All ${sizes.length} photos are unique`);
    }
  }
}

main();
