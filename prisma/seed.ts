import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'GenZ Restaurant',
      address: '123 Main Street, New Delhi, India 110001',
    },
  });
  console.log('✅ Restaurant created:', restaurant.name);

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@genz.com' },
    update: {},
    create: {
      email: 'admin@genz.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      restaurantId: restaurant.id,
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // Create Staff User
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@genz.com' },
    update: {},
    create: {
      email: 'staff@genz.com',
      password: staffPassword,
      name: 'Staff User',
      role: 'STAFF',
      restaurantId: restaurant.id,
    },
  });
  console.log('✅ Staff user created:', staffUser.email);

  // Create Tables
  const tableData = [
    { number: 1, capacity: 2 },
    { number: 2, capacity: 2 },
    { number: 3, capacity: 4 },
    { number: 4, capacity: 4 },
    { number: 5, capacity: 4 },
    { number: 6, capacity: 6 },
    { number: 7, capacity: 6 },
    { number: 8, capacity: 8 },
    { number: 9, capacity: 2 },
    { number: 10, capacity: 4 },
  ];

  for (const table of tableData) {
    await prisma.table.upsert({
      where: {
        restaurantId_number: {
          restaurantId: restaurant.id,
          number: table.number,
        },
      },
      update: {},
      create: {
        number: table.number,
        capacity: table.capacity,
        status: 'AVAILABLE',
        restaurantId: restaurant.id,
      },
    });
  }
  console.log('✅ Created 10 tables');

  // Create Menu Items
  const menuItems = [
    // Starters
    {
      name: 'Paneer Tikka',
      category: 'Starters',
      price: 249,
      imageUrl: '/images/paneer-tikka.jpg',
      available: true,
    },
    {
      name: 'Veg Spring Rolls',
      category: 'Starters',
      price: 199,
      imageUrl: '/images/spring-rolls.jpg',
      available: true,
    },
    {
      name: 'Chicken Wings',
      category: 'Starters',
      price: 299,
      imageUrl: '/images/chicken-wings.jpg',
      available: true,
    },
    {
      name: 'Crispy Corn',
      category: 'Starters',
      price: 179,
      imageUrl: '/images/crispy-corn.jpg',
      available: true,
    },
    {
      name: 'French Fries',
      category: 'Starters',
      price: 149,
      imageUrl: '/images/french-fries.jpg',
      available: true,
    },
    // Mains
    {
      name: 'Butter Chicken',
      category: 'Mains',
      price: 399,
      imageUrl: '/images/butter-chicken.jpg',
      available: true,
    },
    {
      name: 'Dal Makhani',
      category: 'Mains',
      price: 299,
      imageUrl: '/images/dal-makhani.jpg',
      available: true,
    },
    {
      name: 'Paneer Butter Masala',
      category: 'Mains',
      price: 349,
      imageUrl: '/images/paneer-butter-masala.jpg',
      available: true,
    },
    {
      name: 'Veg Biryani',
      category: 'Mains',
      price: 279,
      imageUrl: '/images/veg-biryani.jpg',
      available: true,
    },
    {
      name: 'Chicken Biryani',
      category: 'Mains',
      price: 349,
      imageUrl: '/images/chicken-biryani.jpg',
      available: true,
    },
    {
      name: 'Margherita Pizza',
      category: 'Mains',
      price: 299,
      imageUrl: '/images/margherita-pizza.jpg',
      available: true,
    },
    {
      name: 'Pasta Alfredo',
      category: 'Mains',
      price: 329,
      imageUrl: '/images/pasta-alfredo.jpg',
      available: true,
    },
    // Desserts
    {
      name: 'Gulab Jamun',
      category: 'Desserts',
      price: 129,
      imageUrl: '/images/gulab-jamun.jpg',
      available: true,
    },
    {
      name: 'Ice Cream',
      category: 'Desserts',
      price: 99,
      imageUrl: '/images/ice-cream.jpg',
      available: true,
    },
    {
      name: 'Chocolate Brownie',
      category: 'Desserts',
      price: 149,
      imageUrl: '/images/brownie.jpg',
      available: true,
    },
    {
      name: 'Ras Malai',
      category: 'Desserts',
      price: 139,
      imageUrl: '/images/ras-malai.jpg',
      available: true,
    },
    // Beverages
    {
      name: 'Fresh Lime Soda',
      category: 'Beverages',
      price: 79,
      imageUrl: '/images/lime-soda.jpg',
      available: true,
    },
    {
      name: 'Mango Lassi',
      category: 'Beverages',
      price: 99,
      imageUrl: '/images/mango-lassi.jpg',
      available: true,
    },
    {
      name: 'Cold Coffee',
      category: 'Beverages',
      price: 119,
      imageUrl: '/images/cold-coffee.jpg',
      available: true,
    },
    {
      name: 'Masala Chai',
      category: 'Beverages',
      price: 49,
      imageUrl: '/images/masala-chai.jpg',
      available: true,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        ...item,
        restaurantId: restaurant.id,
      },
    });
  }
  console.log('✅ Created 20 menu items');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('   Admin: admin@genz.com / admin123');
  console.log('   Staff: staff@genz.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
