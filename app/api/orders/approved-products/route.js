import { NextResponse } from 'next/server';
import prisma from '@/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * API route для получения одобренных товаров
 * 
 * GET /api/orders/approved-products - Получение списка одобренных товаров
 * 
 * Используется исполнителями (снабжение, склад) для отображения товаров,
 * которые нужно заказать или уже поступили на склад.
 * 
 * Возвращает товары в статусе APPROVED и выше, сгруппированные по заявкам.
 * Сортируется по приоритету: URGENT > HIGH > NORMAL > LOW
 */

export const GET = requireAuth(async () => {
  try {
    const approvedProducts = await prisma.orderProduct.findMany({
      where: {
        status: {
          in: ['APPROVED', 'ORDERED', 'PAID', 'IN_TRANSIT'],
        },
      },
      include: {
        order: {
          select: {
            id: true,
            number: true,
            priority: true,
            createdAt: true,
            notes: true,
          },
        },
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
        statusChangedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        order: {
          priority: 'desc',
        },
      },
    });

    // Дополнительная сортировка по createdAt в JavaScript
    const sortedProducts = approvedProducts.sort((a, b) => {
      const priorityOrder = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.order.priority] - priorityOrder[a.order.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.order.createdAt) - new Date(a.order.createdAt);
    });

    const formattedProducts = sortedProducts.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      orderNumber: item.order.number,
      orderPriority: item.order.priority,
      orderCreatedAt: item.order.createdAt,
      orderNotes: item.order.notes,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitId: item.unitId,
      unitName: item.unit.name,
      unitSymbol: item.unit.symbol,
      status: item.status,
      notes: item.notes,
      statusChangedBy: item.statusChangedBy,
      statusChangedAt: item.statusChangedAt,
    }));

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error) {
    console.error('Помилка при отриманні схвалених заявок:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
});
