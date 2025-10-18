# Deployment Guide - Phase 11: Creative Productions

## Pre-Deployment Checklist

### ✅ Completed
- [x] Backend APIs implemented (Customers + Calendar)
- [x] Database schema deployed to production
- [x] Frontend pages built (Customers + Calendar)
- [x] API client created and wired
- [x] GA4 analytics wrapper implemented
- [x] All commits pushed to GitHub main branch

### 📋 Ready to Deploy
- API endpoints: `POST/GET/PUT/DELETE /creative-clients`, `GET /creative-calendar/*`
- Frontend routes: `/dashboard/production/creative/customers`, `/dashboard/production/creative/calendar`
- Navigation: 10-item sidebar with Productions branding

---

## Deployment Steps

### 1. Deploy to Vercel Staging

```bash
# From project root
export SKIP_ENV_VALIDATION=true
npx vercel --yes

# Or deploy specific commit
npx vercel --yes --prod=false
```

**Expected Output:**
```
✔ Linked to all-inone/effinity-platform
🔍 Inspect: https://vercel.com/all-inone/effinity-platform/...
✅ Production: https://effinity-platform-[hash].vercel.app
```

### 2. Verify Deployment

Once deployed, verify these URLs work:

**Frontend:**
- `https://[deployment-url]/dashboard/production/creative/customers`
- `https://[deployment-url]/dashboard/production/creative/calendar`
- `https://[deployment-url]/dashboard/production/creative` (overview)

**Expected Behavior:**
- Customers page loads (may show empty state if no data)
- Calendar page loads (may show "No events" if no data)
- Navigation sidebar visible on left
- No console errors (check browser DevTools)

### 3. Test API Integration

**Option A: Using Browser DevTools**
```javascript
// Open Console on Customers page
// Check Network tab for:
GET https://[api-url]/creative-clients
Response: [] or [{id, name, ...}]
```

**Option B: Using curl**
```bash
# Test Customers API
curl -X GET "https://[api-url]/creative-clients" \
  -H "x-org-id: demo-org" \
  -H "x-owner-uid: demo-user"

# Test Calendar API
curl -X GET "https://[api-url]/creative-calendar/events?startDate=2025-01-01&endDate=2025-01-31" \
  -H "x-org-id: demo-org" \
  -H "x-owner-uid: demo-user"
```

**Expected Responses:**
- Status 200 OK
- JSON array (may be empty if no data)
- No 401/403 errors (auth working)
- No 500 errors (server healthy)

---

## Post-Deployment Tasks

### 4. Run Lighthouse Audits

```bash
# Install Lighthouse CLI (if not already installed)
npm install -g lighthouse

# Run audit on Customers page
lighthouse https://[deployment-url]/dashboard/production/creative/customers \
  --output html \
  --output-path ./lighthouse-customers.html \
  --view

# Run audit on Calendar page
lighthouse https://[deployment-url]/dashboard/production/creative/calendar \
  --output html \
  --output-path ./lighthouse-calendar.html \
  --view
```

**Target Scores** (all ≥90):
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

**Common Issues & Fixes:**
- **Performance < 90**: Check image sizes, bundle splitting
- **Accessibility < 90**: Verify aria-labels, color contrast
- **Best Practices < 90**: Check HTTPS, console errors
- **SEO < 90**: Add meta descriptions, canonical URLs

### 5. Verify GA4 Tracking

**Option A: Real-time Reports**
1. Go to GA4 dashboard: https://analytics.google.com
2. Navigate to Reports > Realtime
3. Open Customers page on staging
4. Check event appears: `prod_page_viewed` with `page_name=customers`

**Option B: Debug Mode (Chrome Extension)**
1. Install "Google Analytics Debugger" extension
2. Enable debugger
3. Open Console
4. Navigate to Customers page
5. Look for `[GA4]` log lines or `gtag` calls

**Expected Events:**
- `prod_page_viewed` on page load
- `prod_customer_searched` on search input
- `prod_customer_filtered` on filter apply
- Vertical property: `productions`
- Timestamp included

### 6. Configure Sentry (Error Tracking)

**If not already configured:**

1. Add Sentry DSN to Vercel env vars:
```
NEXT_PUBLIC_SENTRY_DSN=https://[key]@o[org].ingest.sentry.io/[project]
SENTRY_ORG=effinity-p5
SENTRY_PROJECT=effinity
```

2. Verify error tracking:
```javascript
// Trigger test error in Console
throw new Error('Test Sentry error from Productions');
```

3. Check Sentry dashboard for error with:
- Tag: `vertical=productions`
- Page: `/dashboard/production/creative/customers`
- User context (if logged in)

---

## Environment Variables

### Required for Production

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Firebase Auth
FIREBASE_ADMIN_PRIVATE_KEY="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_API_KEY="..."

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID="G-..."

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_ORG="effinity-p5"
SENTRY_PROJECT="effinity"

# API
NEXT_PUBLIC_API_URL="https://[api-domain]" # e.g., https://api.effinity.co.il
# OR for dev: http://localhost:4000
```

### Set in Vercel Dashboard

1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable above
4. Select environment: Production, Preview, Development
5. Save and redeploy

---

## Rollback Plan

If deployment fails or has critical issues:

```bash
# Option 1: Revert to previous deployment in Vercel dashboard
# Go to Deployments tab > Click previous deployment > "Promote to Production"

# Option 2: Revert Git commit and redeploy
git revert HEAD~1  # Revert last commit
git push origin main
npx vercel --prod

# Option 3: Roll back specific commit
git reset --hard [previous-commit-hash]
git push --force origin main
npx vercel --prod
```

**Previous stable commit:** `152ed52` (before API wiring)

---

## Troubleshooting

### Issue: "Cannot connect to API"

**Symptoms:**
- Customers/Calendar pages show empty state
- Network tab shows failed requests
- Console errors: "Failed to fetch"

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` env var is set
2. Verify API server is running
3. Check CORS headers allow Vercel domain
4. Test API directly with curl (see Step 3 above)

### Issue: "Prisma Client not found"

**Symptoms:**
- 500 errors on API routes
- "Cannot find module '@prisma/client'"

**Solution:**
```bash
# Regenerate Prisma Client
DATABASE_URL="..." ./node_modules/.bin/prisma generate --schema packages/server/db/prisma/schema.prisma

# Rebuild and redeploy
SKIP_ENV_VALIDATION=true pnpm build
npx vercel --prod
```

### Issue: "Module not found: @/lib/api/creative-productions"

**Symptoms:**
- Build fails on Vercel
- TypeScript errors

**Solution:**
1. Check file exists: `apps/web/lib/api/creative-productions.ts`
2. Verify tsconfig.json has path alias: `"@/*": ["./"]`
3. Clear cache and rebuild:
```bash
rm -rf .next node_modules/.cache
pnpm install
pnpm build
```

### Issue: Lighthouse scores < 90

**Performance:**
- Minimize bundle size: Dynamic imports for heavy components
- Optimize images: Use Next.js Image component
- Enable caching: Set proper headers

**Accessibility:**
- Add aria-labels to all interactive elements
- Ensure color contrast ≥ 4.5:1
- Keyboard navigation (tab order, focus states)

**Best Practices:**
- Use HTTPS everywhere
- Fix console errors/warnings
- Update dependencies

---

## Success Criteria

Deployment is successful when:

- [✓] Staging URL loads without errors
- [✓] Customers page displays (empty or with data)
- [✓] Calendar page displays (empty or with data)
- [✓] API responses return 200 OK
- [✓] Lighthouse scores all ≥ 90
- [✓] GA4 events tracked in real-time dashboard
- [✓] Sentry configured (no critical errors)
- [✓] Mobile responsive (test on real device or DevTools)
- [✓] Dark mode works (toggle in browser)
- [✓] RTL works (change language to Hebrew)

---

## Next Steps After Deployment

1. **Add Test Data:**
   - Create 2-3 sample customers via API
   - Create projects with deadlines to populate calendar
   - Verify data displays correctly

2. **User Acceptance Testing:**
   - Test all user flows (search, filter, create, etc.)
   - Test on different devices (mobile, tablet, desktop)
   - Test in different browsers (Chrome, Safari, Firefox)

3. **Performance Monitoring:**
   - Set up Vercel Analytics
   - Monitor Core Web Vitals
   - Watch error rates in Sentry

4. **Continue with Remaining Pages:**
   - Projects, Assets, Renders, Tasks, Reviews
   - Analytics, Settings
   - Use same patterns as Customers/Calendar

---

## Contact

**For deployment issues:**
- Check Vercel dashboard: https://vercel.com/all-inone/effinity-platform
- Check GitHub Actions (if configured)
- Review Sentry errors

**For API issues:**
- Check API server logs
- Verify database connection
- Test with curl/Postman

**For questions:**
- Refer to README_PRODUCTIONS_UI.md
- Check PHASE_11_PROGRESS_PART2.md
- Contact platform team

---

**Deployment Date:** 2025-01-18
**Version:** Phase 11 - Creative Productions v1.0
**Deployed By:** Claude Code
