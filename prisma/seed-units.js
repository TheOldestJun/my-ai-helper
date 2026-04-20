
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const units = [
  { name: 'Штука', symbol: 'ШТ', description: 'Кількість одиничних виробів' },
  { name: 'Кілограм', symbol: 'КГ', description: 'Маса в кілограмах' },
  { name: 'Грам', symbol: 'Г', description: 'Маса в грамах' },
  { name: 'Літр', symbol: 'Л', description: 'Об\'єм рідини в літрах' },
  { name: 'Мілілітр', symbol: 'МЛ', description: 'Об\'єм рідини в мілілітрах' },
  { name: 'Метр', symbol: 'М', description: 'Довжина в метрах' },
  { name: 'Сантиметр', symbol: 'СМ', description: 'Довжина в сантиметрах' },
  { name: 'Міліметр', symbol: 'ММ', description: 'Довжина в міліметрах' },
  { name: 'Квадратний метр', symbol: 'М²', description: 'Площа в квадратних метрах' },
  { name: 'Кубічний метр', symbol: 'М³', description: 'Об\'єм в кубічних метрах' },
  { name: 'Упаковка', symbol: 'УПАК', description: 'Кількість упаковок' },
  { name: 'Коробка', symbol: 'КОР', description: 'Кількість коробок' },
  { name: 'Ящик', symbol: 'ЯЩ', description: 'Кількість ящиків' },
  { name: 'Палета', symbol: 'ПАЛ', description: 'Кількість палет' },
  { name: 'Пляшка', symbol: 'ПЛЯШ', description: 'Кількість пляшок' },
  { name: 'Банка', symbol: 'БАН', description: 'Кількість банок' },
  { name: 'Мішок', symbol: 'МІШ', description: 'Кількість мішків' },
  { name: 'Рулон', symbol: 'РУЛ', description: 'Кількість рулонів' },
  { name: 'Пачка', symbol: 'ПАЧ', description: 'Кількість пачок' },
  { name: 'Тюбик', symbol: 'ТЮБ', description: 'Кількість тюбиків' },
  { name: 'Флакон', symbol: 'ФЛ', description: 'Кількість флаконів' },
  { name: 'Каністра', symbol: 'КАН', description: 'Кількість каністр' },
  { name: 'Відро', symbol: 'ВІД', description: 'Кількість відер' },
  { name: 'Пара', symbol: 'ПАР', description: 'Кількість пар' },
  { name: 'Комплект', symbol: 'КОМПЛ', description: 'Кількість комплектів' },
  { name: 'Набір', symbol: 'НАБ', description: 'Кількість наборів' },
  { name: 'Блок', symbol: 'БЛ', description: 'Кількість блоків' },
  { name: 'Пакет', symbol: 'ПАК', description: 'Кількість пакетів' },
  { name: 'Касета', symbol: 'КАС', description: 'Кількість касет' },
  { name: 'Картридж', symbol: 'КАРТ', description: 'Кількість картриджів' },
  { name: 'Тонна', symbol: 'Т', description: 'Маса в тоннах' },
];

async function main() {
  console.log('Start seeding units...');

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: {
        symbol: unit.symbol,
        description: unit.description,
      },
      create: {
        name: unit.name,
        symbol: unit.symbol,
        description: unit.description,
      },
    });
    console.log(`Created/Updated unit: ${unit.name} (${unit.symbol})`);
  }

  console.log('\nSeed units completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });