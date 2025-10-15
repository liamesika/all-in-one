# Real Estate Vertical - Enterprise Deployment Guide

## Version: v2.0.0-real-estate-enterprise

### Prerequisites
- Node.js 20.x
- pnpm 8.15+
- PostgreSQL 14+ (Neon recommended)
- Firebase project (Auth + Storage)
- Vercel account (deployment)

### Environment Variables

**Required (.env.local):**
```bash
# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@direct-host/db?sslmode=require"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
FIREBASE_ADMIN_PRIVATE_KEY="..."
FIREBASE_ADMIN_CLIENT_EMAIL="..."

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN="..."
NEXT_PUBLIC_GA_MEASUREMENT_ID="..."
```

### Deployment Steps

#### 1. Install Dependencies
```bash
pnpm install
```

#### 2. Database Migration
```bash
DATABASE_URL="..." pnpm prisma migrate deploy --schema packages/server/db/prisma/schema.prisma
DATABASE_URL="..." pnpm prisma generate --schema packages/server/db/prisma/schema.prisma
```

#### 3. Build Production
```bash
SKIP_ENV_VALIDATION=true pnpm build
```

#### 4. Deploy to Vercel
```bash
vercel deploy --prod
```

### Post-Deployment Verification

1. **Health Check**: `https://your-domain.com/api/health`
2. **Auth Flow**: Login → Dashboard access
3. **Real Estate Features**:
   - Property creation with AI assist
   - Lead scoring calculation
   - Map rendering
   - Email automation templates
   - Theme switcher (light/dark/system)
4. **Performance**: Lighthouse Mobile ≥90, Desktop ≥95
5. **Monitoring**: Sentry events, GA4 tracking

### Rollback Procedure

```bash
# Revert to previous deployment
vercel rollback

# Or redeploy specific commit
git checkout <previous-commit>
vercel deploy --prod
```

### Key Features (v2.0.0)

✅ **UX Enhancements**
- Framer Motion animations (cards, modals, stagger)
- Theme system (Light/Dark/Auto)
- Activity timeline
- Performance insights dashboard

✅ **AI Features**
- Property description enhancement
- Multi-factor lead scoring (hot/warm/cold)

✅ **Advanced Features**
- OpenStreetMap integration
- Email automation templates
- React Query caching (24h persistence)

✅ **Production-Grade**
- Rate limiting (100 req/min)
- Multi-tenant scope validation
- Sentry error tracking
- Input sanitization
- Jest test coverage
- Mobile-optimized (90vh modals, safe area)

### Support & Monitoring

- **Sentry**: Error tracking + performance monitoring
- **GA4**: User behavior analytics
- **Uptime**: Monitor `/api/health` endpoint
- **Logs**: Vercel dashboard

### Performance Targets

- Lighthouse Mobile: ≥90
- Lighthouse Desktop: ≥95
- Error Rate: <0.1%
- API Response: <500ms p95
- Bundle Size: <800KB largest route

### Architecture

- **Frontend**: Next.js 15, React 19, Tailwind v4
- **Backend**: NestJS API
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage / AWS S3
- **Deployment**: Vercel Edge Network

---

**Last Updated**: 2025-10-15
**Version**: v2.0.0-real-estate-enterprise
