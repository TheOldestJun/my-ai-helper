import { NextResponse } from 'next/server';
import prisma from '@/prisma';

/**
 * API route для управления единицами измерения
 * 
 * GET /api/units - Получение списка всех единиц измерения
 * POST /api/units - Создание новой единицы измерения
 * 
 * POST тело запроса:
 * - name: Название единицы (например, "Кілограм")
 * - symbol: Символ единицы (например, "кг")
 */

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        symbol: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ units }, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання одиниць виміру:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, symbol } = body;

    if (!name || !symbol) {
      return NextResponse.json(
        { error: 'Не вказано назву або символ одиниці виміру' },
        { status: 400 }
      );
    }

    const existing = await prisma.unit.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { symbol: symbol.trim() },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Одиниця виміру з такою назвою або символом вже існує' },
        { status: 409 }
      );
    }

    const unit = await prisma.unit.create({
      data: {
        name: name.trim(),
        symbol: symbol.trim(),
      },
    });

    return NextResponse.json({ unit }, { status: 201 });
  } catch (error) {
    console.error('Помилка створення одиниці виміру:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
