import prisma from '@/prisma';
import { NextResponse } from 'next/server';

/**
 * API route для получения архивных заявок
 * 
 * GET /api/orders/archived - Получение списка архивных заявок
 * 
 * Доступен для ролей: SUPPLY, DIRECTORATE, WAREHOUSE, APPLICANT.
 * Заявитель видит только свои архивные заявки, остальные — все.
 * Архивные заявки хранятся не старше 3 лет.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'Не вказано ID користувача' },
        { status: 400 }
      );
    }

    // Проверка прав: архив доступен для SUPPLY, DIRECTORATE, WAREHOUSE, APPLICANT
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

    const userRoleNames = user?.roles?.map(r => r.role.name) || [];
    const hasAccess = userRoleNames.some(r => ['SUPPLY', 'DIRECTORATE', 'WAREHOUSE', 'APPLICANT'].includes(r));
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Доступ заборонено' },
        { status: 403 }
      );
    }

    const isApplicant = userRoleNames.includes('APPLICANT');

    // Получение архивных заявок не старше 3 лет
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const skip = (page - 1) * limit;

    const [archivedOrders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: {
          archivedAt: {
            not: null,
            gte: threeYearsAgo,
          },
          ...(isApplicant ? { createdById: userId } : {}),
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
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: {
          archivedAt: {
            not: null,
            gte: threeYearsAgo,
          },
          ...(isApplicant ? { createdById: userId } : {}),
        },
      }),
    ]);

    return NextResponse.json({
      orders: archivedOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }, { status: 200 });
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
