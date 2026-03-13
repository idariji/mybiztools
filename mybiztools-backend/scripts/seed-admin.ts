/**
 * One-time admin seed script
 * Run on Render shell: npx tsx scripts/seed-admin.ts
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const email    = process.env.ADMIN_EMAIL    || 'admin@mybiztools.ng';
  const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const name     = process.env.ADMIN_NAME     || 'Super Admin';

  const existing = await (prisma as any).admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`✅ Admin already exists: ${email}`);
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await (prisma as any).admin.create({
    data: {
      id:        uuidv4(),
      email,
      password:  hashed,
      name,
      role:      'super_admin',
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Admin created: ${email} (role: super_admin)`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error('❌ Error:', e.message); process.exit(1); });
