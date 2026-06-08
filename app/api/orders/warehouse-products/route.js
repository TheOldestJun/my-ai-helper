import { NextResponse } from 'next/server';
import prisma from '@/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * API route для получения товаров на складе
 * 
 * GET /api/orders/warehouse-products - Получение списка товаров на складе
 * 
 * Используется складом для отображения товаров, которые поступили на склад
 * или находятся в пути (IN_TRANSIT и выше).
 * 
 * Возвращает товары в статусе IN_TRANSIT, RECEIVED, с информацией
 * о том, кто и когда изменил статус.
 */

export const GET = requireAuth(async () => {
  try {
    const warehouseProducts = await prisma.orderProduct.findMany({
      where: {
        status: {
          in: ['IN_TRANSIT', 'RECEIVED'],
        },
        order: {
          archivedAt: null,
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
        statusChangedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            symbol: true,
          },
        },
      },
      orderBy: {
        order: {
          createdAt: 'desc',
        },
      },
    });

    const formattedProducts = warehouseProducts.map((item) => ({
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
    console.error('Помилка при отриманні заявок для складу:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
});