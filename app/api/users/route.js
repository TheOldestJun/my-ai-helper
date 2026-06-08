import { NextResponse } from 'next/server';
import prisma from '@/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * API route для управления пользователями
 * 
 * GET /api/users - Получение списка всех пользователей
 * POST /api/users - Создание нового пользователя
 * 
 * POST тело запроса:
 * - email: Email пользователя
 * - password: Пароль пользователя
 * - firstName: Имя пользователя
 * - lastName: Фамилия пользователя
 * - role: Роль пользователя (APPLICANT, DIRECTOR, SUPPLY, WAREHOUSE, KITCHEN)
 */

export const GET = requireAuth(async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Форматируем ответ, преобразуем roles в плоскую структуру
    const formattedUsers = users.map((user) => ({
      ...user,
      roles: user.roles.map((ur) => ur.role),
    }));

    return NextResponse.json({ users: formattedUsers }, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання користувачів:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
});
