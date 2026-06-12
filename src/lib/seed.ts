import { hash } from 'bcryptjs';
import { prisma } from './prisma';

async function seed() {
  console.log('Starting database seed...');

  // Create admin user
  const hashedPassword = await hash('admin123', 12);

  let admin;
  try {
    admin = await prisma.user.upsert({
      where: { email: 'admin@genz.com' },
      update: {},
      create: {
        email: 'admin@genz.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Created admin user:', admin.email);
  } catch (e) {
    console.log('Admin user may already exist');
  }

  // Create staff user
  const staff = await prisma.user.upsert({
    where: { email: 'staff@genz.com' },
    update: {},
    create: {
      email: 'staff@genz.com',
      name: 'Staff User',
      password: hashedPassword,
      role: 'STAFF',
    },
  });

  console.log('Created staff user:', staff.email);

  // Create second admin user
  const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@genz.com' },
    update: {},
    create: {
      email: 'admin2@genz.com',
      name: 'Admin User 2',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created admin2 user:', admin2.email);
  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('  Admin 1: admin@genz.com / admin123');
  console.log('  Admin 2: admin2@genz.com / admin123');
  console.log('  Staff:   staff@genz.com / admin123');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });