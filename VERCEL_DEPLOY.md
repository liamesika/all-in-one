# Vercel Deployment Configuration

## Critical: Monorepo Setup Required

This project is a **Turborepo monorepo** with the Next.js app located at `apps/web`.
Vercel must be configured to build from the correct subdirectory.

## Required Vercel Project Settings

Go to: **Vercel Dashboard → Project Settings → General**

### 1. Root Directory
```
apps/web
```
**Critical:** This tells Vercel where the Next.js app is located in the monorepo.

### 2. Build Command (Optional Override)
```
pnpm run prebuild && pnpm run build
```

### 3. Install Command
```
cd ../.. && pnpm install --frozen-lockfile
```
**Note:** Must install from repo root to get all workspace dependencies.

### 4. Output Directory
```
.next
```
(Relative to Root Directory, so `apps/web/.next`)

### 5. Environment Variables
```
SKIP_ENV_VALIDATION=true
```

## Deployment Checklist

Before deploying:

1. ✅ Ensure `apps/web/app/page.tsx` is a **client component** (`'use client'` on line 1)
2. ✅ No `apps/web/app/(marketing)/page.tsx` file exists (causes conflicts)
3. ✅ Middleware is minimal and Edge-safe (no Node.js APIs)
4. ✅ Build passes locally: `pnpm --filter web build`
5. ✅ Runtime passes locally: `pnpm --filter web start` → http://localhost:3000/ returns 200
6. ✅ Route group check passes: `node apps/web/scripts/check-route-groups.cjs`

## Troubleshooting

### Issue: 404 NOT_FOUND on Vercel
**Cause:** Root Directory not set to `apps/web`
**Fix:** Set "Root Directory" in Vercel project settings

### Issue: MIDDLEWARE_INVOCATION_FAILED
**Cause:** Middleware using Node.js APIs or route group page conflicts
**Fix:**
- Ensure middleware only uses Edge-safe APIs
- Verify no server component imports from route group pages
- Check `apps/web/app/page.tsx` doesn't import from `(marketing)/page.tsx`

### Issue: clientReferenceManifest errors
**Cause:** Server component importing client components through route group pages
**Fix:** Make root `app/page.tsx` a client component OR import components directly (not via route group pages)

## Verification After Deploy

```bash
# 1. Check homepage
curl -I https://www.effinity.co.il/
# Expected: HTTP 200 OK

# 2. Check favicon
curl -I https://www.effinity.co.il/favicon.ico
# Expected: HTTP 200 OK

# 3. Check health endpoint
curl https://www.effinity.co.il/api/_health
# Expected: {"status":"ok","services":{"database":"healthy","prisma":"initialized"}}

# 4. Check deployment
vercel ls
# Latest deployment should show "● Ready"
```

## Cache Clearing

To deploy without cache:
```bash
# Via Vercel Dashboard
Project Settings → Deployments → [Latest] → Redeploy → ☑️ Use existing Build Cache: OFF

# Via CLI (if authenticated)
vercel --prod --force
```

## Current Status

- **Local:** ✅ Working (200 OK)
- **Vercel:** ⚠️ Needs Root Directory configuration in dashboard
- **Commit:** `d41e571` (latest with root vercel.json)
- **Homepage Fix:** `0489d2b` (client component + direct imports)
