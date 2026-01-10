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

// Parse Cloud SQL socket path from DATABASE_URL if present
const parseCloudSqlConfig = () => {
  const hostMatch = databaseUrl.match(/host=([^&]+)/);
  if (hostMatch && hostMatch[1].includes('/cloudsql/')) {
    // Cloud SQL Unix socket connection
    const socketPath = hostMatch[1];
    const urlParts = databaseUrl.split('?')[0];
    const match = urlParts.match(/postgresql:\/\/([^:]+):([^@]+)@[^/]*\/(.+)/);
    if (match) {
      return {
        user: match[1],
        password: match[2],
        database: match[3],
        host: socketPath,
      };
    }
  }
  // Standard connection string
  return { connectionString: databaseUrl };
};

// Create PostgreSQL connection pool
const poolConfig = parseCloudSqlConfig();
const pool = new pg.Pool(poolConfig);

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
