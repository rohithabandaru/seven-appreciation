import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, content: true, mediaUrl: true, createdAt: true }
  });
  console.log('POSTS IN DB:', JSON.stringify(posts, null, 2));
  
  const files = await prisma.uploadedFile.findMany();
  console.log('UPLOADED FILES IN DB:', JSON.stringify(files, null, 2));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
