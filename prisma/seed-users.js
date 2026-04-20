import bcrypt from 'bcryptjs';

import prisma from './index.js';

async function main() {
  const usersData = [
    {
      email: 'admin@mail.com',
      password: 'admin123',
      firstName: 'Станислав',
      lastName: 'Пуха',
      roleName: 'ADMIN',
    },
    {
      email: 'admin@test.com',
      password: 'admin123',
      firstName: 'Адмін',
      lastName: 'Головний',
      roleName: 'ADMIN',
    },
    {
      email: 'supply@test.com',
      password: 'supply123',
      firstName: 'Олег',
      lastName: 'Закупівельник',
      roleName: 'SUPPLY',
    },
    {
      email: 'applicant@test.com',
      password: 'applicant123',
      firstName: 'Марія',
      lastName: 'Заявниця',
      roleName: 'APPLICANT',
    },
    {
      email: 'kitchen@test.com',
      password: 'kitchen123',
      firstName: 'Іван',
      lastName: 'Кухар',
      roleName: 'KITCHEN',
    },
    {
      email: 'warehouse@test.com',
      password: 'warehouse123',
      firstName: 'Петро',
      lastName: 'Складник',
      roleName: 'WAREHOUSE',
    },
    {
      email: 'director@test.com',
      password: 'director123',
      firstName: 'Директор',
      lastName: 'Директорат',
      roleName: 'DIRECTORATE',
    },
  ];

  for (const userData of usersData) {
    const { email, password, firstName, lastName, roleName } = userData;

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User ${email} already exists, skipping...`);
      continue;
    }

    // Ищем роль
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      console.error(`Role ${roleName} not found!`);
      continue;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя с ролью
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles: {
          create: [{ roleId: role.id }],
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: {
          select: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });

    console.log(`Created user: ${user.email} with role: ${user.roles[0].role.name}`);
    console.log(`  Password: ${password}`);
  }

  console.log('\nSeed users completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });