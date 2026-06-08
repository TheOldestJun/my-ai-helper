import { NextResponse } from 'next/server';
import prisma from '@/prisma';
import { requireAuth, requireRole } from '@/lib/auth';

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

export const PATCH = requireAuth(async (request, { params }) => {
  try {
    const body = await request.json();
    const { action, rejectionReason, status } = body;
    const user = request.user;
    const { id: orderId, productId } = await params;

    if (!action) {
      return NextResponse.json(
        { error: 'Не вказано дію' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const orderProduct = await prisma.orderProduct.update({
        where: { id: productId },
        data: {
          status: 'APPROVED',
          statusChangedById: user.id,
          statusChangedAt: new Date(),
          statusHistory: {
            create: {
              oldStatus: 'PENDING',
              newStatus: 'APPROVED',
              changedById: user.id,
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
          statusChangedById: user.id,
          statusChangedAt: new Date(),
          statusHistory: {
            create: {
              oldStatus: 'PENDING',
              newStatus: 'REJECTED',
              changedById: user.id,
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

      const userRoles = (user.roles || []).map(r => r.name);
      const hasSupplyRole = userRoles.includes('SUPPLY');
      const hasWarehouseRole = userRoles.includes('WAREHOUSE');

      // Проверка: снабжение может менять статус только до IN_TRANSIT (ORDERED, PAID, IN_TRANSIT)
      if (hasSupplyRole && status === 'RECEIVED') {
        return NextResponse.json(
          { error: 'Снабжение може змінювати статус тільки до "В дорозі"' },
          { status: 403 }
        );
      }

      // Проверка: статус RECEIVED может устанавливать только склад
      if (status === 'RECEIVED' && !hasWarehouseRole) {
        return NextResponse.json(
          { error: 'Статус "Отримано" може встановлювати тільки склад' },
          { status: 403 }
        );
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
          statusChangedById: user.id,
          statusChangedAt: new Date(),
          statusHistory: {
            create: {
              oldStatus,
              newStatus: status,
              changedById: user.id,
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
});

export const PUT = requireAuth(async (request, { params }) => {
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
});

export const DELETE = requireAuth(async (request, { params }) => {
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

    // Если пунктов не осталось, удаляем заявку
    if (remainingProducts.length === 0) {
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
});
