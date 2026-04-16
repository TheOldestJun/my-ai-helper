import { NextResponse } from 'next/server';
import prisma from '@/prisma';

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

export async function GET() {
  try {
    const approvedProducts = await prisma.orderProduct.findMany({
      where: {
        approvedById: {
          not: null,
        },
        rejectedById: null,
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
      orderBy: [
        {
          order: {
            priority: 'desc',
          },
        },
        {
          order: {
            createdAt: 'desc',
          },
        },
      ],
    });

    const formattedProducts = approvedProducts.map((item) => ({
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
    console.error('Помилка при отриманні схвалених заявок:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
