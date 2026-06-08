import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';
const TOKEN_EXPIRY = '7d';

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
      })),
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getAuthUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  return verifyToken(token);
}

export function requireAuth(handler) {
  return async (request, ...args) => {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }
    request.user = user;
    return handler(request, ...args);
  };
}

export function requireRole(...roles) {
  return (handler) => {
    return async (request, ...args) => {
      const user = getAuthUser(request);
      if (!user) {
        return NextResponse.json(
          { error: 'Необхідна аутентифікація' },
          { status: 401 }
        );
      }
      const userRoleNames = (user.roles || []).map(r => r.name);
      const hasRole = roles.some(role => userRoleNames.includes(role));
      if (!hasRole) {
        return NextResponse.json(
          { error: 'Недостатньо прав для виконання дії' },
          { status: 403 }
        );
      }
      request.user = user;
      return handler(request, ...args);
    };
  };
}
