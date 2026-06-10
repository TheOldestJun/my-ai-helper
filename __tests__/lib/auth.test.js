import jwt from 'jsonwebtoken';
import { signToken, verifyToken, getAuthUser, requireAuth, requireRole } from '@/lib/auth';

const mockUser = {
  id: 'user-1',
  email: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'Test',
  roles: [
    { id: 'role-1', name: 'ADMIN', description: 'Admin' },
    { id: 'role-2', name: 'SUPPLY', description: 'Supply' },
  ],
};

function createRequest(authHeader) {
  return {
    headers: new Map(
      authHeader ? [['authorization', authHeader]] : []
    ),
  };
}

describe('signToken / verifyToken', () => {
  it('signs and verifies a valid token', () => {
    const token = signToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe(mockUser.id);
    expect(decoded.email).toBe(mockUser.email);
  });

  it('returns null for invalid token', () => {
    const result = verifyToken('invalid-token');
    expect(result).toBeNull();
  });

  it('returns null for tampered token', () => {
    const token = signToken(mockUser);
    const tampered = token.slice(0, -5) + 'XXXXX';
    const result = verifyToken(tampered);
    expect(result).toBeNull();
  });

  it('returns null for expired token', () => {
    const expiredToken = jwt.sign(
      { id: 'user-1', email: 'test@test.com', roles: [] },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    );
    const result = verifyToken(expiredToken);
    expect(result).toBeNull();
  });
});

describe('getAuthUser', () => {
  it('extracts user from valid Bearer token', () => {
    const token = signToken(mockUser);
    const request = createRequest(`Bearer ${token}`);
    const user = getAuthUser(request);
    expect(user).not.toBeNull();
    expect(user.email).toBe(mockUser.email);
  });

  it('returns null if no auth header', () => {
    const request = createRequest();
    expect(getAuthUser(request)).toBeNull();
  });

  it('returns null if header is not Bearer', () => {
    const request = createRequest('Basic xyz');
    expect(getAuthUser(request)).toBeNull();
  });
});

describe('requireAuth', () => {
  it('calls handler when authenticated', async () => {
    const token = signToken(mockUser);
    const request = createRequest(`Bearer ${token}`);
    const handler = jest.fn().mockResolvedValue('called');

    const wrapped = requireAuth(handler);
    const result = await wrapped(request);

    expect(result).toBe('called');
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ id: mockUser.id }) })
    );
  });

  it('returns 401 when not authenticated', async () => {
    const request = createRequest();
    const handler = jest.fn();

    const wrapped = requireAuth(handler);
    const response = await wrapped(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Необхідна аутентифікація');
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  it('calls handler when user has required role', async () => {
    const token = signToken(mockUser);
    const request = createRequest(`Bearer ${token}`);
    const handler = jest.fn().mockResolvedValue('called');

    const wrapped = requireRole('ADMIN')(handler);
    const result = await wrapped(request);

    expect(result).toBe('called');
    expect(handler).toHaveBeenCalled();
  });

  it('allows access with any of the required roles', async () => {
    const token = signToken(mockUser);
    const request = createRequest(`Bearer ${token}`);
    const handler = jest.fn().mockResolvedValue('called');

    const wrapped = requireRole('KITCHEN', 'SUPPLY')(handler);
    const result = await wrapped(request);

    expect(result).toBe('called');
  });

  it('returns 403 when user lacks required role', async () => {
    const token = signToken(mockUser);
    const request = createRequest(`Bearer ${token}`);
    const handler = jest.fn();

    const wrapped = requireRole('KITCHEN')(handler);
    const response = await wrapped(request);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('Недостатньо прав для виконання дії');
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 401 when not authenticated', async () => {
    const request = createRequest();
    const handler = jest.fn();

    const wrapped = requireRole('ADMIN')(handler);
    const response = await wrapped(request);

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });
});
