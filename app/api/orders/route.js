import { NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function GET(request) {
  try {
    // Получаем userId из query параметра (временное решение до добавления auth middleware)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const whereClause = userId ? { createdById: userId } : {};

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        number: true,
        priority: true,
        notes: true,
        createdAt: true,
        approvedById: true,
        approvedAt: true,
        rejectedById: true,
        rejectedAt: true,
        rejectionReason: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        products: {
          select: {
            id: true,
            quantity: true,
            status: true,
            notes: true,
            approvedById: true,
            approvedAt: true,
            approvedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            rejectedById: true,
            rejectedAt: true,
            rejectionReason: true,
            statusChangedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            statusChangedAt: true,
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Удаляем пустые заявки
    const emptyOrders = orders.filter(order => order.products.length === 0);
    for (const emptyOrder of emptyOrders) {
      await prisma.order.delete({
        where: { id: emptyOrder.id },
      });
      console.log('Deleted empty order:', emptyOrder.number);
    }

    // Возвращаем только непустые заявки
    const nonEmptyOrders = orders.filter(order => order.products.length > 0);

    return NextResponse.json({ orders: nonEmptyOrders }, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання замовлень:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { priority, notes, products, userId } = body;

    // Валидация
    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'Додайте хоча б один товар' },
        { status: 400 }
      );
    }

    // Проверяем товары
    for (const item of products) {
      if (!item.productId || !item.unitId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Заповніть всі поля для кожного товару' },
          { status: 400 }
        );
      }
    }

    // Получаем текущего пользователя из localStorage на клиенте
    // или используем userId из запроса (временное решение)
    const currentUserId = userId || 'system';

    // Генерируем номер заказа (формат: ЗАМ-YYYYMMDD-XXX)
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.order.count({
      where: {
        number: {
          startsWith: `ЗАМ-${datePrefix}`,
        },
      },
    });
    const orderNumber = `ЗАМ-${datePrefix}-${String(count + 1).padStart(3, '0')}`;

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        number: orderNumber,
        priority: priority || 'NORMAL',
        notes: notes || null,
        createdById: currentUserId,
        products: {
          create: products.map((item) => ({
            productId: item.productId,
            unitId: item.unitId,
            quantity: item.quantity,
            notes: item.notes || null,
          })),
        },
      },
      select: {
        id: true,
        number: true,
        priority: true,
        notes: true,
        createdAt: true,
        products: {
          select: {
            id: true,
            quantity: true,
            status: true,
            notes: true,
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
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Замовлення успішно створено',
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Помилка створення замовлення:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
