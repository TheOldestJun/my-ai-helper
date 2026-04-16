import { NextResponse } from 'next/server';

import prisma from '@/prisma';

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
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { action, userId, rejectionReason } = body;
    const { id } = await params;

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Не вказано дію або ID користувача' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const order = await prisma.order.update({
        where: { id },
        data: {
          approvedById: userId,
          approvedAt: new Date(),
        },
        include: {
          approvedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
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
          rejectedById: userId,
          rejectedAt: new Date(),
          rejectionReason,
        },
        include: {
          rejectedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
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
}

export async function PUT(request, { params }) {
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
        rejectedById: null,
        rejectedAt: null,
        rejectionReason: null,
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
}

export async function DELETE(request, { params }) {
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
    if (existingOrder.approvedById && !existingOrder.rejectedById) {
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
}