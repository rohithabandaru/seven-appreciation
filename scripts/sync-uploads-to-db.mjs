import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BASE_DIR = path.join(process.cwd(), 'public', 'uploads');

async function walk(dir) {
  let files = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(await walk(fullPath));
      } else if (entry.isFile() && !entry.name.startsWith('.')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error('Walk error:', err);
  }
  return files;
}

async function sync() {
  console.log('Scanning public/uploads directory for local files...');
  const filePaths = await walk(BASE_DIR);
  console.log(`Found ${filePaths.length} local files.`);

  for (const filePath of filePaths) {
    const relativePath = path.relative(BASE_DIR, filePath);
    const storageKey = relativePath.replace(/\\/g, '/');
    console.log(`Processing storageKey: ${storageKey}`);

    const buffer = await fs.readFile(filePath);
    const base64Data = buffer.toString('base64');
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';

    const existing = await prisma.uploadedFile.findUnique({
      where: { storageKey }
    });

    if (existing) {
      await prisma.uploadedFile.update({
        where: { storageKey },
        data: {
          fileData: base64Data,
          mimeType,
          size: buffer.length
        }
      });
      console.log(`✅ Updated existing DB record for: ${storageKey}`);
    } else {
      await prisma.uploadedFile.create({
        data: {
          ownerId: 'system-sync',
          storageKey,
          url: `/uploads/${storageKey}`,
          fileData: base64Data,
          originalName: path.basename(filePath),
          mimeType,
          size: buffer.length,
          purpose: storageKey.startsWith('post-image') ? 'post-image' : 'photo'
        }
      });
      console.log(`✨ Created new DB record for: ${storageKey}`);
    }
  }

  console.log('All local uploads synced to PostgreSQL database successfully!');
  await prisma.$disconnect();
  await pool.end();
}

sync().catch(console.error);
