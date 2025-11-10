// apps/web/lib/prisma.server.ts
// Server-only Prisma client - DO NOT IMPORT IN CLIENT COMPONENTS
import 'server-only';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: any | undefined;
}

function getPrismaClient() {
  if (globalThis.__prisma) {
    return globalThis.__prisma;
  }

  const { PrismaClient } = require('@prisma/client');
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = client;
  }

  return client;
}

export const prisma = new Proxy({} as any, {
  get(target, prop) {
    const client = getPrismaClient();
    return client[prop];
  },
});
