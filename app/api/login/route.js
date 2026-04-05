import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Валидация обязательных полей
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email і пароль обов\'язкові' },
        { status: 400 }
      );
    }

    // Поиск пользователя с ролями
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Проверка существования пользователя
    if (!user) {
      return NextResponse.json(
        { error: 'Невірний email або пароль' },
        { status: 401 }
      );
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Невірний email або пароль' },
        { status: 401 }
      );
    }

    // Формируем ответ без пароля
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      })),
    };

    return NextResponse.json(
      {
        message: 'Вхід успішний',
        user: userResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Помилка входу:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
