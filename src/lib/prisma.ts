import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

const cleanConnectionString = (url?: string) =>
  url ? url.replace('&channel_binding=require', '').replace('?channel_binding=require&', '?').replace('?channel_binding=require', '') : url;

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const connStr = cleanConnectionString(process.env.DATABASE_URL);
    const pool = globalForPrisma.pool ?? new pg.Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    if (!globalForPrisma.pool) globalForPrisma.pool = pool;
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
