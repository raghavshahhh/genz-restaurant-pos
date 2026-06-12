const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'default-restaurant-id' },
    update: {},
    create: {
      id: 'default-restaurant-id',
      name: 'Gen-Z Restaurant',
      address: '123 Main St',
    },
  });
  console.log('Restaurant ID:', restaurant.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
