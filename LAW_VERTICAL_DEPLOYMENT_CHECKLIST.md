# Law Vertical - Staging Deployment & QA Checklist

**Version:** Phase 2 Complete
**Commit:** `4d62ee6`
**Date:** 2025-10-18
**Status:** Ready for Staging Deployment

---

## 🚀 Pre-Deployment Verification (Automated)

### ✅ Build Status
- [x] Build compiles without errors
- [x] All 12 Law routes exist with page.tsx files
- [x] No import/export mismatches
- [x] TypeScript strict mode passes
- [x] No console.log debug statements (only error logging)
- [x] No TODO/FIXME comments requiring immediate attention

### ✅ Route Structure
All Law vertical routes verified:
```
/dashboard/law (NEW - index redirect)
/dashboard/law/dashboard (main dashboard)
/dashboard/law/cases (list view)
/dashboard/law/cases/[id] (detail view with tabs)
/dashboard/law/clients (grid view)
/dashboard/law/documents (table view)
/dashboard/law/calendar (calendar view)
/dashboard/law/tasks (Kanban + table toggle)
/dashboard/law/invoices (list view)
/dashboard/law/reports (analytics + export)
/dashboard/law/team (team cards)
/dashboard/law/settings (multi-tab settings)
```

### ✅ Bundle Analysis
- xlsx library: Dynamically imported ✓
- Law pages: 2-20 kB per page ✓
- Total Law vertical footprint: ~80 kB (optimized) ✓

---

## 📦 Deployment Steps

### 1. Deploy to Staging
```bash
# If using Vercel:
vercel --prod

# If using custom deployment:
git push staging main
# OR
./deploy-staging.sh
```

### 2. Verify Deployment
```bash
# Check deployment status
vercel ls

# Get staging URL
vercel inspect <deployment-id>
```

### 3. Clear Cache
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
- Clear service worker cache in DevTools
- Verify chunk files load completely (no EOF errors)

---

## 🧪 QA Verification Checklist

### 1. Routing & Navigation ✓

**Test Cases:**
- [ ] Navigate to `/dashboard/law` → Should redirect to `/dashboard/law/dashboard`
- [ ] All 12 routes load without 404 errors
- [ ] Browser back/forward buttons work correctly
- [ ] No full page reloads when navigating between Law pages
- [ ] No console errors in browser DevTools

**How to Test:**
1. Open staging URL + `/dashboard/law`
2. Check URL automatically changes to `/dashboard/law/dashboard`
3. Click through all sidebar menu items
4. Use browser back button to verify history works
5. Open DevTools Console tab - should be clean (no errors)

---

### 2. Modals & CRUD Operations ✓

**Test Each Modal:**

**A. Case Modal**
- [ ] Click "New Case" button → Modal opens
- [ ] Fill form: Title, Client (dropdown), Case Type, Priority, Status
- [ ] Click "Save" → Toast notification appears ("Case created successfully!")
- [ ] Case appears in table immediately (optimistic update)
- [ ] Click "Edit" on existing case → Modal pre-fills with data
- [ ] Update case → Toast notification, table updates
- [ ] Click "Delete" → Confirmation dialog → Case removed
- [ ] ESC key closes modal
- [ ] Click outside modal backdrop → Modal closes

**B. Client Modal**
- [ ] Click "New Client" button → Modal opens
- [ ] Fill form: Name, Email (validate format), Client Type
- [ ] Click "Save" → Toast notification
- [ ] Client card appears in grid
- [ ] Edit/delete flows work

**C. Document Upload Modal**
- [ ] Click "Upload Document" → Modal opens
- [ ] Drag-and-drop a PDF file → File preview shows
- [ ] Fill metadata: Title, Case (optional), Tags
- [ ] Click "Upload" → Progress bar shows
- [ ] Upload completes → Toast notification, document appears in table
- [ ] Try invalid file (> 50MB or wrong type) → Error message shows

**D. Task Modal**
- [ ] Create task with all fields
- [ ] Select Kanban column (todo/in_progress/review/done)
- [ ] Task appears in correct Kanban column
- [ ] Edit/delete work correctly

**E. Event Modal**
- [ ] Create event with datetime picker
- [ ] Verify end time > start time validation
- [ ] All-day event checkbox works
- [ ] Event appears on calendar

**F. Invoice Modal**
- [ ] Create invoice with line items
- [ ] Click "Add Line Item" → New row appears
- [ ] Enter quantity, unit price → Total auto-calculates
- [ ] Invoice total = sum of all line items
- [ ] Delete line item works (min 1 required)

**Expected Results:**
- All modals open/close smoothly
- Form validation shows errors for required fields
- Toast notifications appear for all CRUD actions
- Data refreshes immediately after operations
- No console errors

---

### 3. Tasks Board (Kanban) ✓

**Drag-and-Drop Tests:**
- [ ] Open `/dashboard/law/tasks`
- [ ] Drag task from "To Do" to "In Progress"
  - Card moves instantly (optimistic update)
  - Status badge updates to "In Progress"
  - API call completes in background
- [ ] Drag task within same column (reorder)
  - Order updates correctly
  - Other cards shift positions
- [ ] Drag task to "Done" column
  - Status changes to "Completed"
  - Completion date set
- [ ] Refresh page → Changes persist (API saved correctly)

**View Toggle:**
- [ ] Click "Kanban Board" / "Table View" toggle
- [ ] Both views show same data
- [ ] Switching between views is instant

**Filters:**
- [ ] Filter by priority (urgent/high/medium/low)
- [ ] Filter by status
- [ ] Search by task title
- [ ] Clear filters shows all tasks

**Expected Results:**
- Smooth drag animations
- No flickering or layout shifts
- Touch devices: Drag works with finger
- Keyboard: Arrow keys to navigate (accessibility)

---

### 4. Calendar ✓

**View Modes:**
- [ ] Month view shows events on correct dates
- [ ] Week view shows time slots with events
- [ ] Agenda view lists upcoming events chronologically

**Navigation:**
- [ ] "Previous" button goes to prev month/week
- [ ] "Today" button jumps to current date
- [ ] "Next" button advances month/week

**Filters:**
- [ ] Filter by event type (hearing/meeting/deadline)
- [ ] Filter by attorney
- [ ] Date range picker works

**CRUD:**
- [ ] Click date → EventModal opens with pre-filled date
- [ ] Click existing event → EventModal opens in edit mode
- [ ] Create/edit/delete events work
- [ ] Events update in calendar immediately

**Expected Results:**
- Calendar renders correctly in all views
- Events display at correct times
- No overlap issues in week view
- Timezone handling correct (shows local time)

---

### 5. Reports & Excel Export ✓

**Export Functionality:**
- [ ] Open `/dashboard/law/reports`
- [ ] Click "Export to Excel" button
- [ ] Loading state shows ("Exporting...")
- [ ] File downloads: `Law_Report_YYYY-MM-DD.xlsx`
- [ ] Open file in Excel/Google Sheets
- [ ] Verify 4 sheets exist: Cases, Clients, Tasks, Invoices
- [ ] Each sheet has:
  - Header row with column names
  - Data rows with correct values
  - Proper date formatting (YYYY-MM-DD)
  - Currency symbols (₪ for ILS)
  - Auto-sized columns
  - Filters on header row

**Performance:**
- [ ] Check Network tab: xlsx library loads only on export click
- [ ] Export completes within 5 seconds (for ~100 records)

**Data Accuracy:**
- [ ] Cases sheet: caseNumber, title, client, type, status, priority, dates
- [ ] Clients sheet: name, email, phone, type, case count
- [ ] Tasks sheet: title, case, priority, status, due date, assignee
- [ ] Invoices sheet: invoice #, client, amount, status, dates

**Expected Results:**
- Clean Excel file with no formatting errors
- All data accurate and complete
- No console errors during export
- Toast notification on success

---

### 6. Header & Footer ✓

**Header (Persistent):**
- [ ] Header visible on all Law vertical pages
- [ ] Shows current page title (dynamic based on route)
- [ ] Language toggle (EN/HE) works
  - Click toggle → UI language changes
  - Layout flips to RTL in Hebrew
  - All text translates correctly
- [ ] Notifications bell icon (placeholder)
- [ ] User profile dropdown (placeholder)

**Footer:**
- [ ] Footer visible on `/dashboard/law/dashboard` only
- [ ] Effinity logo present
- [ ] Contact info: email, phone
- [ ] Social media links (if applicable)
- [ ] Legal links work:
  - [ ] /legal/privacy → Privacy Policy page loads
  - [ ] /legal/terms → Terms of Service page loads
  - [ ] /legal/ip → IP Policy page loads
  - [ ] /legal/brand → Brand Guidelines page loads
  - [ ] /legal/content → Content Policy page loads
- [ ] Copyright notice displays current year

**Expected Results:**
- Header stays fixed on scroll
- Footer only on main dashboard (not nested pages)
- All links functional
- Responsive on mobile (hamburger menu if applicable)

---

### 7. Performance & Accessibility ✓

**Lighthouse Audits:**

Run audits on these pages:
1. `/dashboard/law/dashboard`
2. `/dashboard/law/tasks` (Kanban - most complex)

**How to Run Lighthouse:**
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select: Performance, Accessibility, Best Practices, SEO
4. Device: Desktop (first run), then Mobile
5. Click "Analyze page load"

**Target Scores:**
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

**Performance Checklist:**
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Total Blocking Time (TBT) < 300ms

**Accessibility Checklist:**
- [ ] All buttons have accessible names
- [ ] All form fields have labels
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works (Tab, Enter, ESC)
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements
- [ ] No missing alt text on images

**Responsive Design:**
- [ ] Mobile (375px width): Layout stacks vertically, no horizontal scroll
- [ ] Tablet (768px width): Grid layouts adjust to 2 columns
- [ ] Desktop (1920px width): Full layout with sidebars
- [ ] Touch targets: Minimum 44×44px (mobile)

**Dark Mode:**
- [ ] Toggle dark mode in system settings
- [ ] All pages render correctly (dark backgrounds, light text)
- [ ] Cards have proper contrast
- [ ] Modals visible in dark mode
- [ ] No white flash on page load

**RTL Support (Hebrew):**
- [ ] Toggle to Hebrew language
- [ ] Layout flips: Sidebar on right, content on left
- [ ] Text aligns right
- [ ] Icons mirror (arrow directions flip)
- [ ] Date pickers show Hebrew calendar names

**Expected Results:**
- All Lighthouse scores ≥ 90
- Smooth scrolling and animations
- No layout shifts or flashing
- Clean rendering in all viewports
- Dark mode and RTL work perfectly

---

### 8. Telemetry & Monitoring ✓

**Google Analytics 4 (GA4):**

**Events to Verify:**
1. Page View: `/dashboard/law/dashboard` → Check GA4 Real-Time report
2. Modal Open: Open CaseModal → Event: `modal_open` with `modal_type: case`
3. Export Click: Export to Excel → Event: `export_click` with `export_type: excel`
4. CRUD Actions:
   - Create case → Event: `case_created`
   - Update case → Event: `case_updated`
   - Delete case → Event: `case_deleted`

**How to Verify:**
1. Open [GA4 Console](https://analytics.google.com)
2. Go to Reports → Real-time
3. Perform actions in Law vertical
4. Events should appear within 10-30 seconds
5. Check event parameters are correct

**Sentry Error Tracking:**

**Test Error Handling:**
1. Trigger handled error (e.g., upload invalid file)
2. Check Sentry dashboard for logged error
3. Verify error includes:
   - User ID (if authenticated)
   - Route/page where error occurred
   - Error message and stack trace
   - Browser and OS info

**Expected Sentry Events:**
- Upload error: File too large (> 50MB)
- Network error: API timeout or 500 error
- Validation error: Invalid form submission

**Expected Results:**
- GA4 events logged correctly
- Event parameters accurate
- Sentry captures errors with context
- No PII (personally identifiable information) in error logs

---

## 🧩 Regression Testing (Productions Module)

Since `useProductionsData.ts` was modified (added 9 hook exports), verify Productions module still works:

### Budget Flow
- [ ] Open `/dashboard/productions/projects/[id]`
- [ ] Click "Add Budget Item"
- [ ] Fill: Description, Amount, Category
- [ ] Save → Budget item appears in list
- [ ] Edit budget item → Changes save
- [ ] Delete budget item → Removed from list
- [ ] UI refreshes without full reload (react-query invalidation works)

### File Flow
- [ ] Same project detail page
- [ ] Click "Upload File"
- [ ] Select file (PDF, image, etc.)
- [ ] Upload → File appears in Files tab
- [ ] Click "Download" → File downloads correctly
- [ ] Click "Delete" → Confirmation → File removed
- [ ] UI updates immediately

**Expected Results:**
- All CRUD operations work
- No console errors
- Cache invalidation triggers UI refresh
- No regressions from hook additions

---

## 📊 Performance Benchmarks

**Target Metrics:**

| Metric | Target | Measured |
|--------|--------|----------|
| Dashboard Page Load | < 1.5s | _____ |
| Kanban Drag Response | < 100ms | _____ |
| Modal Open Time | < 200ms | _____ |
| Excel Export (100 records) | < 3s | _____ |
| API Response Time | < 500ms | _____ |

**How to Measure:**
1. Open DevTools → Network tab
2. Disable cache
3. Reload page
4. Check "Load" time in Network panel
5. Record in table above

---

## 🐛 Known Issues / Limitations

**Phase 2 Scope:**
- ✅ All CRUD operations functional
- ✅ All pages connected to APIs
- ✅ Kanban drag-and-drop working
- ✅ Excel export implemented

**Deferred to Phase 3:**
- ⏳ PDF generation for invoices (endpoint exists, PDF library not integrated)
- ⏳ Email notifications (backend ready, email service not configured)
- ⏳ Document e-signature integration (future)
- ⏳ Calendar sync with Google/Outlook (future)
- ⏳ Advanced role-based permissions (currently all users have full access)
- ⏳ Real-time collaboration (WebSockets not implemented)
- ⏳ AI features (case summarization, document tagging)

**Pre-existing Warnings (Unrelated to Law):**
- Sentry/OpenTelemetry bundle size warnings (infrastructure-level)
- Productions module import warnings (fixed with hook exports)

---

## ✅ Sign-Off Checklist

Before promoting to production, verify:

- [ ] All QA checklist items pass ✅
- [ ] No console errors or API failures
- [ ] Lighthouse scores ≥ 90 on key pages
- [ ] GA4 events confirmed in Real-Time reports
- [ ] Sentry error handling verified
- [ ] Regression testing passes (Productions module)
- [ ] Mobile and desktop responsive
- [ ] Dark mode and RTL work correctly
- [ ] Staging URL shared with team
- [ ] Product owner approval received

---

## 📝 QA Summary Template

After completing QA, fill out this summary:

```
Law Vertical - Staging QA Summary
Date: _____________
Tester: _____________
Staging URL: _____________

✅ Routing & Navigation: PASS / FAIL
   Notes: _____________

✅ Modals & CRUD: PASS / FAIL
   Notes: _____________

✅ Tasks Kanban: PASS / FAIL
   Notes: _____________

✅ Calendar: PASS / FAIL
   Notes: _____________

✅ Reports & Export: PASS / FAIL
   Notes: _____________

✅ Header & Footer: PASS / FAIL
   Notes: _____________

✅ Performance: PASS / FAIL
   Lighthouse Scores:
   - Dashboard: P___ A___ BP___ SEO___
   - Tasks: P___ A___ BP___ SEO___

✅ Telemetry: PASS / FAIL
   GA4: ___ events confirmed
   Sentry: ___ errors logged

✅ Regression: PASS / FAIL
   Productions Budget: PASS / FAIL
   Productions Files: PASS / FAIL

Overall Status: READY FOR PRODUCTION / NEEDS FIXES

Blockers (if any):
_____________________________________________

Sign-off:
Product Owner: _____________ Date: _______
QA Lead: _____________ Date: _______
Tech Lead: _____________ Date: _______
```

---

## 🚀 Production Deployment

Once staging is verified:

1. **Create release tag:**
   ```bash
   git tag -a v2.0-law-vertical -m "Law Vertical Phase 2 Complete"
   git push origin v2.0-law-vertical
   ```

2. **Deploy to production:**
   ```bash
   vercel --prod
   # OR
   ./deploy-production.sh
   ```

3. **Monitor deployment:**
   - Check Vercel deployment logs
   - Monitor Sentry for errors (first 30 minutes)
   - Check GA4 for traffic spike
   - Verify API rate limits not exceeded

4. **Post-deployment verification:**
   - Test login flow → /dashboard/law redirect
   - Create 1 test case, client, document
   - Export sample report
   - Delete test data

5. **Rollback plan (if needed):**
   ```bash
   vercel rollback
   # OR revert commit and redeploy
   git revert HEAD
   git push origin main
   ```

---

**Generated:** 2025-10-18
**Version:** Phase 2 Complete
**Commit:** `4d62ee6`
**Status:** Ready for Staging QA
