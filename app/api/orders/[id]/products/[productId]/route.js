import { NextResponse } from 'next/server';
import prisma from '@/prisma';

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
          approvedById: userId,
          approvedAt: new Date(),
          status: 'APPROVED',
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
          rejectedById: userId,
          rejectedAt: new Date(),
          rejectionReason,
          status: 'REJECTED',
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

      const validStatuses = ['ORDERED', 'PAID', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Невірний статус. Доступні статуси: ORDERED, PAID, IN_TRANSIT, COMPLETED, CANCELLED' },
          { status: 400 }
        );
      }

      const orderProduct = await prisma.orderProduct.update({
        where: { id: productId },
        data: {
          status,
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
        rejectedById: null,
        rejectedAt: null,
        rejectionReason: null,
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
    if (existingOrderProduct.approvedById && !existingOrderProduct.rejectedById) {
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
