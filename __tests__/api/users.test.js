import { GET } from '@/app/api/users/route';
import { PUT, DELETE } from '@/app/api/users/[id]/route';
import { POST as Register } from '@/app/api/register/route';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

jest.mock('@/prisma');

const prisma = require('@/prisma').default;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function adminRequest() {
  const user = { id: 'admin-1', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', roles: [{ id: 'r1', name: 'ADMIN' }] };
  const token = signToken(user);
  return { headers: new Map([['authorization', `Bearer ${token}`]]), user, json: () => Promise.resolve({}) };
}

function plainRequest(body = {}) {
  return { headers: new Map([['content-type', 'application/json']]), json: () => Promise.resolve(body) };
}

function paramsRequest(id) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/users', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns user list with formatted roles', async () => {
    const mockUsers = [
      { id: 'u1', email: 'a@t.com', firstName: 'A', lastName: 'B', createdAt: new Date(), roles: [{ role: { id: 'r1', name: 'ADMIN', description: 'Admin' } }] },
      { id: 'u2', email: 'b@t.com', firstName: 'C', lastName: 'D', createdAt: new Date(), roles: [{ role: { id: 'r2', name: 'KITCHEN', description: 'Kitchen' } }] },
    ];
    prisma.user.findMany.mockResolvedValue(mockUsers);

    const response = await GET(adminRequest());
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.users).toHaveLength(2);
    expect(data.users[0].roles[0].name).toBe('ADMIN');
  });

  it('returns 500 on prisma error', async () => {
    prisma.user.findMany.mockRejectedValue(new Error('DB down'));
    const response = await GET(adminRequest());
    expect(response.status).toBe(500);
  });
});

describe('POST /api/register', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('creates user with valid data', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.role.findMany.mockResolvedValue([{ id: 'r1', name: 'APPLICANT' }]);
    prisma.user.create.mockResolvedValue({
      id: 'new-user',
      email: 'new@test.com',
      firstName: 'New',
      lastName: 'User',
      roles: [{ role: { id: 'r1', name: 'APPLICANT', description: 'Applicant' } }],
    });

    const response = await Register(plainRequest({
      email: 'new@test.com', password: 'password123',
      firstName: 'New', lastName: 'User', roleNames: ['APPLICANT'],
    }));

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.message).toContain('створено');
  });

  it('returns 400 when email missing', async () => {
    const response = await Register(plainRequest({ password: 'password123' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when password too short', async () => {
    const response = await Register(plainRequest({ email: 'a@b.com', password: '123' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 on invalid email format', async () => {
    const response = await Register(plainRequest({ email: 'invalid', password: 'password123' }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('email');
  });

  it('returns 409 when email already exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'dup@test.com' });
    const response = await Register(plainRequest({ email: 'dup@test.com', password: 'password123' }));
    expect(response.status).toBe(409);
  });

  it('returns 400 when role not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.role.findMany.mockResolvedValue([]);
    const response = await Register(plainRequest({
      email: 'x@y.z', password: 'password123', roleNames: ['NONEXISTENT'],
    }));
    expect(response.status).toBe(400);
  });
});

describe('PUT /api/users/[id]', () => {
  const existingUser = { id: 'u1', email: 'old@test.com', firstName: 'Old', lastName: 'Name', password: 'hashed-old' };

  beforeEach(() => { jest.clearAllMocks(); });

  it('updates user fields', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(existingUser);
    prisma.user.update.mockResolvedValue({
      ...existingUser, email: 'new@test.com', firstName: 'New', roles: [],
    });

    const req = { ...plainRequest({ email: 'new@test.com', firstName: 'New' }), params: Promise.resolve({ id: 'u1' }) };
    const response = await PUT(req, { params: Promise.resolve({ id: 'u1' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toContain('оновлено');
  });

  it('returns 404 for non-existent user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const req = { ...plainRequest({ email: 'x@y.z' }), params: Promise.resolve({ id: 'missing' }) };
    const response = await PUT(req, { params: Promise.resolve({ id: 'missing' }) });
    expect(response.status).toBe(404);
  });

  it('returns 409 for duplicate email', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(existingUser)    // existing user check
      .mockResolvedValueOnce({ id: 'other' }); // duplicate email check
    const req = { ...plainRequest({ email: 'taken@test.com' }), params: Promise.resolve({ id: 'u1' }) };
    const response = await PUT(req, { params: Promise.resolve({ id: 'u1' }) });
    expect(response.status).toBe(409);
  });

  it('updates roles when roleNames provided', async () => {
    prisma.user.findUnique.mockResolvedValue(existingUser);
    prisma.role.findMany.mockResolvedValue([{ id: 'r2', name: 'SUPPLY' }]);
    prisma.userRole.deleteMany.mockResolvedValue({ count: 1 });
    prisma.user.update.mockResolvedValue({ ...existingUser, roles: [{ role: { id: 'r2', name: 'SUPPLY', description: 'Supply' } }] });

    const req = { ...plainRequest({ roleNames: ['SUPPLY'] }), params: Promise.resolve({ id: 'u1' }) };
    const response = await PUT(req, { params: Promise.resolve({ id: 'u1' }) });
    expect(response.status).toBe(200);
  });

  it('hashes password when provided', async () => {
    prisma.user.findUnique.mockResolvedValue(existingUser);
    prisma.user.update.mockResolvedValue({ ...existingUser, roles: [] });
    const bcryptSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-new');

    const req = { ...plainRequest({ password: 'newpassword123' }), params: Promise.resolve({ id: 'u1' }) };
    await PUT(req, { params: Promise.resolve({ id: 'u1' }) });

    expect(bcryptSpy).toHaveBeenCalledWith('newpassword123', 10);
    bcryptSpy.mockRestore();
  });

  it('returns 500 on error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('crash'));
    const req = { ...plainRequest({}), params: Promise.resolve({ id: 'u1' }) };
    const response = await PUT(req, { params: Promise.resolve({ id: 'u1' }) });
    expect(response.status).toBe(500);
  });
});

describe('DELETE /api/users/[id]', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('deletes user and their roles', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'del@test.com' });
    prisma.userRole.deleteMany.mockResolvedValue({ count: 2 });
    prisma.user.delete.mockResolvedValue({ id: 'u1' });

    const req = { ...plainRequest(), params: Promise.resolve({ id: 'u1' }) };
    const response = await DELETE(req, { params: Promise.resolve({ id: 'u1' }) });
    expect(response.status).toBe(200);
  });

  it('returns 404 for non-existent user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const req = { ...plainRequest(), params: Promise.resolve({ id: 'missing' }) };
    const response = await DELETE(req, { params: Promise.resolve({ id: 'missing' }) });
    expect(response.status).toBe(404);
  });
});
