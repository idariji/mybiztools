/**
 * Seed a demo user for testing
 * Run on Render shell: npx tsx scripts/seed-demo-user.ts
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
  const email    = process.env.DEMO_EMAIL    || 'demo@mybiztools.ng';
  const password = process.env.DEMO_PASSWORD || 'Demo@1234';
  const plan     = process.env.DEMO_PLAN     || 'enterprise';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✅ User already exists: ${email} (plan: ${existing.currentPlan})`);
    // Update plan if needed
    if (existing.currentPlan !== plan) {
      await prisma.user.update({ where: { email }, data: { currentPlan: plan } });
      console.log(`✅ Plan updated to: ${plan}`);
    }
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      id:                uuidv4(),
      email,
      password:          hashed,
      firstName:         'Demo',
      lastName:          'User',
      businessName:      'MyBizTools Demo',
      emailVerified:     true,
      currentPlan:       plan,
      subscriptionStatus: 'active',
      updatedAt:         new Date(),
    },
  });

  console.log(`✅ Demo user created: ${email} / ${password} (plan: ${plan})`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error('❌ Error:', e.message); process.exit(1); });
