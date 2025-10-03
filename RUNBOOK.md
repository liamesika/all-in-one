# OPERATIONS RUNBOOK

**EFFINITY All-in-One Platform**
Day-to-day operations, maintenance, and troubleshooting procedures.

## 🔧 Routine Maintenance

### Daily Operations
```bash
# Check application health
curl https://effinity.co.il/api/healthz

# Monitor Vercel function performance
vercel logs --since=24h --scope all-inones-projects

# Database connection health
DATABASE_URL="..." npx prisma migrate status
```

### Weekly Maintenance
```bash
# Database maintenance
# 1. Review slow query logs
# 2. Check connection pool utilization
# 3. Verify backup completion

# Security updates
# 1. Review dependency updates: pnpm outdated
# 2. Check Vercel security advisories
# 3. Rotate secrets if needed (monthly)
```

## 🔑 Key Rotation Procedures

### Firebase Service Account Keys
```bash
# 1. Generate new service account key in Firebase Console
# 2. Update Vercel environment variables:
vercel env add FIREBASE_ADMIN_PRIVATE_KEY --scope all-inones-projects
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL --scope all-inones-projects
vercel env add FIREBASE_ADMIN_PROJECT_ID --scope all-inones-projects

# 3. Redeploy application
vercel --prod --scope all-inones-projects

# 4. Verify authentication still works
curl https://effinity.co.il/api/auth/me

# 5. Delete old service account key from Firebase
```

### Database Credentials
```bash
# 1. Create new database user (if using managed service)
# 2. Update DATABASE_URL in Vercel
vercel env add DATABASE_URL --scope all-inones-projects

# 3. Test connection
DATABASE_URL="new-url" npx prisma validate

# 4. Redeploy application
# 5. Remove old database user
```

### Session Encryption Keys
```bash
# 1. Generate new random key
openssl rand -base64 32

# 2. Update NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET --scope all-inones-projects

# 3. Redeploy (existing sessions will be invalidated)
```

## ⚠️ Rollback Procedures

### Application Rollback
```bash
# 1. Identify last stable deployment
vercel list --scope all-inones-projects | grep "Ready"

# 2. Promote stable deployment
vercel alias https://effinity-platform-STABLE-ID.vercel.app effinity.co.il

# 3. Verify rollback
curl -I https://effinity.co.il
```

### Database Rollback
```bash
# Emergency database restore (requires recent backup)
# 1. Stop application traffic (set maintenance mode if available)
# 2. Restore from backup
pg_restore -d "postgresql://..." backup_file.sql

# 3. Verify data integrity
DATABASE_URL="..." npx prisma validate

# 4. Restart application
```

### Configuration Rollback
```bash
# Revert environment variable changes
vercel env ls --scope all-inones-projects
vercel env rm VARIABLE_NAME --scope all-inones-projects
vercel env add VARIABLE_NAME old_value --scope all-inones-projects
```

## 🧹 Cache Management

### Vercel Edge Cache
```bash
# Purge all cache
vercel --clear-cache --scope all-inones-projects

# Purge specific paths (if Vercel Pro/Enterprise)
# Use Vercel dashboard or API for selective purging
```

### Browser Cache
```bash
# Force cache invalidation via deployment
# New deployment automatically invalidates browser caches for static assets
vercel --prod --scope all-inones-projects
```

### Database Query Cache
```bash
# Clear Prisma query engine cache (restart required)
# Cache is automatically cleared on new deployments
```

## 🗄️ Database Migration Operations

### Re-run Migrations
```bash
# Check current migration status
DATABASE_URL="..." npx prisma migrate status

# Reset database (DANGER: destroys all data)
DATABASE_URL="..." npx prisma migrate reset --force

# Deploy pending migrations
DATABASE_URL="..." npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate
```

### Schema Introspection
```bash
# Pull current database schema
DATABASE_URL="..." npx prisma db pull

# Compare with current schema file
git diff packages/server/db/prisma/schema.prisma
```

### Manual Database Operations
```bash
# Connect to production database (READ-ONLY recommended)
psql "postgresql://readonly-user@..."

# Common queries:
SELECT COUNT(*) FROM "User";
SELECT "defaultVertical", COUNT(*) FROM "User" GROUP BY "defaultVertical";
SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 5;
```

## 📊 Monitoring & Alerting

### Application Metrics
- **Vercel Analytics**: Core Web Vitals, page views
- **Vercel Logs**: Error rates, function duration
- **Custom Metrics**: Authentication success rate, API response times

### Database Monitoring
```bash
# Connection pool status
# Query execution time
# Database size and growth
# Index usage statistics
```

### Performance Thresholds
- **Page Load Time**: <3 seconds (95th percentile)
- **API Response Time**: <500ms (95th percentile)
- **Database Query Time**: <100ms (average)
- **Error Rate**: <1% (5-minute window)

## 🚨 Incident Response

### Application Down
```bash
# 1. Check Vercel status
curl -I https://effinity.co.il

# 2. Check Vercel function logs
vercel logs --scope all-inones-projects

# 3. Verify database connectivity
DATABASE_URL="..." npx prisma migrate status

# 4. Emergency rollback if needed
vercel alias <last-known-good-deployment> effinity.co.il
```

### Authentication Issues
```bash
# 1. Verify Firebase service
curl https://identitytoolkit.googleapis.com/v1/projects/PROJECT_ID

# 2. Test local authentication
# 3. Check Firebase console for service disruptions
# 4. Verify environment variables
vercel env ls --scope all-inones-projects | grep FIREBASE
```

### Database Connectivity Issues
```bash
# 1. Test direct connection
DATABASE_URL="..." npx prisma migrate status

# 2. Check connection pool limits
# 3. Verify network connectivity
# 4. Check database service status (Neon.tech dashboard)
```

## 🔍 Debugging Procedures

### Application Logs
```bash
# Real-time logs
vercel logs --follow --scope all-inones-projects

# Filter by error level
vercel logs --level error --scope all-inones-projects

# Search specific timeframe
vercel logs --since=1h --until=30m --scope all-inones-projects
```

### Database Debugging
```bash
# Enable Prisma debug logging (development only)
DEBUG="prisma:*" npx prisma migrate status

# Query performance analysis
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
```

### Frontend Debugging
- Browser DevTools Network tab
- Vercel Analytics Real User Monitoring
- Sentry error tracking (if configured)

## 📋 Maintenance Schedules

### Daily (Automated)
- Health checks
- Log rotation
- Backup verification

### Weekly (Manual)
- Security update review
- Performance metrics review
- Capacity planning review

### Monthly (Scheduled)
- Security key rotation
- Database optimization
- Dependency updates
- Disaster recovery testing

### Quarterly (Strategic)
- Architecture review
- Security audit
- Cost optimization
- Performance benchmarking

## 📞 Escalation Procedures

### Level 1: Application Issues
- Check logs and metrics
- Attempt standard troubleshooting
- Consider rollback if needed

### Level 2: Infrastructure Issues
- Contact Vercel support
- Check third-party service status
- Coordinate with database provider

### Level 3: Security Incidents
- Immediate containment
- Security team notification
- Incident documentation
- Post-incident review

### Emergency Contacts
- **Development Team**: Repository maintainers
- **Infrastructure**: Vercel Enterprise Support
- **Database**: Neon.tech Support Portal
- **Security**: Internal security team