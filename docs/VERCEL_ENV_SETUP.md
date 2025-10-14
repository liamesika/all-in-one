# Vercel Environment Variables Setup

## Required Environment Variables for Sprint 2

### 🔴 Critical (Build Fails Without These)

#### Database
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/database?sslmode=require"
```
**Purpose:** Prisma ORM connection
**Where to get:** Neon/Supabase/RDS connection string
**Note:** Use pooled connection for DATABASE_URL, direct for DIRECT_URL

---

#### Firebase Admin (Server-side API authentication)
```bash
FIREBASE_PROJECT_ID="all-in-one-eed0a"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@all-in-one-eed0a.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
**Purpose:** Server-side Firebase Admin SDK for auth verification
**Where to get:** Firebase Console → Project Settings → Service Accounts → Generate Private Key
**⚠️ Important:** Private key must include `\n` for newlines

---

#### Firebase Client (Browser)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDMM6Mvogj49XWb..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="all-in-one-eed0a.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="all-in-one-eed0a"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="all-in-one-eed0a.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:...:web:..."
```
**Purpose:** Client-side Firebase SDK initialization
**Where to get:** Firebase Console → Project Settings → General → Your apps

---

### 🟡 Important (Features Break Without These)

#### Stripe (Billing)
```bash
STRIPE_SECRET_KEY="sk_live_..." # or sk_test_...
STRIPE_PUBLISHABLE_KEY="pk_live_..." # or pk_test_...
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..." # Same as above
```
**Purpose:** Billing and subscription management
**Where to get:** Stripe Dashboard → Developers → API Keys

---

#### AWS S3 (File Storage)
```bash
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```
**Purpose:** Asset uploads for Creative Productions
**Where to get:** AWS IAM Console → Create Access Key
**Note:** User needs s3:PutObject, s3:GetObject permissions

---

### 🟢 Optional (Sprint 2 Features Use Defaults/Mocks)

#### Feature Flags (Defaults to true if not set)
```bash
FEATURE_PRODUCTIONS="true"
FEATURE_AI_ASSISTANTS="true"
FEATURE_EXPORT_PACK="true"
```
**Purpose:** Toggle Sprint 2 features on/off
**Default:** All enabled

---

#### Rate Limiting (In-memory by default)
```bash
RATE_LIMIT_ENABLED="true"
# REDIS_URL="redis://user:password@host:6379" # For production scale
```
**Purpose:** AI endpoint rate limiting
**Default:** In-memory Map (works for single-instance)
**Production:** Set REDIS_URL for multi-instance deployments

---

#### AI Services (Uses mocks by default)
```bash
# OPENAI_API_KEY="sk-..." # Uncomment when ready for live AI
```
**Purpose:** OpenAI API for AI Assistants
**Default:** Mock responses with realistic data
**Production:** Set OPENAI_API_KEY to use live API

---

#### App Config
```bash
NEXT_PUBLIC_APP_URL="https://effinity-platform.vercel.app"
NODE_ENV="production"
SKIP_ENV_VALIDATION="true"
```
**Purpose:** App URL for OAuth redirects, build config
**Default:** Vercel auto-sets NEXT_PUBLIC_APP_URL

---

## Vercel Configuration Steps

### 1. Set Environment Variables in Vercel Dashboard

```bash
# Navigate to:
https://vercel.com/all-inones-projects/effinity-platform/settings/environment-variables

# Add each variable:
1. Variable Name: DATABASE_URL
   Value: postgresql://...
   Environment: Production, Preview, Development ✓

2. Variable Name: FIREBASE_PROJECT_ID
   Value: all-in-one-eed0a
   Environment: Production, Preview, Development ✓

# Repeat for all critical variables above
```

### 2. Verify Build Command in Vercel Settings

```bash
# Project Settings → Build & Development Settings
Build Command: cd apps/web && pnpm build
Install Command: pnpm install
Output Directory: apps/web/.next
Node Version: 20.x
```

### 3. Test Build Locally with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Build locally
cd apps/web
pnpm build

# Run Vercel build simulation
vercel build
```

---

## Common Issues & Solutions

### Issue 1: Prisma Generation Fails
**Error:** `Prisma schema not found`

**Solution:** Ensure build command includes Prisma generation:
```json
// apps/web/package.json
"scripts": {
  "build": "prisma generate --schema ../../packages/server/db/prisma/schema.prisma && next build"
}
```

---

### Issue 2: Firebase Private Key Format
**Error:** `Invalid private key format`

**Solution:** Private key must have literal `\n` characters:
```bash
# Wrong (will fail):
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQ...
-----END PRIVATE KEY-----"

# Correct (single line with \n):
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQ...\n-----END PRIVATE KEY-----\n"
```

---

### Issue 3: Database Connection Timeout
**Error:** `Can't reach database server`

**Solution:** Check DATABASE_URL and DIRECT_URL are correct:
- Use pooled connection (DATABASE_URL) with `-pooler.` subdomain
- Use direct connection (DIRECT_URL) without pooler
- Ensure `sslmode=require` is present
- Verify database allows connections from Vercel IPs

---

### Issue 4: Missing Public Environment Variables
**Error:** `NEXT_PUBLIC_FIREBASE_API_KEY is undefined`

**Solution:** Public env vars must be set in Vercel AND start with `NEXT_PUBLIC_`:
```bash
# These are embedded at build time:
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
```

---

## Environment Variable Checklist

### Before Deployment

- [ ] DATABASE_URL set (with pooler)
- [ ] DIRECT_URL set (without pooler)
- [ ] FIREBASE_PROJECT_ID set
- [ ] FIREBASE_CLIENT_EMAIL set
- [ ] FIREBASE_PRIVATE_KEY set (with `\n`)
- [ ] All NEXT_PUBLIC_FIREBASE_* vars set (6 total)
- [ ] STRIPE_SECRET_KEY set
- [ ] STRIPE_PUBLISHABLE_KEY set
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY set
- [ ] AWS_ACCESS_KEY_ID set
- [ ] AWS_SECRET_ACCESS_KEY set
- [ ] AWS_REGION set
- [ ] AWS_S3_BUCKET set
- [ ] SKIP_ENV_VALIDATION="true" (build env)
- [ ] Node version set to 20.x
- [ ] Build command includes `prisma generate`

### Optional (Can add later)

- [ ] REDIS_URL (for production scale)
- [ ] OPENAI_API_KEY (for live AI)
- [ ] Feature flags (default to true)
- [ ] RATE_LIMIT_ENABLED (defaults to true)

---

## Testing Environment Variables

### Local Test
```bash
# 1. Pull variables from Vercel
vercel env pull .env.local

# 2. Verify all critical vars present
cat .env.local | grep -E "(DATABASE_URL|FIREBASE_|STRIPE_|AWS_)"

# 3. Test build
cd apps/web
pnpm build

# 4. Test dev server
pnpm dev
```

### Staging Test
```bash
# After Vercel deployment succeeds:
curl https://your-staging-url.vercel.app/api/health

# Should return:
{
  "status": "ok",
  "timestamp": "2025-10-14T...",
  "features": {
    "productions": true,
    "ai": true,
    "exports": true
  }
}
```

---

## Quick Fix Commands

### Re-deploy with Environment Variables
```bash
# From project root
vercel --prod --force
```

### Clear Build Cache
```bash
vercel --prod --force --no-cache
```

### Check Deployment Logs
```bash
vercel logs <deployment-url> --follow
```

---

## Support

**Vercel Docs:** https://vercel.com/docs/concepts/projects/environment-variables
**Firebase Setup:** https://firebase.google.com/docs/admin/setup
**Prisma Deployment:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

**Need Help?**
1. Check Vercel deployment logs
2. Verify all env vars in dashboard
3. Test build locally with `vercel build`
4. Contact devops if database/infrastructure issues
