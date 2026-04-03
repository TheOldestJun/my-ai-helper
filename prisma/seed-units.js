const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const units = [
  { name: 'Штука', symbol: 'шт', description: 'Кількість одиничних виробів' },
  { name: 'Кілограм', symbol: 'кг', description: 'Маса в кілограмах' },
  { name: 'Грам', symbol: 'г', description: 'Маса в грамах' },
  { name: 'Літр', symbol: 'л', description: 'Об\'єм рідини в літрах' },
  { name: 'Мілілітр', symbol: 'мл', description: 'Об\'єм рідини в мілілітрах' },
  { name: 'Метр', symbol: 'м', description: 'Довжина в метрах' },
  { name: 'Сантиметр', symbol: 'см', description: 'Довжина в сантиметрах' },
  { name: 'Міліметр', symbol: 'мм', description: 'Довжина в міліметрах' },
  { name: 'Квадратний метр', symbol: 'м²', description: 'Площа в квадратних метрах' },
  { name: 'Кубічний метр', symbol: 'м³', description: 'Об\'єм в кубічних метрах' },
  { name: 'Упаковка', symbol: 'упак', description: 'Кількість упаковок' },
  { name: 'Коробка', symbol: 'кор', description: 'Кількість коробок' },
  { name: 'Ящик', symbol: 'ящ', description: 'Кількість ящиків' },
  { name: 'Палета', symbol: 'пал', description: 'Кількість палет' },
  { name: 'Пляшка', symbol: 'пляш', description: 'Кількість пляшок' },
  { name: 'Банка', symbol: 'бан', description: 'Кількість банок' },
  { name: 'Мішок', symbol: 'міш', description: 'Кількість мішків' },
  { name: 'Рулон', symbol: 'рул', description: 'Кількість рулонів' },
  { name: 'Пачка', symbol: 'пач', description: 'Кількість пачок' },
  { name: 'Тюбик', symbol: 'тюб', description: 'Кількість тюбиків' },
  { name: 'Флакон', symbol: 'фл', description: 'Кількість флаконів' },
  { name: 'Каністра', symbol: 'кан', description: 'Кількість каністр' },
  { name: 'Відро', symbol: 'від', description: 'Кількість відер' },
  { name: 'Серветка', symbol: 'серв', description: 'Кількість серветок' },
  { name: 'Пара', symbol: 'пар', description: 'Кількість пар' },
  { name: 'Комплект', symbol: 'компл', description: 'Кількість комплектів' },
  { name: 'Набір', symbol: 'наб', description: 'Кількість наборів' },
  { name: 'Блок', symbol: 'бл', description: 'Кількість блоків' },
  { name: 'Пакет', symbol: 'пак', description: 'Кількість пакетів' },
  { name: 'Касета', symbol: 'кас', description: 'Кількість касет' },
  { name: 'Картридж', symbol: 'карт', description: 'Кількість картриджів' },
  { name: 'Тонна', symbol: 'т', description: 'Маса в тоннах' },
  { name: 'Центнер', symbol: 'ц', description: 'Маса в центнерах' },
  { name: 'Кіловат', symbol: 'кВт', description: 'Потужність в кіловатах' },
  { name: 'Кіловат-година', symbol: 'кВт·год', description: 'Енергія в кіловат-годинах' },
  { name: 'Гігакалорія', symbol: 'Гкал', description: 'Теплова енергія' },
  { name: 'Кубометр', symbol: 'куб.м', description: 'Об\'єм газу або рідини' },
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
