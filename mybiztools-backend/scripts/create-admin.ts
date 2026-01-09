/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaLibSql({ url: databaseUrl });

const prisma = new PrismaClient({
  adapter,
});

async function createAdmin() {
  const email = 'admin@mybiztools.com';
  const password = 'Damilare01@';
  const name = 'Admin User';
  const role = 'super_admin';

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');

      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.admin.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: role,
          is_active: true,
        },
      });

      console.log('✅ Admin password updated successfully!');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          is_active: true,
        },
      });

      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', role);
    console.log('\nYou can now login at: http://localhost:5174');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
