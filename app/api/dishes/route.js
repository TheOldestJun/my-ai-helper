import { NextResponse } from 'next/server';
import prisma from '@/prisma';

/**
 * API route для управления стравами
 * 
 * GET /api/dishes - Получение списка всех страв
 * POST /api/dishes - Создание новой стравы
 * 
 * POST тело запроса:
 * - name: Название стравы
 * - type: Тип стравы (SOUP, GARNISH, MEAT, SALAD, BAKERY, DRINK)
 */

// GET /api/dishes - получить список блюд
export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
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
    const { name, type, price } = body;

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
        type: type || 'SOUP',
        price: price !== undefined ? parseFloat(price) : 0,
      },
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
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
