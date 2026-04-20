import { NextResponse } from 'next/server';
import prisma from '@/prisma';

/**
 * API route для управления пунктами заявки
 * 
 * PATCH /api/orders/[id]/products/[productId] - Изменение пункта заявки
 * DELETE /api/orders/[id]/products/[productId] - Удаление пункта заявки
 * 
 * PATCH действия:
 * - approve: Одобрение пункта заявки (для директора)
 * - reject: Отклонение пункта заявки с причиной
 * - changeStatus: Изменение статуса пункта (ORDERED, PAID, IN_TRANSIT, COMPLETED, CANCELLED)
 * 
 * PATCH тело запроса:
 * - action: Тип действия
 * - userId: ID пользователя, выполняющего действие
 * - status: Новый статус (для changeStatus)
 * - rejectionReason: Причина отклонения (для reject)
 */

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { action, userId, rejectionReason, status } = body;
    const { id: orderId, productId } = await params;

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Не вказано дію або ID користувача' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const orderProduct = await prisma.orderProduct.update({
        where: { id: productId },
        data: {
          status: 'APPROVED',
          statusChangedById: userId,
          statusChangedAt: new Date(),
          statusHistory: {
            create: {
              oldStatus: 'PENDING',
              newStatus: 'APPROVED',
              changedById: userId,
            },
          },
        },
      });

      return NextResponse.json(
        { message: 'Пункт заявки успішно погоджено', orderProduct },
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

      const orderProduct = await prisma.orderProduct.update({
        where: { id: productId },
        data: {
          status: 'REJECTED',
          statusChangedById: userId,
          statusChangedAt: new Date(),
          statusHistory: {
            create: {
              oldStatus: 'PENDING',
              newStatus: 'REJECTED',
              changedById: userId,
            },
          },
        },
      });

      return NextResponse.json(
        { message: 'Пункт заявки відхилено', orderProduct },
        { status: 200 }
      );
    }

    if (action === 'changeStatus') {
      if (!status) {
        return NextResponse.json(
          { error: 'Не вказано новий статус' },
          { status: 400 }
        );
      }

      const validStatuses = ['ORDERED', 'PAID', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Невірний статус. Доступні статуси: ORDERED, PAID, IN_TRANSIT, RECEIVED, CANCELLED' },
          { status: 400 }
        );
      }

      // Проверка: статус RECEIVED может устанавливать только склад
      if (status === 'RECEIVED') {
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

        const hasWarehouseRole = user?.roles?.some(r => r.role.name === 'WAREHOUSE');
        if (!hasWarehouseRole) {
          return NextResponse.json(
            { error: 'Статус "Отримано" може встановлювати тільки склад' },
            { status: 403 }
          );
        }
      }

      // Получаем текущий статус для записи в историю
      const currentOrderProduct = await prisma.orderProduct.findUnique({
        where: { id: productId },
        select: { status: true },
      });

      const oldStatus = currentOrderProduct?.status || 'PENDING';

      const orderProduct = await prisma.orderProduct.update({
        where: { id: productId },
        data: {
          status,
          statusChangedById: userId,
          statusChangedAt: new Date(),
          statusHistory: {
            create: {
              oldStatus,
              newStatus: status,
              changedById: userId,
            },
          },
        },
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
        },
      });

      return NextResponse.json(
        { message: 'Статус успішно змінено', orderProduct },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Невірна дія. Доступні дії: approve, reject, changeStatus' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Помилка оновлення пункту заявки:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { quantity, unitId, notes } = body;
    const { id: orderId, productId } = await params;

    // Валидация
    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Вкажіть коректну кількість' },
        { status: 400 }
      );
    }

    if (!unitId) {
      return NextResponse.json(
        { error: 'Вкажіть одиницю виміру' },
        { status: 400 }
      );
    }

    // Обновляем пункт заявки
    const orderProduct = await prisma.orderProduct.update({
      where: { id: productId },
      data: {
        quantity: parseFloat(quantity),
        unitId,
        notes: notes || null,
      },
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
      },
    });

    return NextResponse.json(
      {
        message: 'Пункт заявки успішно оновлено',
        orderProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Помилка оновлення пункту заявки:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: orderId, productId } = await params;

    // Проверяем существование пункта заявки
    const existingOrderProduct = await prisma.orderProduct.findUnique({
      where: { id: productId },
    });

    if (!existingOrderProduct) {
      return NextResponse.json(
        { error: 'Пункт заявки не знайдено' },
        { status: 404 }
      );
    }

    // Проверяем, что пункт не был одобрен (отклоненные можно удалять)
    if (existingOrderProduct.status === 'APPROVED' || existingOrderProduct.status === 'ORDERED' || existingOrderProduct.status === 'PAID' || existingOrderProduct.status === 'IN_TRANSIT' || existingOrderProduct.status === 'RECEIVED') {
      return NextResponse.json(
        { error: 'Неможливо видалити погоджений пункт заявки' },
        { status: 400 }
      );
    }

    // Удаляем пункт заявки
    await prisma.orderProduct.delete({
      where: { id: productId },
    });

    // Проверяем, остались ли пункты в заявке
    const remainingProducts = await prisma.orderProduct.findMany({
      where: { orderId },
    });

    console.log('Remaining products in order:', remainingProducts.length);

    // Если пунктов не осталось, удаляем заявку
    if (remainingProducts.length === 0) {
      console.log('Order is empty, deleting order:', orderId);
      await prisma.order.delete({
        where: { id: orderId },
      });
      return NextResponse.json(
        { message: 'Пункт заявки успішно скасовано. Заявку видалено, оскільки вона стала порожньою.' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Пункт заявки успішно скасовано' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Помилка скасування пункту заявки:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
