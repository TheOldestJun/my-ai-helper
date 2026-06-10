const createMockModel = (methods) => {
  const model = {};
  for (const method of methods) {
    model[method] = jest.fn();
  }
  return model;
};

const prisma = {
  user: createMockModel(['findUnique', 'findMany', 'create', 'update', 'delete', 'count']),
  userRole: createMockModel(['findUnique', 'findMany', 'create', 'deleteMany', 'count']),
  role: createMockModel(['findUnique', 'findMany', 'create', 'count']),
  order: createMockModel(['findUnique', 'findMany', 'create', 'update', 'count', 'delete']),
  orderProduct: createMockModel(['findUnique', 'findMany', 'create', 'update', 'deleteMany']),
  product: createMockModel(['findUnique', 'findMany', 'create', 'update', 'count']),
  unit: createMockModel(['findUnique', 'findMany', 'create', 'count']),
  dish: createMockModel(['findUnique', 'findMany', 'create', 'update', 'delete', 'count']),
  dishProduct: createMockModel(['findUnique', 'findMany', 'create', 'update', 'deleteMany', 'count']),
};

export default prisma;
