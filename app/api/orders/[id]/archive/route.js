import prisma from '@/prisma';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export const PATCH = requireRole('APPLICANT')(async (request, { params }) => {
  try {
    const orderId = (await params).id;
    const user = request.user;

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

    if (order.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Ви можете архівувати тільки свої заявки' },
        { status: 403 }
      );
    }

    const allProductsReceived = order.products.every(
      product => product.status === 'RECEIVED'
    );

    if (!allProductsReceived) {
      return NextResponse.json(
        { error: 'Можна архівувати тільки заявки з усіма отриманими товарами' },
        { status: 400 }
      );
    }

    const archivedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        archivedAt: new Date(),
        history: {
          create: {
            action: 'ARCHIVED',
            changedById: user.id,
          },
        },
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
  }
});
