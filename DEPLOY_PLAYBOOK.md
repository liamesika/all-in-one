# DEPLOY PLAYBOOK

**EFFINITY All-in-One Platform**
Production deployment procedures and best practices.

## 🚀 Deployment Overview

### Current Production Setup
- **Domain**: https://effinity.co.il
- **Platform**: Vercel (all-inones-projects team)
- **Runtime**: Node.js 20.x
- **Database**: PostgreSQL (Neon.tech)
- **Authentication**: Firebase Admin SDK

### Repository Structure
```
all-in-one/
├── apps/
│   ├── web/          # Next.js frontend (main deployment)
│   └── api/          # NestJS backend (separate deployment)
├── packages/
│   └── server/       # Shared database schema
└── docs/            # Documentation
```

## 📋 Pre-Deployment Checklist

### 1. Environment Validation
```bash
# Verify all required environment variables
vercel env ls --scope all-inones-projects

# Check database connectivity
DATABASE_URL="..." npx prisma validate --schema packages/server/db/prisma/schema.prisma
```

### 2. Build Validation
```bash
# Clean build test
rm -rf apps/web/.next
cd apps/web
SKIP_ENV_VALIDATION=true pnpm build

# Type checking
pnpm run lint
```

### 3. Database Migration Check
```bash
# Check migration status
DATABASE_URL="..." npx prisma migrate status --schema packages/server/db/prisma/schema.prisma

# Apply pending migrations (if any)
DATABASE_URL="..." npx prisma migrate deploy --schema packages/server/db/prisma/schema.prisma
```

## 🚀 Deployment Procedures

### Standard Deployment
```bash
# 1. Commit and push changes
git add .
git commit -m "feat: description of changes"
git push origin main

# 2. Deploy to Vercel
cd apps/web
vercel --prod --scope all-inones-projects

# 3. Bind to production domain (if needed)
vercel alias <deployment-url> effinity.co.il --scope all-inones-projects
```

### Rollback Procedure
```bash
# 1. List recent deployments
vercel list --scope all-inones-projects

# 2. Promote stable deployment
vercel alias <stable-deployment-url> effinity.co.il --scope all-inones-projects

# 3. Verify rollback
curl -I https://effinity.co.il
```

### Database Migration Deployment
```bash
# 1. Backup production database
pg_dump "postgresql://..." > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on staging
DATABASE_URL="<staging-url>" npx prisma migrate dev --name <migration-name>

# 3. Apply to production
DATABASE_URL="<production-url>" npx prisma migrate deploy

# 4. Generate updated Prisma client
npx prisma generate --schema packages/server/db/prisma/schema.prisma
```

## 🔧 Configuration Management

### Vercel Project Settings
- **Node.js Version**: 20.x
- **Build Command**: `pnpm build`
- **Install Command**: `pnpm install`
- **Root Directory**: `apps/web`

### Required Environment Variables
See `.env.example` for complete list. Critical variables:
- `DATABASE_URL`: PostgreSQL connection string
- `FIREBASE_ADMIN_*`: Firebase service account credentials
- `NEXT_PUBLIC_FIREBASE_*`: Firebase client configuration
- `NEXTAUTH_SECRET`: Session encryption key

### Domain Configuration
```bash
# Verify domain binding
vercel domains ls --scope all-inones-projects

# Add/update domain
vercel domains add effinity.co.il --scope all-inones-projects
```

## 🔍 Deployment Verification

### Post-Deployment Checks
```bash
# 1. Health check
curl https://effinity.co.il/api/healthz

# 2. Authentication test
curl https://effinity.co.il/api/auth/me

# 3. Verify all verticals
curl -I https://effinity.co.il/dashboard/real-estate/dashboard
curl -I https://effinity.co.il/dashboard/e-commerce/dashboard
```

### Performance Monitoring
- Vercel Analytics: Monitor Core Web Vitals
- Vercel Logs: Track 5xx errors and performance issues
- Database: Monitor connection pool and query performance

## ⚠️ Troubleshooting

### Build Failures
```bash
# Common issues:
# 1. TailwindCSS version conflicts - ensure v3.4.13
# 2. TypeScript errors - run type check locally first
# 3. Missing environment variables - verify all required vars set

# Debug locally:
SKIP_ENV_VALIDATION=true pnpm build
```

### Runtime Errors
```bash
# Check Vercel logs
vercel logs --scope all-inones-projects

# Database connectivity
DATABASE_URL="..." npx prisma validate

# Firebase authentication
# Verify service account credentials in Vercel environment
```

### Performance Issues
- Check Vercel function timeout (default: 10s for Hobby, 60s for Pro)
- Monitor database query performance
- Verify image optimization settings
- Check bundle size with `ANALYZE=true pnpm build`

## 🔐 Security Considerations

### Secrets Management
- Never commit secrets to repository
- Use Vercel environment variables for sensitive data
- Rotate Firebase service account keys regularly
- Monitor authentication token usage

### Domain Security
- HTTPS enforced via Vercel
- HSTS headers configured
- CSP headers for XSS protection
- CSRF protection via SameSite cookies

## 📞 Emergency Procedures

### Immediate Rollback
```bash
# Fast rollback to last known good deployment
vercel alias https://effinity-platform-6ztb3oomk-all-inones-projects.vercel.app effinity.co.il
```

### Database Emergency
```bash
# Emergency database rollback (if backup available)
psql "postgresql://..." < backup_YYYYMMDD_HHMMSS.sql
```

### Contact Information
- **Primary**: Repository owner
- **Vercel Support**: Enterprise support ticket
- **Database**: Neon.tech support portal