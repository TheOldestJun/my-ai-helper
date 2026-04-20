import prisma from '@/prisma';
import { NextResponse } from 'next/server';

/**
 * API route для архивации заявки
 * 
 * PATCH /api/orders/[id]/archive - Архивация заявки
 * 
 * Используется заявителем для закрытия заявки после получения всех товаров.
 * Только заявитель может архивировать свои заявки.
 * Заявка должна иметь статус RECEIVED для всех товаров.
 */
export async function PATCH(request, { params }) {
  try {
    const orderId = (await params).id;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Не вказано ID користувача' },
        { status: 400 }
      );
    }

    // Проверка прав: только заявитель может архивировать свои заявки
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

    const hasApplicantRole = user?.roles?.some(r => r.role.name === 'APPLICANT');
    if (!hasApplicantRole) {
      return NextResponse.json(
        { error: 'Тільки заявник може архівувати заявки' },
        { status: 403 }
      );
    }

    // Проверка, что заявка принадлежит пользователю
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        products: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заявку не знайдено' },
        { status: 404 }
      );
    }

    if (order.createdById !== userId) {
      return NextResponse.json(
        { error: 'Ви можете архівувати тільки свої заявки' },
        { status: 403 }
      );
    }

    // Проверка, что все товары имеют статус RECEIVED
    const allProductsReceived = order.products.every(
      product => product.status === 'RECEIVED'
    );

    if (!allProductsReceived) {
      return NextResponse.json(
        { error: 'Можна архівувати тільки заявки з усіма отриманими товарами' },
        { status: 400 }
      );
    }

    // Архивация заявки
    const archivedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        archivedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: 'Заявку успішно архівовано', order: archivedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error('Помилка при архівуванні заявки:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
