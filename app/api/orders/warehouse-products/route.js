import { NextResponse } from 'next/server';
import prisma from '@/prisma';

/**
 * API route для получения товаров на складе
 * 
 * GET /api/orders/warehouse-products - Получение списка товаров на складе
 * 
 * Используется складом для отображения товаров, которые поступили на склад
 * или находятся в пути (IN_TRANSIT и выше).
 * 
 * Возвращает товары в статусе IN_TRANSIT, COMPLETED, с информацией
 * о том, кто и когда изменил статус.
 */

export async function GET() {
  try {
    const warehouseProducts = await prisma.orderProduct.findMany({
      where: {
        approvedById: {
          not: null,
        },
        rejectedById: null,
        status: {
          in: ['IN_TRANSIT', 'COMPLETED'],
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
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      approvedBy: item.approvedBy,
      approvedAt: item.approvedAt,
      statusChangedBy: item.statusChangedBy,
      statusChangedAt: item.statusChangedAt,
    }));

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error) {
    console.error('Помилка при отриманні заявок для складу:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}