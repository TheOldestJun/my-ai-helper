import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, roleNames } = body;

    // Валидация обязательных полей
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email і пароль обов\'язкові' },
        { status: 400 }
      );
    }

    // Валидация формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Невірний формат email' },
        { status: 400 }
      );
    }

    // Валидация длины пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль має бути не менше 6 символів' },
        { status: 400 }
      );
    }

    // Проверка, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Користувач з таким email вже існує' },
        { status: 409 }
      );
    }

    // Поиск ролей
    let rolesConnect = [];
    if (roleNames && roleNames.length > 0) {
      const roles = await prisma.role.findMany({
        where: {
          name: {
            in: roleNames.map((name) => name.toUpperCase()),
          },
        },
      });

      if (roles.length !== roleNames.length) {
        const foundNames = roles.map((r) => r.name);
        const notFound = roleNames.filter((name) => !foundNames.includes(name.toUpperCase()));
        return NextResponse.json(
          { error: `Ролі не знайдено: ${notFound.join(', ')}` },
          { status: 400 }
        );
      }

      rolesConnect = roles.map((role) => ({ roleId: role.id }));
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя с ролями
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles: {
          create: rolesConnect,
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
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Користувача успішно створено',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
