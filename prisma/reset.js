const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');

  // Delete in correct order (respect foreign key constraints)
  console.log('Deleting OrderProducts...');
  await prisma.orderProduct.deleteMany();

  console.log('Deleting Orders...');
  await prisma.order.deleteMany();

  console.log('Deleting ProductUnits...');
  await prisma.productUnit.deleteMany();

  console.log('Deleting Products...');
  await prisma.product.deleteMany();

  console.log('Deleting Units...');
  await prisma.unit.deleteMany();

  console.log('Reset complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
