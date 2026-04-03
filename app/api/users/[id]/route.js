import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, firstName, lastName, roleNames, password } = body;

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Користувача не знайдено' },
        { status: 404 }
      );
    }

    // Если email меняется, проверяем уникальность
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Користувач з таким email вже існує' },
          { status: 409 }
        );
      }
    }

    // Подготавливаем данные для обновления
    const updateData = {
      email: email || existingUser.email,
      firstName: firstName !== undefined ? firstName : existingUser.firstName,
      lastName: lastName !== undefined ? lastName : existingUser.lastName,
    };

    // Если передан пароль - хешируем его
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Если переданы роли - обновляем связи
    if (roleNames && roleNames.length > 0) {
      // Удаляем старые роли
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // Находим новые роли
      const roles = await prisma.role.findMany({
        where: {
          name: {
            in: roleNames.map((name) => name.toUpperCase()),
          },
        },
      });

      // Создаем новые связи
      const rolesConnect = roles.map((role) => ({ roleId: role.id }));

      // Обновляем пользователя с новыми ролями
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          roles: {
            create: rolesConnect,
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: 'Користувача успішно оновлено',
          user: {
            ...updatedUser,
            roles: updatedUser.roles.map((ur) => ur.role),
          },
        },
        { status: 200 }
      );
    }

    // Если роли не менялись - просто обновляем данные
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Користувача успішно оновлено',
        user: {
          ...updatedUser,
          roles: updatedUser.roles.map((ur) => ur.role),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Помилка оновлення користувача:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Користувача не знайдено' },
        { status: 404 }
      );
    }

    // Удаляем связи с ролями
    await prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // Удаляем пользователя
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Користувача успішно видалено' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Помилка видалення користувача:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
