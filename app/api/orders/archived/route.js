import prisma from '@/prisma';
import { NextResponse } from 'next/server';

/**
 * API route для получения архивных заявок
 * 
 * GET /api/orders/archived - Получение списка архивных заявок
 * 
 * Используется снабжением для просмотра архивных заявок.
 * Только снабжение может видеть архивные заявки.
 * Архивные заявки хранятся не старше 3 лет.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Не вказано ID користувача' },
        { status: 400 }
      );
    }

    // Проверка прав: только снабжение может видеть архивные заявки
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const hasSupplyRole = user?.roles?.some(r => r.role.name === 'SUPPLY');
    if (!hasSupplyRole) {
      return NextResponse.json(
        { error: 'Тільки снабження може переглядати архівні заявки' },
        { status: 403 }
      );
    }

    // Получение архивных заявок не старше 3 лет
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const archivedOrders = await prisma.order.findMany({
      where: {
        archivedAt: {
          not: null,
          gte: threeYearsAgo,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        history: {
          include: {
            changedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            changedAt: 'asc',
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            unit: {
              select: {
                id: true,
                name: true,
                symbol: true,
              },
            },
            statusHistory: {
              include: {
                changedBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
              orderBy: {
                changedAt: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        archivedAt: 'desc',
      },
    });

    return NextResponse.json({ orders: archivedOrders }, { status: 200 });
  } catch (error) {
    console.error('Помилка при отриманні архівних заявок:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
