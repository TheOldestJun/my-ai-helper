import prisma from './index.js';

async function main() {
  const roles = [
    { name: 'ADMIN', description: 'Адміністратор системи' },
    { name: 'SUPPLY', description: 'Відділ закупівель та постачання' },
    { name: 'APPLICANT', description: 'Подавач заявок на закупівлю' },
    { name: 'KITCHEN', description: 'Кухня / харчоблок' },
    { name: 'WAREHOUSE', description: 'Складський облік' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`Role ${role.name} created/updated`);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
