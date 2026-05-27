import { NextResponse } from 'next/server';
import prisma from '@/prisma';

// PATCH /api/dishes/[id] — обновить цену/название блюда
// Тело: { price?, name? } (хотя бы одно поле обязательно)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { price, name } = body;

    const data = {};
    if (price !== undefined) data.price = parseFloat(price);
    if (name !== undefined && name.trim() !== '') data.name = name.trim().toUpperCase();

    const dish = await prisma.dish.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ dish }, { status: 200 });
  } catch (error) {
    console.error('Помилка оновлення страви:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
