import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const basePrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = basePrisma;
}

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, args, query }) {
        try {
          return await query(args);
        } catch (error) {
          error.__entity = model?.toLowerCase();
          throw error;
        }
      },
    },
  },
});

export default prisma;