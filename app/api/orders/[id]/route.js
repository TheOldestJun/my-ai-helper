import { NextResponse } from 'next/server';

import prisma from '@/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * API route для управления конкретной заявкой
 * 
 * GET /api/orders/[id] - Получение заявки по ID
 * PATCH /api/orders/[id] - Одобрение/отклонение заявки
 * PUT /api/orders/[id] - Обновление заявки
 * DELETE /api/orders/[id] - Удаление заявки
 * 
 * PATCH действия:
 * - approve: Одобрение заявки (для директора)
 * - reject: Отклонение заявки с причиной
 * 
 * PUT тело запроса:
 * - priority: Новый приоритет
 * - notes: Новые примечания
 * - products: Массив товаров для обновления
 */
export const PATCH = requireAuth(async (request, { params }) => {
  try {
    const body = await request.json();
    const { action, rejectionReason } = body;
    const user = request.user;
    const { id } = await params;

    if (!action) {
      return NextResponse.json(
        { error: 'Не вказано дію' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const order = await prisma.order.update({
        where: { id },
        data: {
          history: {
            create: {
              action: 'APPROVED',
              changedById: user.id,
            },
          },
        },
      });

      return NextResponse.json(
        { message: 'Заявку успішно погоджено', order },
        { status: 200 }
      );
    }

    if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Не вказано причину відмови' },
          { status: 400 }
        );
      }

      const order = await prisma.order.update({
        where: { id },
        data: {
          history: {
            create: {
              action: 'REJECTED',
              changedById: user.id,
              reason: rejectionReason,
            },
          },
        },
      });

      return NextResponse.json(
        { message: 'Заявку відхилено', order },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Невірна дія. Доступні дії: approve, reject' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Помилка оновлення заявки:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request, { params }) => {
  try {
    const body = await request.json();
    const { priority, notes, products } = body;
    const { id } = await params;

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

    // Получаем текущий заказ
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Заявку не знайдено' },
        { status: 404 }
      );
    }

    // Удаляем старые продукты заказа
    await prisma.orderProduct.deleteMany({
      where: { orderId: id },
    });

    // Обновляем заказ
    const order = await prisma.order.update({
      where: { id },
      data: {
        priority: priority || existingOrder.priority,
        notes: notes || null,
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
        message: 'Заявку успішно оновлено',
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Помилка оновлення заявки:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request, { params }) => {
  try {
    const { id } = await params;

    // Проверяем существование заказа
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Заявку не знайдено' },
        { status: 404 }
      );
    }

    // Проверяем, что заявка не была одобрена (но можно удалять отклоненные)
    const orderHistory = await prisma.orderHistory.findFirst({
      where: {
        orderId: id,
        action: 'APPROVED',
      },
    });

    if (orderHistory) {
      return NextResponse.json(
        { error: 'Неможливо видалити погоджену заявку' },
        { status: 400 }
      );
    }

    // Удаляем продукты заказа
    await prisma.orderProduct.deleteMany({
      where: { orderId: id },
    });

    // Удаляем заказ
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Заявку успішно скасовано' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Помилка скасування заявки:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
});