# Effinity Platform - Deployment Guide

## Overview

Effinity is a multi-vertical SaaS platform supporting Real Estate, E-commerce, Law, and Production management. This guide covers the Vercel deployment process and troubleshooting.

---

## Architecture

### Monorepo Structure
```
all-in-one/
├── apps/
│   ├── web/           # Next.js 15.5.4 (App Router) - main frontend
│   ├── api/           # NestJS API (future vertical endpoints)
│   └── worker/        # Background jobs (planned)
├── packages/
│   ├── server/        # Prisma schema + shared DB logic
│   ├── ui/            # shadcn/ui components
│   └── utils/         # Shared utilities, i18n
└── docs/              # Documentation
```

### Tech Stack
- **Frontend:** Next.js 15.5.4, TypeScript, Tailwind v4, shadcn/ui
- **Backend:** Node 22.x, Prisma ORM, PostgreSQL (Neon.tech)
- **Auth:** Firebase Authentication
- **Storage:** AWS S3, Firebase Storage
- **Hosting:** Vercel (web), Firebase Functions (API)
- **CI/CD:** GitHub → Vercel auto-deploy on main

---

## Vercel Configuration

### Project Settings

**Framework:** Next.js
**Root Directory:** `apps/web`
**Node Version:** 22.x (pinned)

### Build Settings

**Install Command:**
```bash
cd ../.. && pnpm install --frozen-lockfile
```

**Build Command:**
```bash
pnpm run prebuild && pnpm run build
```

**Output Directory:** `.next`

### Environment Variables

Required in Vercel dashboard:

```bash
# Database
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://...neon.tech/neondb?sslmode=require

# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# OpenAI
OPENAI_API_KEY=

# Application
NEXT_PUBLIC_APP_URL=https://effinity.co.il
SKIP_ENV_VALIDATION=true
```

---

## Deployment Process

### Automatic Deployment

1. Push to `main` branch → Vercel auto-deploys
2. Build process:
   ```
   → Installing dependencies (pnpm install --frozen-lockfile)
   → Running postinstall hooks (Prisma generate)
   → Building (pnpm run prebuild && pnpm run build)
   → Deploying
   ```

### Manual Deployment

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Click **Deployments**
4. Click **Redeploy** on latest deployment
5. **IMPORTANT:** Uncheck "Use existing Build Cache"
6. Click **Redeploy**

---

## Prisma & Database

### Critical: Singleton Pattern

**✅ ALWAYS use the singleton:**
```typescript
import { prisma } from '@/lib/prisma.server';
```

**❌ NEVER import directly:**
```typescript
// THIS WILL BREAK THE BUILD
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**Why:** Next.js analyzes routes during build. Direct imports cause module resolution before Prisma client generation, resulting in:
```
Error: @prisma/client did not initialize yet
Failed to collect page data for /api/...
```

See [docs/prisma.md](./prisma.md) for complete usage guide.

### Schema Location
```
packages/server/db/prisma/schema.prisma
```

### Migrations

**Development:**
```bash
npx prisma migrate dev --name migration_name --schema packages/server/db/prisma/schema.prisma
```

**Production (Vercel):**
Migrations run automatically via `prisma migrate deploy` in postinstall hooks.

**⚠️ NEVER run `prisma migrate dev` in production!**

---

## Build Verification

### Local (Mimic Vercel)

```bash
# 1. Clean environment
rm -rf node_modules apps/*/node_modules packages/*/node_modules apps/web/.next .turbo

# 2. Install with frozen lockfile
pnpm install --frozen-lockfile

# 3. Verify Prisma generated
ls -la node_modules/.prisma/client

# 4. Build
SKIP_ENV_VALIDATION=true pnpm --filter web run build
```

### Health Check

After deployment, verify:
```bash
curl https://effinity.co.il/api/_health
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

---

## Common Issues & Fixes

### Issue: `@prisma/client did not initialize yet`

**Cause:** Direct PrismaClient import somewhere in the codebase

**Fix:**
```bash
# 1. Find the culprit
git grep "from '@prisma/client'" apps/web

# 2. Replace with singleton
# Change: import { PrismaClient } from '@prisma/client'
# To:     import { prisma } from '@/lib/prisma.server'

# 3. Remove instantiation
# Delete: const prisma = new PrismaClient();

# 4. Redeploy without cache
```

**Prevention:** ESLint rule in `apps/web/.eslintrc.json` blocks this

---

### Issue: Build fails with "Lockfile mismatch"

**Cause:** `pnpm-lock.yaml` out of sync with `package.json`

**Fix:**
```bash
# 1. Regenerate lockfile
pnpm install --no-frozen-lockfile

# 2. Commit and push
git add pnpm-lock.yaml
git commit -m "fix: Sync lockfile"
git push

# 3. Redeploy without cache
```

---

### Issue: Environment variables not found

**Cause:** Missing or incorrectly named env vars in Vercel

**Fix:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Verify ALL required variables are set (see list above)
3. Ensure `DATABASE_URL` and `DIRECT_URL` both exist
4. Click **Redeploy** (without cache)

---

### Issue: Database connection errors

**Cause:** Neon database connection pool exhausted or inactive

**Fix:**
1. Check Neon.tech console for database status
2. Verify connection string includes `?sslmode=require`
3. Verify `DIRECT_URL` is set (for migrations)
4. Check `/api/_health` endpoint for diagnostic info

---

### Issue: Firebase auth not working

**Cause:** Missing Firebase environment variables or incorrect config

**Fix:**
1. Verify all `FIREBASE_*` vars in Vercel dashboard
2. Ensure `FIREBASE_ADMIN_PRIVATE_KEY` is properly formatted (with `\n` for newlines)
3. Check Firebase Console → Project Settings → Service Accounts
4. Regenerate service account key if needed

---

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel
- [ ] `pnpm-lock.yaml` committed and up-to-date
- [ ] No direct `@prisma/client` imports (run ESLint)
- [ ] Local build passes: `pnpm --filter web run build`
- [ ] Database migrations tested in staging
- [ ] Health check endpoint returns 200
- [ ] Firebase auth working in staging
- [ ] S3 bucket accessible (if using file uploads)

---

## Monitoring & Debugging

### Vercel Deployment Logs

1. Go to Vercel Dashboard → Deployments
2. Click on deployment
3. View **Building** tab for build logs
4. Check for:
   - ✅ "Generated Prisma Client"
   - ✅ "Generating static pages (101/101)"
   - ✅ "Build completed successfully"
   - ❌ Any errors or warnings

### Runtime Logs

```bash
# View real-time logs
vercel logs <deployment-url> --follow

# Filter for errors
vercel logs <deployment-url> | grep -i error
```

### Health Monitoring

Set up monitoring for:
- `/api/_health` - Should return 200
- `/` - Should load homepage
- `/dashboard/real-estate` - Should load for authenticated users

---

## Rollback Procedure

If deployment fails:

1. Go to Vercel Dashboard → Deployments
2. Find last known good deployment
3. Click **⋯** (three dots)
4. Click **Promote to Production**
5. Investigate failure in safe environment
6. Fix and redeploy

---

## Performance Optimization

### Current Bundle Size
- First Load JS: ~102 kB
- Middleware: 33.3 kB
- Total Routes: 101

### Optimization Checklist
- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Optimize images (use next/image)
- [ ] Enable ISR for static content
- [ ] Monitor Prisma connection pool usage
- [ ] Set up error tracking (Sentry)

---

## CI/CD Pipeline

### Current Flow
```
GitHub (main) → Vercel Auto-Deploy → Production
```

### Planned Improvements
- [ ] GitHub Actions for tests
- [ ] Staging environment
- [ ] Preview deployments for PRs
- [ ] Automated Prisma migration checks
- [ ] Bundle size monitoring
- [ ] Lighthouse CI integration

---

## Support & Resources

### Documentation
- [Prisma Usage Guide](./prisma.md)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

### Diagnostic Commands
```bash
# Check Prisma client
pnpm run diagnose:prisma

# Validate schema
npx prisma validate --schema packages/server/db/prisma/schema.prisma

# Test database connection
npx prisma db pull --schema packages/server/db/prisma/schema.prisma

# View deployment logs
vercel logs --follow
```

### Emergency Contacts
- **Vercel Status:** https://www.vercel-status.com
- **Neon Status:** https://neon.tech/status
- **Firebase Status:** https://status.firebase.google.com

---

## Recent Fixes (January 2025)

### Prisma Build-Time Resolution Fix
**Issue:** `@prisma/client did not initialize yet` errors during Vercel builds

**Root Cause:** 8 files directly importing `PrismaClient`, causing Next.js to attempt module resolution during build-time static analysis

**Solution:**
1. Replaced all direct imports with lazy-loaded singleton
2. Added ESLint rule to prevent future occurrences
3. Created health check endpoint for monitoring
4. Documented singleton pattern

**Commits:**
- `9d4657d` - Eliminated all build-time PrismaClient imports
- `db725d6` - Hardened Prisma client with lazy loading
- `e2d47aa` - Added production guardrails

**Status:** ✅ Resolved - builds deploying successfully

---

**Last Updated:** January 15, 2025
**Platform Version:** v1.0 (Production Stable)
**Node Version:** 22.x
**Next.js Version:** 15.5.4
