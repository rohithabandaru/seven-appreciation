import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const pool = globalForPrisma.pool ?? new pg.Pool({ connectionString: process.env.DATABASE_URL })
    if (!globalForPrisma.pool) globalForPrisma.pool = pool
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  })()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
