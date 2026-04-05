import { NextResponse } from 'next/server';
import prisma from '@/prisma';

// GET /api/dishes - получить список блюд
export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ dishes }, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання страв:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// POST /api/dishes - создать новое блюдо
export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Назва страви обов\'язкова' },
        { status: 400 }
      );
    }

    const normalizedName = name.trim().toUpperCase();

    // Перевіряємо чи існує страва з такою назвою
    const existingDish = await prisma.dish.findFirst({
      where: {
        name: {
          contains: normalizedName,
        },
      },
    });

    if (existingDish && existingDish.name.toUpperCase() === normalizedName) {
      return NextResponse.json(
        { error: 'Страва з такою назвою вже існує' },
        { status: 409 }
      );
    }

    // Створюємо нову страву
    const dish = await prisma.dish.create({
      data: {
        name: normalizedName,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { dish, message: 'Страву успішно створено' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Помилка створення страви:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
