// apps/web/lib/prisma.server.ts
// Server-only Prisma client - DO NOT IMPORT IN CLIENT COMPONENTS
import 'server-only';

// Lazy initialization to avoid build-time module resolution
let _prismaInstance: any = null;

function getPrismaClient() {
  if (!_prismaInstance) {
    // Use require() for lazy loading - avoids build-time errors
    const { PrismaClient } = require('@prisma/client');
    _prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return _prismaInstance;
}

// Export a Proxy to make it work like a direct instance
export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    return getPrismaClient()[prop];
  },
});
