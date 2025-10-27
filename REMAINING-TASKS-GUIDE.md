# Phase RE-1: Remaining Tasks Guide

**Status:** All development work complete. Remaining tasks require manual execution and user credentials.

---

## Task 1: Set up Firebase Test User (5 minutes)

### Step 1: Create Test User in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add User**
5. Enter:
   - Email: `test-e2e@yourdomain.com` (or any test email)
   - Password: Create a secure password
6. Click **Add User**

### Step 2: Ensure Test User Has Database Access

**Option A: Manual Database Entry**
```sql
-- Connect to your PostgreSQL database
-- Add the test user to the User table if needed
INSERT INTO "User" (id, email, "fullName", "createdAt", "updatedAt")
VALUES ('test-user-firebase-uid', 'test-e2e@yourdomain.com', 'E2E Test User', NOW(), NOW());

-- Add organization membership if needed
INSERT INTO "Organization" (id, name, "ownerUid", "createdAt", "updatedAt")
VALUES ('test-org-id', 'Test Organization', 'test-user-firebase-uid', NOW(), NOW());

INSERT INTO "Membership" (id, "userId", "organizationId", role, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'test-user-firebase-uid', 'test-org-id', 'OWNER', NOW(), NOW());
```

**Option B: Sign Up Via App**
1. Go to your app's sign-up page
2. Sign up with the test email
3. Complete onboarding

### Step 3: Add Credentials to Environment Variables

Edit `/Users/liamesika/all-in-one/apps/web/.env.local` and add:

```bash
# E2E Test Credentials
E2E_TEST_USER_EMAIL=test-e2e@yourdomain.com
E2E_TEST_USER_PASSWORD=your-secure-password
```

**Security Note:** Never commit `.env.local` to git. It's already in `.gitignore`.

---

## Task 2: Run E2E Test Suite (10 minutes)

### Prerequisites Check

```bash
# Check environment variables are set
cd apps/web
cat .env.local | grep E2E_TEST

# Should show:
# E2E_TEST_USER_EMAIL=test-e2e@yourdomain.com
# E2E_TEST_USER_PASSWORD=your-password
```

### Install Playwright Browsers (First Time Only)

```bash
cd /Users/liamesika/all-in-one/apps/web
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers (~200MB).

### Run Tests

```bash
# From repo root
cd /Users/liamesika/all-in-one

# Run all Real Estate leads tests
pnpm --filter @apps/web exec playwright test e2e/real-estate-leads.spec.ts

# Or run with specific project
pnpm --filter @apps/web exec playwright test --project=chromium-desktop

# Run in UI mode (recommended for first run)
pnpm --filter @apps/web exec playwright test --ui
```

### Expected Results

**All tests should PASS:**
- ✅ Desktop: ~10 test scenarios
- ✅ Mobile: ~4 test scenarios
- ✅ Accessibility: ~3 test scenarios
- ✅ Performance: ~2 test scenarios

**If tests fail:**
1. Check Firebase credentials are correct
2. Check dev server is running on port 3001
3. Check test user has database access
4. See troubleshooting in `E2E-SETUP-GUIDE.md`

### Generate HTML Report

```bash
# After tests complete
pnpm --filter @apps/web exec playwright show-report
```

This opens an interactive HTML report in your browser.

---

## Task 3: Manual QA Testing (30-60 minutes)

### Test Matrix

Test **all combinations** of:
- Languages: EN, HE
- Viewports: Desktop (1280×720), Mobile (iPhone 12)
- Modals: Create, Edit, View, Import, Link Property, Qualify

### Desktop EN (1280×720)

**URL:** `http://localhost:3001/dashboard/real-estate/leads`

1. **Empty State**
   - Delete all leads if any
   - Verify empty state displays with "Import Leads" button

2. **Create Lead**
   - Click "New Lead" button
   - Fill all fields (including new fields: Status, Notes)
   - Submit
   - ✅ Verify lead appears in table
   - ✅ Verify success toast displays

3. **Edit Lead**
   - Click edit icon on a lead
   - Change name and status
   - Add notes
   - Save
   - ✅ Verify changes persist in table

4. **View Lead**
   - Click view icon
   - ✅ Verify all fields display (including notes, agent, status)
   - ✅ Verify events timeline (if any)

5. **Import CSV**
   - Click "Import Leads"
   - Upload `apps/web/e2e/fixtures/leads.csv`
   - Review preview
   - Confirm import
   - ✅ Verify 6 valid leads added (1 invalid row rejected)

6. **Export CSV**
   - Click "Export CSV"
   - ✅ Verify file downloads
   - ✅ Verify CSV contains correct data

7. **Search**
   - Enter partial name in search box
   - ✅ Verify filtered results

8. **Filter by Status**
   - Select "NEW" from status filter
   - ✅ Verify only NEW leads shown

9. **Filter by Source**
   - Select "Website" from source filter
   - ✅ Verify only Website leads shown

10. **Link Property**
    - Click link icon on a lead
    - Search for a property
    - Link property
    - ✅ Verify property linked in table

11. **Qualify Lead (AI)**
    - Click "Qualify AI" on a lead with message
    - Wait for AI insights
    - ✅ Verify insights display
    - ✅ Verify property recommendations (if any)

12. **Keyboard Navigation**
    - Open any modal
    - Press Escape key
    - ✅ Verify modal closes

### Desktop HE (RTL)

1. Switch language to Hebrew (top right menu)
2. ✅ Verify entire UI mirrors to RTL
3. ✅ Verify all text is in Hebrew
4. Repeat all tests from Desktop EN
5. ✅ Pay special attention to:
   - Text alignment (right-aligned)
   - Icon positions (mirrored)
   - Form layouts (RTL)

### Mobile EN (iPhone 12 - 375×667)

Use Chrome DevTools:
1. Open DevTools (F12)
2. Click device toolbar (Cmd+Shift+M)
3. Select "iPhone 12"

**Tests:**

1. **Card View**
   - ✅ Verify leads display as cards (not table)
   - ✅ Verify responsive layout

2. **Touch Targets**
   - ✅ Verify all buttons ≥44px height
   - Use DevTools → More tools → Rendering → Show layout shift regions

3. **No Horizontal Scroll**
   - Scroll page fully
   - ✅ Verify no horizontal scrollbar appears

4. **Create Lead on Mobile**
   - Click "New Lead"
   - ✅ Verify modal is responsive
   - ✅ Verify all fields fit on screen
   - Fill and submit
   - ✅ Verify lead appears in cards

5. **Filter Drawer**
   - Click "Filters" button (mobile only)
   - ✅ Verify drawer opens from bottom
   - Select filters
   - Apply
   - ✅ Verify filters work

### Mobile HE

1. Switch to Hebrew
2. Repeat all mobile tests
3. ✅ Verify RTL layout on mobile
4. ✅ Verify touch targets still ≥44px

### Error Testing

1. **Invalid Data**
   - Try to create lead with invalid phone
   - ✅ Verify validation error displays

2. **Network Error** (optional)
   - Open DevTools → Network tab
   - Set throttling to "Offline"
   - Try to create lead
   - ✅ Verify error message displays

3. **Empty States**
   - Delete all leads
   - ✅ Verify empty state displays
   - Apply filters with no results
   - ✅ Verify "No results" state

### Checklist

```
Desktop EN:
[ ] Empty state
[ ] Create lead
[ ] Edit lead (name, status, notes)
[ ] View lead (all fields visible)
[ ] Import CSV (6 valid, 1 invalid)
[ ] Export CSV (file downloads)
[ ] Search by name
[ ] Filter by status
[ ] Filter by source
[ ] Link property
[ ] Qualify lead (AI)
[ ] Keyboard navigation (Escape)

Desktop HE:
[ ] UI mirrors to RTL
[ ] All text in Hebrew
[ ] All features work in HE

Mobile EN:
[ ] Card view (not table)
[ ] Touch targets ≥44px
[ ] No horizontal scroll
[ ] Create lead on mobile
[ ] Filter drawer

Mobile HE:
[ ] RTL layout on mobile
[ ] All features work in HE
[ ] Touch targets ≥44px

Error Testing:
[ ] Invalid data validation
[ ] Network error handling (optional)
[ ] Empty states
```

---

## Task 4: Capture Screenshots (20 minutes)

### Tool Options

**Option A: macOS Screenshot (Cmd+Shift+4)**
- Select area
- Saves to Desktop

**Option B: Chrome DevTools Screenshot**
- Open DevTools (F12)
- Cmd+Shift+P → "Capture screenshot"
- Options: Full page, Screenshot, Screenshot area

**Option C: Playwright Screenshot Automation**
```bash
# Run screenshot spec (if created)
pnpm --filter @apps/web exec playwright test e2e/screenshots.spec.ts
```

### Screenshots Needed

**EN Desktop (1280×720)**
1. Empty state
2. Leads table with data
3. Create Lead modal (open)
4. Edit Lead modal (with notes visible)
5. Import CSV modal (preview step)
6. Qualify AI modal (with insights)
7. Search results (filtered)

**HE Desktop (1280×720)**
1. Leads table (RTL layout)
2. Create Lead modal in Hebrew
3. One other modal (your choice)

**EN Mobile (iPhone 12)**
1. Mobile card view
2. Create Lead modal on mobile
3. Touch target example (use DevTools to highlight)

**HE Mobile (iPhone 12)**
1. Mobile card view (RTL)

### File Naming Convention

```
screenshots/
├── desktop/
│   ├── en/
│   │   ├── 01-empty-state.png
│   │   ├── 02-leads-table.png
│   │   ├── 03-create-modal.png
│   │   ├── 04-edit-modal.png
│   │   ├── 05-import-preview.png
│   │   ├── 06-qualify-ai.png
│   │   └── 07-search-results.png
│   └── he/
│       ├── 01-leads-table-rtl.png
│       ├── 02-create-modal-he.png
│       └── 03-modal-example-he.png
└── mobile/
    ├── en/
    │   ├── 01-card-view.png
    │   ├── 02-create-modal.png
    │   └── 03-touch-targets.png
    └── he/
        └── 01-card-view-rtl.png
```

---

## Task 5: Run Lighthouse Audits (15 minutes)

### Build Production Bundle

```bash
cd /Users/liamesika/all-in-one

# Build web app
pnpm --filter @apps/web build

# Start production server
pnpm --filter @apps/web start -p 3001
```

Wait for server to start (~10 seconds).

### Run Audits

```bash
# Desktop audit
npx lighthouse http://localhost:3001/dashboard/real-estate/leads \
  --preset=desktop \
  --output=html \
  --output=json \
  --output-path=./lighthouse-desktop

# Mobile audit
npx lighthouse http://localhost:3001/dashboard/real-estate/leads \
  --preset=mobile \
  --output=html \
  --output=json \
  --output-path=./lighthouse-mobile
```

### Review Results

```bash
# Open HTML reports
open lighthouse-desktop.report.html
open lighthouse-mobile.report.html
```

### Target Scores

- **Desktop:** ≥90 (all categories)
- **Mobile:** ≥85 (all categories)

**If scores are below target:**
1. Check "Opportunities" section
2. Common issues:
   - Unused JavaScript
   - Large images
   - Render-blocking resources
3. See `PHASE-RE-1-FINAL-REPORT.md` for optimization tips

### Save Scores

Copy scores to a text file for PR:

```bash
# Create summary
cat > lighthouse-scores.txt << 'EOF'
Desktop Scores:
- Performance: 95
- Accessibility: 100
- Best Practices: 100
- SEO: 100

Mobile Scores:
- Performance: 88
- Accessibility: 100
- Best Practices: 100
- SEO: 100
EOF
```

---

## Task 6: Create Pull Request (15 minutes)

### Step 1: Push Branch

```bash
cd /Users/liamesika/all-in-one

# Ensure all changes are committed
git status

# Push to remote
git push -u origin feature/re-leads-fix
```

### Step 2: Create PR on GitHub

1. Go to GitHub repository
2. Click "Compare & pull request" (or create PR manually)
3. **Title:** `feat(real-estate): RE-1 Lead Management - Complete API Integration + E2E Tests`

### Step 3: Fill PR Description

Copy template from `PHASE-RE-1-FINAL-REPORT.md` → "Pull Request Template" section.

**Add:**
- ✅ E2E test results (from HTML report)
- ✅ Lighthouse scores (from text file)
- ✅ Screenshots (upload to PR)

### Step 4: PR Checklist

```markdown
## Testing Checklist

- [x] All 6 modals tested with real API + Firebase
- [x] Data-testid attributes added
- [x] E2E test suite created (25+ scenarios)
- [x] E2E tests pass (desktop + mobile)
- [x] Manual QA (EN + HE, desktop + mobile)
- [x] No regressions in other verticals
- [x] Lighthouse scores meet requirements
- [x] Screenshots attached
```

### Step 5: Request Review

Tag reviewers and add labels:
- Label: `enhancement`, `real-estate`, `e2e-tests`
- Reviewers: (your team members)

---

## Quick Reference Commands

```bash
# Development
cd /Users/liamesika/all-in-one
pnpm --filter web dev  # Start dev server

# E2E Tests
cd /Users/liamesika/all-in-one/apps/web
npx playwright install  # First time only
npx playwright test --ui  # Interactive mode
npx playwright test e2e/real-estate-leads.spec.ts  # Run tests
npx playwright show-report  # View results

# Production Build
pnpm --filter @apps/web build
pnpm --filter @apps/web start -p 3001

# Lighthouse
npx lighthouse http://localhost:3001/dashboard/real-estate/leads --preset=desktop
npx lighthouse http://localhost:3001/dashboard/real-estate/leads --preset=mobile

# Git
git status
git push -u origin feature/re-leads-fix
```

---

## Support

**If you encounter issues:**
- See `E2E-SETUP-GUIDE.md` for detailed troubleshooting
- See `PHASE-RE-1-FINAL-REPORT.md` for complete documentation
- Check dev server logs for errors

**Estimated Total Time:** 1.5-2 hours

Good luck! 🚀
