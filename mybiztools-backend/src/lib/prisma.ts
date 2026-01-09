import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || '';

// Create PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: databaseUrl,
});

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const createPrismaClient = () => {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
  });
};

// Use global prisma instance in development to prevent hot-reload issues
export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Log database connection on startup
if (process.env.NODE_ENV === 'development') {
  console.log(`📦 Database: PostgreSQL`);
}

export default prisma;
