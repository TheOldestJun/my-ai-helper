import { NextResponse } from 'next/server';
import prisma from '@/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * API route для управления товарами
 * 
 * GET /api/products - Получение списка всех товаров
 * POST /api/products - Создание нового товара
 * 
 * POST тело запроса:
 * - name: Название товара
 * - description: Описание товара
 */

export const GET = requireAuth(async () => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        units: {
          select: {
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
      orderBy: {
        name: 'asc',
      },
    });

    // Форматируем ответ
    const formattedProducts = products.map((p) => ({
      ...p,
      units: p.units.map((u) => u.unit),
    }));

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання товарів:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request) => {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Назва товару обов\'язкова' },
        { status: 400 }
      );
    }

    // Нормалізуємо назву до верхнього регістру
    const normalizedName = name.trim().toUpperCase();

    // Перевіряємо, чи існує товар з такою назвою
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          contains: normalizedName,
        },
      },
    });

    // Додаткова перевірка на точний збіг
    if (existingProduct && existingProduct.name.toUpperCase() === normalizedName) {
      return NextResponse.json(
        { error: 'Товар з такою назвою вже існує' },
        { status: 409 }
      );
    }

    // Створюємо новий товар
    const product = await prisma.product.create({
      data: {
        name: normalizedName,
        description: description?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        units: {
          select: {
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

    const formattedProduct = {
      ...product,
      units: product.units.map((u) => u.unit),
    };

    return NextResponse.json(
      { product: formattedProduct, message: 'Товар успішно створено' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Помилка створення товару:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
});