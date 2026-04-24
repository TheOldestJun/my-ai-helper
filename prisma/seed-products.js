const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
  { name: 'ПІДШИПНИК КОЛІСНИЙ', description: 'Підшипник для колісної пари вагона', sku: 'PK-001' },
  { name: 'ГАЛЬМІВНА КОЛОДКА', description: 'Гальмівна колодка для вагонних гальм', sku: 'GK-002' },
  { name: 'БУКСА З ПІДШИПНИКОМ', description: 'Зібрана букса з підшипниками', sku: 'BZ-003' },
  { name: 'РЕСОРНА БАЛКА', description: 'Ресорна балка для візка вагона', sku: 'RB-004' },
  { name: 'ЦЕНТРАЛЬНИЙ КРІПЛЕННЯ', description: 'Центральне кріплення візка', sku: 'CK-005' },
  { name: 'АВТОЗЧЕПЛЕННЯ', description: 'Автоматичне зчеплення вагонів', sku: 'AZ-006' },
  { name: 'ПОГЛИНАЮЧИЙ АПАРАТ', description: 'Поглинаючий апарат для зчеплення', sku: 'PA-007' },
  { name: 'КОВПАК АВТОЗЧЕПЛЕННЯ', description: 'Захисний ковпак автозчеплення', sku: 'KA-008' },
  { name: 'ВЕНТИЛЯЦІЙНИЙ КЛАПАН', description: 'Вентиляційний клапан для гальмівної системи', sku: 'VK-009' },
  { name: 'ПОВІТРОРОЗПОДІЛЬНИК', description: 'Повітророзподільник для гальмівної системи', sku: 'PR-010' },
  { name: 'ГАЛЬМІВНИЙ ЦИЛІНДР', description: 'Гальмівний циліндр для вагона', sku: 'GC-011' },
  { name: 'РУКАВ ГАЛЬМІВНИЙ', description: 'Гнучкий рукав для гальмівної системи', sku: 'RG-012' },
  { name: 'КЛАПАН ВІДПУСКУ ГАЛЬМ', description: 'Клапан ручного відпуску гальм', sku: 'KG-013' },
  { name: 'РЕЛЕ ТИСКУ', description: 'Реле тиску для гальмівної системи', sku: 'RT-014' },
  { name: 'МАНОМЕТР', description: 'Манометр для контролю тиску', sku: 'MN-015' },
  { name: 'СКЛО БОКОВЕ', description: 'Бокове скло для вагона', sku: 'SB-016' },
  { name: 'ДВЕРНІ ПЕТЛІ', description: 'Петлі для дверей вагона', sku: 'DP-017' },
  { name: 'ЗАМОК ДВЕРНИЙ', description: 'Замковий механізм для дверей вагона', sku: 'ZD-018' },
  { name: 'ПІДЛОГОВЕ ПОКРИТТЯ', description: 'Листи для підлоги вагона', sku: 'PP-019' },
  { name: 'ТЕПЛОІЗОЛЯЦІЙНИЙ МАТ', description: 'Теплоізоляція для стін вагона', sku: 'TM-020' },
];

async function main() {
  console.log('Start seeding products...');

  // Получаем существующие единицы измерения
  const units = await prisma.unit.findMany();
  const unitMap = new Map(units.map(u => [u.symbol, u.id]));

  // Если единицы измерения не найдены, используем ШТ по умолчанию
  const defaultUnitId = unitMap.get('ШТ') || units[0]?.id;

  if (!defaultUnitId) {
    console.error('No units found in database. Please run seed-units.js first.');
    process.exit(1);
  }

  for (const product of products) {
    // Создаем или обновляем продукт
    const createdProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        description: product.description,
      },
      create: {
        name: product.name,
        description: product.description,
        sku: product.sku,
      },
    });
    console.log(`Created/Updated product: ${product.name} (${product.sku})`);

    // Привязываем продукт к единице измерения
    await prisma.productUnit.upsert({
      where: {
        productId_unitId: {
          productId: createdProduct.id,
          unitId: defaultUnitId,
        },
      },
      update: {},
      create: {
        productId: createdProduct.id,
        unitId: defaultUnitId,
      },
    });
    console.log(`  - Linked to unit: ${defaultUnitId}`);
  }

  console.log('\nSeed products completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
