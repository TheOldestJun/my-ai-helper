const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const dishes = [
  // SOUP - Первая страва
  { name: 'БОРЩ', type: 'SOUP' },
  { name: 'ЩИ З КАПУСТОЮ', type: 'SOUP' },
  { name: 'СУП КАРТОПЛЯНИЙ', type: 'SOUP' },
  { name: 'СУП ГОРОХОВИЙ', type: 'SOUP' },
  { name: 'СУП ГРИБНИЙ', type: 'SOUP' },
  { name: 'СУП РИБНИЙ', type: 'SOUP' },
  { name: 'СУП КУРЯЧИЙ', type: 'SOUP' },
  { name: 'СУП ЛОБІО', type: 'SOUP' },
  { name: 'ОКРОШКА', type: 'SOUP' },
  { name: 'СУП М\'ЯСНИЙ З ОВОЧАМИ', type: 'SOUP' },

  // GARNISH - Гарнір
  { name: 'КАРТОПЛЯ ВАРЕНА', type: 'GARNISH' },
  { name: 'КАРТОПЛЯ ФРИ', type: 'GARNISH' },
  { name: 'ГРЕЧКА ВАРЕНА', type: 'GARNISH' },
  { name: 'РИС ВАРЕНИЙ', type: 'GARNISH' },
  { name: 'МАКАРОНИ ВАРЕНІ', type: 'GARNISH' },
  { name: 'ПЛОВ', type: 'GARNISH' },
  { name: 'КУКУРУДЗА ВАРЕНА', type: 'GARNISH' },
  { name: 'ОВОЧІ ПАСЕРОВАНІ', type: 'GARNISH' },
  { name: 'ПЮРЕ КАРТОПЛЯНЕ', type: 'GARNISH' },
  { name: 'КЛУБНЯ ВАРЕНА', type: 'GARNISH' },

  // MEAT - М'ясна страва
  { name: 'КОТЛЕТА КУРЯЧА', type: 'MEAT' },
  { name: 'КОТЛЕТА СВИНА', type: 'MEAT' },
  { name: 'ГОВЯДИНА ВАРЕНА', type: 'MEAT' },
  { name: 'СВИНИНА ВАРЕНА', type: 'MEAT' },
  { name: 'КУРКА ВАРЕНА', type: 'MEAT' },
  { name: 'ШНИЦЕЛЬ', type: 'MEAT' },
  { name: 'ТЕЛЕЧА ВАРЕНА', type: 'MEAT' },
  { name: 'РИБКА ВАРЕНА', type: 'MEAT' },
  { name: 'РІБЛЕТКИ', type: 'MEAT' },
  { name: 'ГУЛЯШ', type: 'MEAT' },

  // SALAD - Салат
  { name: 'САЛАТ ВІТРИНА', type: 'SALAD' },
  { name: 'САЛАТ ОГУРЕЦЬ', type: 'SALAD' },
  { name: 'САЛАТ КАПУСТА', type: 'SALAD' },
  { name: 'САЛАТ МОРКВА', type: 'SALAD' },
  { name: 'САЛАТ БУРЯК', type: 'SALAD' },
  { name: 'САЛАТ ЗЕЛЕНЫЙ', type: 'SALAD' },
  { name: 'САЛАТ ЦЕЗАР', type: 'SALAD' },
  { name: 'САЛАТ ГРЕЦЬКИЙ', type: 'SALAD' },
  { name: 'САЛАТ ОЛІВ\'Є', type: 'SALAD' },
  { name: 'КОМПОТ З СУХОФРУКТІВ', type: 'SALAD' },

  // BAKERY - Випічка
  { name: 'ХЛІБ', type: 'BAKERY' },
  { name: 'БУЛКА', type: 'BAKERY' },
  { name: 'БАТОН', type: 'BAKERY' },
  { name: 'ПІРОГ З КАРТОПЛЕЮ', type: 'BAKERY' },
  { name: 'ПІРОГ З КАПУСТОЮ', type: 'BAKERY' },
  { name: 'ВАРЕНИКИ З КАРТОПЛЕЮ', type: 'BAKERY' },
  { name: 'ВАРЕНИКИ З КАПУСТОЮ', type: 'BAKERY' },
  { name: 'ПЕЛЬМЕНІ', type: 'BAKERY' },
  { name: 'МАНТИ', type: 'BAKERY' },
  { name: 'БЛИНЦІ', type: 'BAKERY' },

  // DRINK - Напій
  { name: 'ЧАЙ', type: 'DRINK' },
  { name: 'КАВА', type: 'DRINK' },
  { name: 'СІК ЯБЛУЧНИЙ', type: 'DRINK' },
  { name: 'СІК АПЕЛЬСИНОВИЙ', type: 'DRINK' },
  { name: 'СІК ТОМАТНИЙ', type: 'DRINK' },
  { name: 'КОМПОТ', type: 'DRINK' },
  { name: 'КВАС', type: 'DRINK' },
  { name: 'МИНЕРАЛЬНА ВОДА', type: 'DRINK' },
  { name: 'МОЛОКО', type: 'DRINK' },
  { name: 'КЕФІР', type: 'DRINK' },
];

async function main() {
  console.log('Start seeding dishes...');

  for (const dish of dishes) {
    await prisma.dish.upsert({
      where: { name: dish.name },
      update: {
        type: dish.type,
      },
      create: {
        name: dish.name,
        type: dish.type,
      },
    });
    console.log(`Created/Updated dish: ${dish.name} (${dish.type})`);
  }

  console.log('\nSeed dishes completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
