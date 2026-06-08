import prisma from '@/prisma';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export const GET = requireRole('SUPPLY', 'DIRECTORATE', 'WAREHOUSE', 'APPLICANT')(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const user = request.user;
    const userRoleNames = (user.roles || []).map(r => r.name);
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
  }
});
