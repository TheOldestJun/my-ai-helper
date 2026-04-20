import bcrypt from 'bcryptjs';

import prisma from './index.js';

async function main() {
  const usersData = [
    {
      email: "admin@mail.com",
      password: "admin123",
      firstName: "Станислав",
      lastName: "Пуха",
      roleName: ["ADMIN", "SUPPLY", "APPLICANT", "KITCHEN", "WAREHOUSE", "DIRECTORATE"],
    },
    {
      email: "admin@test.com",
      password: "admin123",
      firstName: "Адмін",
      lastName: "Головний",
      roleName: "ADMIN",
    },
    {
      email: "supply@test.com",
      password: "supply123",
      firstName: "Олег",
      lastName: "Закупівельник",
      roleName: "SUPPLY",
    },
    {
      email: "applicant@test.com",
      password: "applicant123",
      firstName: "Марія",
      lastName: "Заявниця",
      roleName: "APPLICANT",
    },
    {
      email: "kitchen@test.com",
      password: "kitchen123",
      firstName: "Іван",
      lastName: "Кухар",
      roleName: "KITCHEN",
    },
    {
      email: "warehouse@test.com",
      password: "warehouse123",
      firstName: "Петро",
      lastName: "Складник",
      roleName: "WAREHOUSE",
    },
    {
      email: "director@test.com",
      password: "director123",
      firstName: "Директор",
      lastName: "Директорат",
      roleName: "DIRECTORATE",
    },
  ];

  for (const userData of usersData) {
    const { email, password, firstName, lastName, roleName } = userData;

    // Normalize roleName to array
    const roleNames = Array.isArray(roleName) ? roleName : [roleName];

    // Ищем роли
    const roles = await prisma.role.findMany({
      where: { name: { in: roleNames } },
    });

    if (roles.length !== roleNames.length) {
      console.error(`Not all roles found for ${email}!`);
      continue;
    }

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (existingUser) {
      // Обновляем роли существующего пользователя
      // Удаляем текущие роли
      await prisma.userRole.deleteMany({
        where: { userId: existingUser.id },
      });

      // Добавляем новые роли
      for (const role of roles) {
        await prisma.userRole.create({
          data: {
            userId: existingUser.id,
            roleId: role.id,
          },
        });
      }

      console.log(`Updated user: ${email} with roles: ${roleNames.join(', ')}`);
      continue;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя с ролями
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles: {
          create: roles.map(role => ({ roleId: role.id })),
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

    console.log(`Created user: ${user.email} with roles: ${user.roles.map(r => r.role.name).join(', ')}`);
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