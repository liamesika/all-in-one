# Staging Deployment Notes - Phase 9

**Release:** v2.0.0-productions-rc
**Date:** January 2025
**Environment:** Staging
**Status:** 🟡 **AWAITING ENVIRONMENT KEYS**

---

## 🔑 Required Environment Keys (ACTION REQUIRED)

The following environment keys are **required** before staging deployment can proceed:

### 1. **Google Analytics 4 (GA4)**
```bash
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Purpose:** Track user events for Productions vertical
**Events to track:**
- `project_create`
- `project_update`
- `project_delete`
- `task_complete`
- `task_created`
- `file_upload`
- `file_delete`
- `budget_item_added`
- `report_view`
- `client_created`

**How to obtain:**
1. Go to Google Analytics Admin
2. Create new GA4 property for "Effinity Staging"
3. Copy Measurement ID (format: G-XXXXXXXXXX)

### 2. **Sentry Error Tracking**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ORG=effinity
SENTRY_PROJECT=all-in-one-staging
SENTRY_AUTH_TOKEN=xxxxx
```

**Purpose:** Capture frontend/backend errors, breadcrumbs, performance
**How to obtain:**
1. Create Sentry account at sentry.io
2. Create new project "all-in-one-staging"
3. Copy DSN from project settings
4. Generate auth token for releases

### 3. **AWS S3 Storage (Optional but recommended)**
```bash
AWS_ACCESS_KEY_ID=XXXXX
AWS_SECRET_ACCESS_KEY=XXXXX
AWS_REGION=eu-west-2
AWS_S3_BUCKET=effinity-staging
```

**Purpose:** File uploads in Productions vertical
**How to obtain:**
1. Create IAM user with S3 access
2. Create bucket "effinity-staging"
3. Copy access keys

---

## ✅ Environment Keys Already Configured

The following keys are already set from `.env.local` and `.env.vercel`:

### Firebase Authentication
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_DB_URL`
- ✅ `FIREBASE_ADMIN_PROJECT_ID`
- ✅ `FIREBASE_ADMIN_CLIENT_EMAIL`
- ✅ `FIREBASE_ADMIN_PRIVATE_KEY`

### Database
- ✅ `DATABASE_URL` (Neon PostgreSQL)

### OpenAI
- ✅ `OPENAI_API_KEY`

### App Configuration
- ✅ `NEXT_PUBLIC_APP_URL`
- ✅ `NEXT_PUBLIC_API_BASE_URL`
- ✅ `INVITE_LINK_BASE_URL`

---

## 📋 Deployment Checklist

### Pre-Deployment
- [x] Production build passes (`pnpm run build`)
- [x] TypeScript compilation clean
- [x] Zero ESLint warnings
- [x] All Phase 8 features committed
- [x] `.env.staging` template created
- [ ] **GA4 Measurement ID added to `.env.staging`**
- [ ] **Sentry DSN added to `.env.staging`**
- [ ] **AWS S3 keys added to `.env.staging`** (optional)

### Deployment Steps
1. **Set Environment Variables in Vercel:**
   ```bash
   # Navigate to Vercel dashboard
   # Project: effinity-platform
   # Environment: Preview (staging)
   # Add all variables from .env.staging
   ```

2. **Deploy to Staging:**
   ```bash
   # Option 1: Deploy via Vercel CLI
   vercel --env staging

   # Option 2: Deploy via Git (automatic)
   git push origin main
   # Vercel will auto-deploy preview
   ```

3. **Verify Deployment:**
   - [ ] Check Vercel deployment logs for errors
   - [ ] Visit staging URL: `https://staging.effinity.co.il`
   - [ ] Verify 200 response on all routes
   - [ ] Open browser DevTools console - no errors
   - [ ] Check Network tab - all API calls succeed

### Post-Deployment Verification

#### 1. **Console Errors Check**
```bash
# Visit these pages and check console:
- /dashboard/productions (Overview)
- /dashboard/productions/projects/[any-id] (Project Detail)
- /dashboard/production/tasks (Tasks)
- /dashboard/production/reports (Reports)
- /dashboard/production/company (Clients)

Expected: Zero console errors
```

#### 2. **API Health Check**
```bash
# Test API endpoints:
curl https://api-staging.effinity.co.il/api/productions-v2/projects
curl https://api-staging.effinity.co.il/api/productions-v2/analytics/overview

Expected: 200 status, valid JSON response
```

#### 3. **Firebase Auth Check**
```bash
# Try to sign in/sign up
# Expected: Successful authentication
```

---

## 🧪 UAT Checklist (Run on Staging)

### Projects Module
- [ ] **Create Project:** Fill form, submit, verify appears in list
- [ ] **Edit Project:** Update name/dates, save, verify changes persist
- [ ] **Delete Project:** Delete, verify removed from list
- [ ] **Overview Tab:** Displays project details correctly
- [ ] **Tasks Tab:** Shows tasks, can create/update/delete
- [ ] **Budget Tab:** Shows budget items, variance calculation correct
- [ ] **Files Tab:** Shows files, can upload/delete (requires S3)

### Tasks Module
- [ ] **Kanban Board:** Displays 4 columns (OPEN, IN_PROGRESS, DONE, BLOCKED)
- [ ] **Drag-and-Drop:** Can drag task between columns (visual feedback)
- [ ] **List View:** Table displays all tasks
- [ ] **Filters:** Search by title works
- [ ] **Status Filter:** Can filter by status
- [ ] **Create Task:** Modal opens, can create new task
- [ ] **Update Task:** Can change status inline
- [ ] **Delete Task:** Confirmation dialog, task removed

### Reports Module
- [ ] **Charts Render:** All 4 charts display without errors
- [ ] **Real Data:** Charts show actual data (not mock)
- [ ] **Date Range:** Period selector updates chart data
- [ ] **Metric Cards:** Display correct counts/percentages
- [ ] **AI Insights:** Generated based on real metrics
- [ ] **Recent Projects Table:** Shows live project data

### Clients Module
- [ ] **Grid View:** Client cards display correctly
- [ ] **List View:** Table shows all clients
- [ ] **Filters:** Search and type filter work
- [ ] **Project Counts:** Shows correct project count per client
- [ ] **Create Client:** Can add new client
- [ ] **Delete Client:** Confirmation dialog, client removed

### File Upload (Requires S3)
- [ ] **Upload Flow:** Click upload, select file, progress shown
- [ ] **Signed URL:** Backend generates URL correctly
- [ ] **S3 Upload:** File uploads to S3 successfully
- [ ] **Database Record:** File record saved to database
- [ ] **Display:** File appears in list immediately
- [ ] **Delete:** Can delete file from S3 and database

### Auth & Tenant Scoping
- [ ] **Cross-Org Isolation:** User A cannot see User B's data (different orgs)
- [ ] **User Switching:** Can switch organizations, data updates correctly
- [ ] **Permission Checks:** API returns 403 for unauthorized access

### Mobile Responsiveness (≤640px)
- [ ] **Card Views:** Stack vertically, readable
- [ ] **Drawers/Modals:** Full-width, smooth animations
- [ ] **Touch Targets:** All buttons ≥44px tap target
- [ ] **Navigation:** Hamburger menu works
- [ ] **Forms:** Input fields large enough
- [ ] **Tables:** Scroll horizontally or stack

### Accessibility
- [ ] **Keyboard Navigation:** Can tab through all interactive elements
- [ ] **Focus Trap:** Modal traps focus (Escape to close)
- [ ] **Focus Visible:** Blue outline on focused elements
- [ ] **Contrast:** Text readable (WCAG AA: 4.5:1 min)
- [ ] **Screen Reader:** Alt text on images, ARIA labels present
- [ ] **Skip Links:** "Skip to main content" link present

---

## 📊 Analytics & Monitoring

### GA4 Events (Verify in DebugView)

Once GA4 is configured, verify these events fire:

**Projects:**
- `project_create` - When project created
- `project_update` - When project edited
- `project_delete` - When project deleted
- `project_view` - When project detail page opened

**Tasks:**
- `task_create` - When task created
- `task_complete` - When task status → DONE
- `task_update` - When task edited
- `task_delete` - When task deleted

**Files:**
- `file_upload` - When file uploaded successfully
- `file_delete` - When file deleted

**Reports:**
- `report_view` - When reports page opened
- `chart_interaction` - When period selector changed

**Clients:**
- `client_create` - When client created
- `client_update` - When client edited
- `client_delete` - When client deleted

**How to verify:**
1. Go to GA4 → Admin → DebugView
2. Enable debug mode: Add `?debug_mode=true` to URL
3. Perform actions above
4. See events appear in DebugView in real-time

### Sentry Error Tracking

Once Sentry is configured, verify:

**Breadcrumbs:**
- [ ] Navigation events tracked
- [ ] API calls logged
- [ ] User actions captured

**Error Capture:**
- [ ] Frontend errors sent to Sentry
- [ ] Backend errors sent to Sentry
- [ ] Source maps uploaded (can see original code)
- [ ] Error rate near 0% (target: <0.1%)

**Performance:**
- [ ] Page load times tracked
- [ ] API response times tracked
- [ ] Long tasks flagged (>100ms)

**How to verify:**
1. Go to Sentry dashboard
2. Trigger test error: `throw new Error("Test error")`
3. See error appear in Sentry Issues
4. Check breadcrumbs show full user journey
5. Verify stack trace shows original TypeScript (not minified)

---

## 🎯 Performance Gates

### Lighthouse Audits (Run on staging URLs)

**Target Scores:**
- Mobile: ≥90
- Desktop: ≥95

**Pages to Audit:**
1. `/dashboard/productions` (Overview)
2. `/dashboard/productions/projects/[id]` (Project Detail)
3. `/dashboard/production/tasks` (Tasks)
4. `/dashboard/production/reports` (Reports)

**How to run:**
```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit (Mobile)
lighthouse https://staging.effinity.co.il/dashboard/productions \
  --preset=perf \
  --emulated-form-factor=mobile \
  --output=json \
  --output-path=./lighthouse-mobile-productions.json

# Run audit (Desktop)
lighthouse https://staging.effinity.co.il/dashboard/productions \
  --preset=perf \
  --emulated-form-factor=desktop \
  --output=json \
  --output-path=./lighthouse-desktop-productions.json
```

**Bundle Size Check:**
- [ ] Largest route ≤250 KB First Load JS
- [ ] No routes >300 KB
- [ ] Shared chunks properly split

**Performance Check:**
- [ ] No long tasks >100ms
- [ ] Time to Interactive <3s
- [ ] First Contentful Paint <1.8s
- [ ] Largest Contentful Paint <2.5s

---

## ⚠️ Known Issues

### Current Limitations
1. **File Upload:** Requires AWS S3 configuration (keys not yet provided)
2. **GA4 Events:** Analytics tracking ready but GA4 ID not configured
3. **Sentry:** Error tracking ready but DSN not configured
4. **Export Functionality:** Reports page export buttons are UI-only (backend TODO)
5. **Client Revenue:** Backend doesn't track per-client revenue yet (placeholder in UI)
6. **Client Ratings:** Backend doesn't have rating system yet (placeholder in UI)

### Expected Warnings (Safe to Ignore)
- React hydration warnings in development (Next.js known issue)
- Firebase SDK size warnings (expected for auth library)
- Framer Motion deprecation warnings (library maintainer issue)

### Critical Issues (Report Immediately)
- Any 500 errors on API calls
- Authentication failures
- Cross-org data leakage
- Console errors on page load
- Failed database connections

---

## 🚀 Next Steps After Staging Deploy

1. **Complete UAT Checklist** - Document pass/fail for each item
2. **Run Lighthouse Audits** - Attach JSON reports
3. **Verify GA4 Events** - Screenshot DebugView showing events
4. **Verify Sentry Errors** - Confirm error rate <0.1%
5. **Fix Any UAT Failures** - Open PRs, redeploy
6. **Tag Release** - `git tag v2.0.0-productions-rc`
7. **Proceed to Phase 10** - Platform-level features

---

## 📞 Support

**If deployment fails:**
1. Check Vercel deployment logs
2. Verify all environment variables set
3. Check database connectivity
4. Review Sentry errors (if configured)
5. Open GitHub issue with logs

**Environment Keys Contact:**
- Firebase: Already configured
- Database: Already configured
- OpenAI: Already configured
- **GA4: REQUIRED - Request from project owner**
- **Sentry: REQUIRED - Request from project owner**
- **AWS S3: OPTIONAL - Request if file upload needed**

---

**Report Generated:** January 2025
**Prepared By:** Claude Code (AI Assistant)
**Phase:** 9 - Staging Deploy
**Status:** Awaiting GA4 + Sentry keys
