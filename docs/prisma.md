# Prisma Client Usage Guide

## Overview

This monorepo uses Prisma ORM with a **single source of truth** pattern to prevent build-time errors in Next.js.

## Schema Location

The Prisma schema is located at:
```
packages/server/db/prisma/schema.prisma
```

## Client Generation

### Automatic (Recommended)
Prisma client is automatically generated during:
- `pnpm install` (via postinstall hooks)
- `pnpm run prebuild` (before Next.js build)

### Manual
```bash
# From repo root
pnpm run prisma:generate

# Or directly
prisma generate --schema packages/server/db/prisma/schema.prisma
```

### Verify Generation
```bash
# From web app
pnpm run diagnose:prisma
```

## Using Prisma in Code

### ✅ CORRECT - Use the Singleton

**In all application code:**
```typescript
import { prisma } from '@/lib/prisma.server';

export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json({ users });
}
```

### ❌ WRONG - Direct Import (Will Break Build)

**DO NOT DO THIS:**
```typescript
// ❌ This will cause build-time errors
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**Why this breaks:**
Next.js analyzes all routes during build. Direct imports cause Next.js to try resolving `@prisma/client` before Prisma generates the client, resulting in:
```
Error: @prisma/client did not initialize yet
```

## The Singleton Pattern

Located at `apps/web/lib/prisma.server.ts`:

```typescript
// Lazy initialization prevents build-time resolution
let _prismaInstance: any = null;

function getPrismaClient() {
  if (!_prismaInstance) {
    const { PrismaClient } = require('@prisma/client'); // Only loads at runtime
    _prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return _prismaInstance;
}

// Proxy makes it transparent
export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    return getPrismaClient()[prop];
  },
});
```

**Key benefits:**
- ✅ No build-time module resolution
- ✅ Single connection pool (no connection leaks)
- ✅ Works identically to direct PrismaClient usage
- ✅ Server-only enforcement via 'server-only' package

## Type Imports (Allowed)

You can import **types and enums** directly:

```typescript
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

// This is fine - types don't execute at runtime
```

## ESLint Protection

The web app has an ESLint rule preventing direct `@prisma/client` imports:

```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "@prisma/client",
        "message": "Use singleton from @/lib/prisma.server"
      }]
    }]
  }
}
```

## Health Check

Verify Prisma is working:

```bash
curl http://localhost:3000/api/_health
```

Expected response:
```json
{
  "status": "ok",
  "services": {
    "database": "healthy",
    "prisma": "initialized"
  },
  "responseTime": "45ms"
}
```

## Common Issues

### Build fails with "@prisma/client did not initialize"

**Cause:** Code is importing PrismaClient directly

**Fix:**
1. Search for the import: `git grep "from '@prisma/client'"`
2. Replace with: `import { prisma } from '@/lib/prisma.server'`
3. Remove any `new PrismaClient()` instantiations

### Connection pool exhausted

**Cause:** Creating multiple PrismaClient instances

**Fix:** Always use the singleton from `@/lib/prisma.server`

### Type errors after schema changes

**Cause:** Generated client is stale

**Fix:**
```bash
pnpm run prisma:generate
```

## Migrations

### Development
```bash
# Create and apply migration
npx prisma migrate dev --name my_migration --schema packages/server/db/prisma/schema.prisma
```

### Production (Vercel)
Migrations run automatically via `prisma migrate deploy` in the CI/CD pipeline.

**Never run `prisma migrate dev` in production!**

## Best Practices

1. **Always use the singleton** - Import from `@/lib/prisma.server`
2. **Never instantiate PrismaClient** - Let the singleton handle it
3. **Server-only code** - Prisma imports automatically enforce this
4. **No edge runtime** - Prisma doesn't work in Edge runtime
5. **Health checks** - Use `/api/_health` to verify DB connectivity
6. **Connection limits** - The singleton prevents connection leaks

## Debugging

### Check if client is generated
```bash
ls -la node_modules/.prisma/client
```

### View resolved path
```bash
pnpm run diagnose:prisma
```

### Check schema validity
```bash
npx prisma validate --schema packages/server/db/prisma/schema.prisma
```

## CI/CD Guardrails

### Pre-commit Check
```bash
# Verify no direct imports
git grep -n "from '@prisma/client'" apps/web --and --not -e "prisma.server.ts"
```

### Build Pipeline
1. `pnpm install --frozen-lockfile` → Prisma generates
2. `pnpm run prebuild` → Explicit Prisma generation
3. `pnpm run build` → Next.js build (no Prisma resolution)

## Further Reading

- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Next.js + Prisma Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
