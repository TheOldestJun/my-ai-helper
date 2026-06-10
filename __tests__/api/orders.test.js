import { GET, POST } from '@/app/api/orders/route';
import jwt from 'jsonwebtoken';

jest.mock('@/prisma');

const prisma = require('@/prisma').default;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function createAuthedRequest(body, userOverrides = {}) {
  const user = {
    id: 'user-1',
    email: 'user@test.com',
    firstName: 'Test',
    lastName: 'User',
    roles: [{ id: 'r1', name: 'APPLICANT', description: 'Applicant' }],
    ...userOverrides,
  };
  const token = signToken(user);

  const headers = new Map([['authorization', `Bearer ${token}`]]);
  const request = {
    headers,
    user,
    json: () => Promise.resolve(body || {}),
  };
  return request;
}

describe('GET /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns orders for authenticated user', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        number: 'ЗАМ-20260610-001',
        priority: 'NORMAL',
        notes: null,
        createdAt: new Date(),
        createdBy: { id: 'user-1', firstName: 'User', lastName: 'Test' },
        products: [
          {
            id: 'op-1',
            quantity: 5,
            status: 'PENDING',
            notes: null,
            statusChangedBy: null,
            statusChangedAt: null,
            product: { id: 'prod-1', name: 'Товар 1' },
            unit: { id: 'unit-1', name: 'шт', symbol: 'шт' },
          },
        ],
      },
    ];
    prisma.order.findMany.mockResolvedValue(mockOrders);

    const request = createAuthedRequest();
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.orders).toHaveLength(1);
    expect(data.orders[0].number).toBe('ЗАМ-20260610-001');
  });

  it('filters orders by user for applicant role', async () => {
    prisma.order.findMany.mockResolvedValue([]);

    const request = createAuthedRequest();
    await GET(request);

    const whereClause = prisma.order.findMany.mock.calls[0][0].where;
    expect(whereClause.createdById).toBe('user-1');
    expect(whereClause.archivedAt).toBeNull();
  });

  it('does not filter archived for supply role', async () => {
    prisma.order.findMany.mockResolvedValue([]);

    const request = createAuthedRequest(null, {
      roles: [{ id: 'r2', name: 'SUPPLY', description: 'Supply' }],
    });
    await GET(request);

    const whereClause = prisma.order.findMany.mock.calls[0][0].where;
    expect(whereClause.createdById).toBeUndefined();
    expect(whereClause.archivedAt).toBeUndefined();
  });
});

describe('POST /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates order with valid data', async () => {
    const mockOrder = {
      id: 'order-new',
      number: 'ЗАМ-20260610-001',
      priority: 'HIGH',
      notes: 'Терміново',
      createdAt: new Date(),
      products: [
        {
          id: 'op-1',
          quantity: 10,
          status: 'PENDING',
          notes: null,
          product: { id: 'p1', name: 'Тест товар' },
          unit: { id: 'u1', name: 'кг', symbol: 'кг' },
        },
      ],
    };
    prisma.order.count.mockResolvedValue(0);
    prisma.order.create.mockResolvedValue(mockOrder);

    const request = createAuthedRequest({
      priority: 'HIGH',
      notes: 'Терміново',
      products: [{ productId: 'p1', unitId: 'u1', quantity: 10 }],
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.order.number).toBe('ЗАМ-20260610-001');
    expect(data.order.products).toHaveLength(1);
  });

  it('returns 400 when products are empty', async () => {
    const request = createAuthedRequest({
      priority: 'NORMAL',
      products: [],
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('товар');
  });

  it('returns 400 when products array is missing', async () => {
    const request = createAuthedRequest({ priority: 'NORMAL' });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('returns 400 when product fields are invalid', async () => {
    const request = createAuthedRequest({
      products: [{ productId: 'p1', unitId: null, quantity: 0 }],
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
