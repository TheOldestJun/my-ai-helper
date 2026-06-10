import { POST } from '@/app/api/login/route';
import bcrypt from 'bcryptjs';

jest.mock('@/prisma');

const prisma = require('@/prisma').default;

const mockUser = {
  id: 'user-1',
  email: 'admin@test.com',
  password: bcrypt.hashSync('correct-password', 10),
  firstName: 'Admin',
  lastName: 'User',
  roles: [
    {
      role: {
        id: 'role-1',
        name: 'ADMIN',
        description: 'Administrator',
      },
    },
  ],
};

function createLoginRequest(body, ip = '127.0.0.1') {
  return {
    headers: new Map([
      ['x-forwarded-for', ip],
      ['content-type', 'application/json'],
    ]),
    json: () => Promise.resolve(body),
  };
}

describe('POST /api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with token for valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const request = createLoginRequest({ email: 'admin@test.com', password: 'correct-password' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('admin@test.com');
  });

  it('returns 401 for wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const request = createLoginRequest({ email: 'admin@test.com', password: 'wrong-password' });
    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Невірний email або пароль');
  });

  it('returns 401 for non-existent user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const request = createLoginRequest({ email: 'unknown@test.com', password: 'password123' });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('returns 400 if email is missing', async () => {
    const request = createLoginRequest({ password: 'password123' });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Email');
  });

  it('returns 400 if password is missing', async () => {
    const request = createLoginRequest({ email: 'admin@test.com' });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
