// apps/web/lib/db.ts
import { PrismaClient as PrismaClientType } from '@prisma/client';
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;