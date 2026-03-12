import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mybiztools.ng' },
    update: {},
    create: {
      email: 'admin@mybiztools.ng',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      isActive: true
    }
  });

  console.log('Admin created successfully!');
  console.log('Email:', admin.email);
  console.log('Password: Admin123!');
  console.log('Role:', admin.role);

  await prisma.$disconnect();
}

createAdmin().catch(e => {
  console.error('Error creating admin:', e);
  process.exit(1);
});
