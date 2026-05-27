const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const dishes = [
  // SOUP - Первая страва
  { name: 'БОРЩ', type: 'SOUP', price: 25 },
  { name: 'ЩИ З КАПУСТОЮ', type: 'SOUP', price: 22 },
  { name: 'СУП КАРТОПЛЯНИЙ', type: 'SOUP', price: 20 },
  { name: 'СУП ГОРОХОВИЙ', type: 'SOUP', price: 22 },
  { name: 'СУП ГРИБНИЙ', type: 'SOUP', price: 28 },
  { name: 'СУП РИБНИЙ', type: 'SOUP', price: 30 },
  { name: 'СУП КУРЯЧИЙ', type: 'SOUP', price: 25 },
  { name: 'СУП ЛОБІО', type: 'SOUP', price: 28 },
  { name: 'ОКРОШКА', type: 'SOUP', price: 20 },
  { name: 'СУП М\'ЯСНИЙ З ОВОЧАМИ', type: 'SOUP', price: 30 },

  // GARNISH - Гарнір
  { name: 'КАРТОПЛЯ ВАРЕНА', type: 'GARNISH', price: 15 },
  { name: 'КАРТОПЛЯ ФРИ', type: 'GARNISH', price: 25 },
  { name: 'ГРЕЧКА ВАРЕНА', type: 'GARNISH', price: 15 },
  { name: 'РИС ВАРЕНИЙ', type: 'GARNISH', price: 15 },
  { name: 'МАКАРОНИ ВАРЕНІ', type: 'GARNISH', price: 15 },
  { name: 'ПЛОВ', type: 'GARNISH', price: 28 },
  { name: 'КУКУРУДЗА ВАРЕНА', type: 'GARNISH', price: 20 },
  { name: 'ОВОЧІ ПАСЕРОВАНІ', type: 'GARNISH', price: 22 },
  { name: 'ПЮРЕ КАРТОПЛЯНЕ', type: 'GARNISH', price: 18 },
  { name: 'КЛУБНЯ ВАРЕНА', type: 'GARNISH', price: 18 },

  // MEAT - М'ясна страва
  { name: 'КОТЛЕТА КУРЯЧА', type: 'MEAT', price: 35 },
  { name: 'КОТЛЕТА СВИНА', type: 'MEAT', price: 35 },
  { name: 'ГОВЯДИНА ВАРЕНА', type: 'MEAT', price: 45 },
  { name: 'СВИНИНА ВАРЕНА', type: 'MEAT', price: 40 },
  { name: 'КУРКА ВАРЕНА', type: 'MEAT', price: 35 },
  { name: 'ШНИЦЕЛЬ', type: 'MEAT', price: 40 },
  { name: 'ТЕЛЕЧА ВАРЕНА', type: 'MEAT', price: 45 },
  { name: 'РИБКА ВАРЕНА', type: 'MEAT', price: 38 },
  { name: 'РІБЛЕТКИ', type: 'MEAT', price: 42 },
  { name: 'ГУЛЯШ', type: 'MEAT', price: 40 },

  // SALAD - Салат
  { name: 'САЛАТ ВІТРИНА', type: 'SALAD', price: 25 },
  { name: 'САЛАТ ОГУРЕЦЬ', type: 'SALAD', price: 20 },
  { name: 'САЛАТ КАПУСТА', type: 'SALAD', price: 18 },
  { name: 'САЛАТ МОРКВА', type: 'SALAD', price: 18 },
  { name: 'САЛАТ БУРЯК', type: 'SALAD', price: 20 },
  { name: 'САЛАТ ЗЕЛЕНЫЙ', type: 'SALAD', price: 22 },
  { name: 'САЛАТ ЦЕЗАР', type: 'SALAD', price: 35 },
  { name: 'САЛАТ ГРЕЦЬКИЙ', type: 'SALAD', price: 32 },
  { name: 'САЛАТ ОЛІВ\'Є', type: 'SALAD', price: 28 },
  { name: 'КОМПОТ З СУХОФРУКТІВ', type: 'SALAD', price: 18 },

  // BAKERY - Випічка
  { name: 'ХЛІБ', type: 'BAKERY', price: 5 },
  { name: 'БУЛКА', type: 'BAKERY', price: 8 },
  { name: 'БАТОН', type: 'BAKERY', price: 7 },
  { name: 'ПІРОГ З КАРТОПЛЕЮ', type: 'BAKERY', price: 15 },
  { name: 'ПІРОГ З КАПУСТОЮ', type: 'BAKERY', price: 15 },
  { name: 'ВАРЕНИКИ З КАРТОПЛЕЮ', type: 'BAKERY', price: 25 },
  { name: 'ВАРЕНИКИ З КАПУСТОЮ', type: 'BAKERY', price: 25 },
  { name: 'ПЕЛЬМЕНІ', type: 'BAKERY', price: 30 },
  { name: 'МАНТИ', type: 'BAKERY', price: 32 },
  { name: 'БЛИНЦІ', type: 'BAKERY', price: 20 },

  // DRINK - Напій
  { name: 'ЧАЙ', type: 'DRINK', price: 10 },
  { name: 'КАВА', type: 'DRINK', price: 15 },
  { name: 'СІК ЯБЛУЧНИЙ', type: 'DRINK', price: 18 },
  { name: 'СІК АПЕЛЬСИНОВИЙ', type: 'DRINK', price: 20 },
  { name: 'СІК ТОМАТНИЙ', type: 'DRINK', price: 18 },
  { name: 'КОМПОТ', type: 'DRINK', price: 12 },
  { name: 'КВАС', type: 'DRINK', price: 12 },
  { name: 'МИНЕРАЛЬНА ВОДА', type: 'DRINK', price: 15 },
  { name: 'МОЛОКО', type: 'DRINK', price: 14 },
  { name: 'КЕФІР', type: 'DRINK', price: 16 },
];

async function main() {
  console.log('Start seeding dishes...');

  for (const dish of dishes) {
    await prisma.dish.upsert({
      where: { name: dish.name },
      update: {
        type: dish.type,
        price: dish.price,
      },
      create: {
        name: dish.name,
        type: dish.type,
        price: dish.price,
      },
    });
    console.log(`Created/Updated dish: ${dish.name} (${dish.type}) — ${dish.price}₴`);
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
