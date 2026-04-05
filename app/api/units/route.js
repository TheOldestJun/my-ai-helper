import { NextResponse } from 'next/server';
import prisma from '@/prisma';

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
