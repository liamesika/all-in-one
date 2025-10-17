# UAT Testing Guide - Phase 9
## Effinity Platform - Productions Vertical

**Production URL**: https://effinity-platform-ec6tlixe7-all-inones-projects.vercel.app
**Test Date**: October 17, 2025
**Version**: v2.0.0-productions-rc

---

## Test Credentials

### Real Estate Vertical
- **Email**: lia@gmail.com
- **Password**: Ll123456

### Productions Vertical
- **Email**: liap@gmail.com
- **Password**: Ll123456

---

## 1. Google Analytics 4 Testing

### Setup
1. Open [GA4 DebugView](https://analytics.google.com/analytics/web/)
2. Navigate to: **Reports → Realtime → DebugView**
3. Open test interface: https://effinity-platform-ec6tlixe7-all-inones-projects.vercel.app/api/test/ga4

### Test Cases

| Event Name | Test Action | Expected Result | Status |
|------------|-------------|-----------------|--------|
| `page_view` | Load any page | Event appears in DebugView with page_path parameter | ⏳ |
| `project_create` | Click "Project Create" button on test page | Event with project details appears | ⏳ |
| `task_complete` | Click "Task Complete" button on test page | Event with task_id and status appears | ⏳ |
| `file_upload` | Click "File Upload" button on test page | Event with file_type and file_size appears | ⏳ |
| `report_view` | Click "Report View" button on test page | Event with report_type and date_range appears | ⏳ |

**Verification Steps:**
1. Open test page in one browser tab
2. Open GA4 DebugView in another tab
3. Click each test button
4. Verify events appear within 5 seconds
5. Check all event parameters are populated correctly

---

## 2. Sentry Error Tracking Testing

### Test Endpoints
Base URL: https://effinity-platform-ec6tlixe7-all-inones-projects.vercel.app/api/test/sentry

### Test Cases

| Test Type | URL | Expected Sentry Capture | Status |
|-----------|-----|-------------------------|--------|
| Captured Error | `/api/test/sentry?type=error` | Error with tags and context | ⏳ |
| Uncaught Exception | `/api/test/sentry?type=exception` | Exception caught by error boundary | ⏳ |
| Info Message | `/api/test/sentry?type=message` | Message with info level | ⏳ |
| Breadcrumbs | `/api/test/sentry?type=breadcrumbs` | Error with breadcrumb trail | ⏳ |

**Verification Steps:**
1. Open [Sentry Dashboard](https://sentry.io/organizations/effinity-p5/projects/javascript-nextjs/)
2. Navigate to **Issues** tab
3. Execute each test endpoint using curl or browser
4. Verify errors appear in Sentry with:
   - Correct environment tag (production/preview)
   - Stack traces
   - Context data (tags, extra info)
   - Breadcrumbs (for breadcrumb test)
5. Check error grouping is working correctly

**Example Test Command:**
```bash
curl "https://effinity-platform-ec6tlixe7-all-inones-projects.vercel.app/api/test/sentry?type=error"
```

---

## 3. Productions Vertical - Functional Testing

Login as: **liap@gmail.com** / **Ll123456**

### 3.1 Projects Module

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Create Project** | 1. Navigate to `/dashboard/production/projects`<br>2. Click "New Project"<br>3. Fill in: Name, Client, Budget, Dates<br>4. Click Save | Project appears in list, success notification shown | ⏳ |
| **Edit Project** | 1. Click on existing project<br>2. Modify project name<br>3. Save changes | Changes persist after refresh | ⏳ |
| **Delete Project** | 1. Open project options menu<br>2. Click Delete<br>3. Confirm deletion | Project removed from list | ⏳ |
| **View Project Details** | 1. Click on project card<br>2. Navigate through tabs (Overview, Tasks, Files, Team) | All tabs load without errors | ⏳ |
| **Filter Projects** | 1. Use status filter (Active/Completed/Archived)<br>2. Use search bar | Results update correctly | ⏳ |

### 3.2 Tasks Module (Kanban)

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Create Task** | 1. Navigate to `/dashboard/production/tasks`<br>2. Click "+" in any column<br>3. Add task details | Task appears in correct column | ⏳ |
| **Drag & Drop** | 1. Drag task between columns<br>2. Drop in new column | Task moves, status updates, no glitches | ⏳ |
| **Task Filters** | 1. Filter by assignee<br>2. Filter by priority<br>3. Filter by date range | Only matching tasks shown | ⏳ |
| **Task Search** | 1. Type in search box<br>2. Search by task name or ID | Results appear instantly | ⏳ |
| **Bulk Actions** | 1. Select multiple tasks<br>2. Change assignee/status/priority | All selected tasks update | ⏳ |
| **Task Details** | 1. Click on task<br>2. View/edit description, comments, attachments | All fields editable and save correctly | ⏳ |

### 3.3 Reports Module

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **View Dashboard** | 1. Navigate to `/dashboard/production/reports`<br>2. Check all charts load | Charts render with real data | ⏳ |
| **Date Range Filter** | 1. Select "Last 7 days"<br>2. Select "Last 30 days"<br>3. Select custom range | Charts update with filtered data | ⏳ |
| **Export Report** | 1. Click "Export" button<br>2. Select PDF or Excel | File downloads successfully | ⏳ |
| **Project Analytics** | 1. View project breakdown chart<br>2. Click on chart segment | Drill-down view shows details | ⏳ |

### 3.4 Clients Module

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Grid View** | 1. Navigate to `/dashboard/production/company`<br>2. View clients in grid | Cards display with project counts | ⏳ |
| **List View** | 1. Toggle to list view | Table shows all client data | ⏳ |
| **Create Client** | 1. Click "New Client"<br>2. Fill in details<br>3. Save | Client appears in list | ⏳ |
| **Search Clients** | 1. Type in search<br>2. Filter by industry | Results filter correctly | ⏳ |
| **Client Details** | 1. Click on client<br>2. View projects tab | Associated projects listed | ⏳ |

### 3.5 File Upload Testing

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Upload File** | 1. Open project/task<br>2. Click upload<br>3. Select file <5MB | Progress bar shows, file appears in list | ⏳ |
| **Large File** | 1. Upload file >10MB | Progress bar accurate, upload completes | ⏳ |
| **Multiple Files** | 1. Select 5+ files<br>2. Upload simultaneously | All files upload with individual progress | ⏳ |
| **File Preview** | 1. Click on uploaded image/PDF | Preview modal opens correctly | ⏳ |
| **Delete File** | 1. Click delete on file<br>2. Confirm | File removed from list and storage | ⏳ |
| **Signed URL Flow** | 1. Check network tab during upload<br>2. Verify signed URL request | GET signed URL → PUT to S3 → Confirm upload | ⏳ |

---

## 4. Authentication & Tenant Scoping

### 4.1 Auth Flow Testing

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Login** | 1. Go to `/login`<br>2. Enter liap@gmail.com / Ll123456<br>3. Submit | Redirect to dashboard, no errors | ⏳ |
| **Logout** | 1. Click profile menu<br>2. Click Logout | Redirect to login, session cleared | ⏳ |
| **Protected Routes** | 1. Logout<br>2. Try accessing `/dashboard/production/projects` | Redirect to login page | ⏳ |
| **Session Persistence** | 1. Login<br>2. Refresh page<br>3. Close/reopen tab | Session maintained, user logged in | ⏳ |

### 4.2 Tenant Isolation Testing

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Cross-Org Data** | 1. Login as liap@gmail.com<br>2. Check projects list<br>3. Logout<br>4. Login as lia@gmail.com<br>5. Check projects list | Each user sees ONLY their org data | ⏳ |
| **API Scoping** | 1. Intercept API requests (DevTools Network)<br>2. Check query parameters | All requests include orgId/ownerUid filter | ⏳ |
| **Direct URL Access** | 1. Copy project URL from one account<br>2. Login with different account<br>3. Try accessing URL | 403 Forbidden or redirect to 404 | ⏳ |

---

## 5. Mobile Responsiveness

### Test Devices
- **Mobile**: iPhone 13 Pro (390x844) or equivalent
- **Tablet**: iPad Air (820x1180)
- **Desktop**: 1920x1080

### 5.1 Mobile Testing (≤640px)

| Test Case | Breakpoint | Expected Result | Status |
|-----------|------------|-----------------|--------|
| **Navigation** | ≤640px | Hamburger menu, drawer opens smoothly | ⏳ |
| **Touch Targets** | ≤640px | All buttons/links ≥44x44px | ⏳ |
| **Forms** | ≤640px | Inputs stack vertically, full width | ⏳ |
| **Tables** | ≤640px | Horizontal scroll or card layout | ⏳ |
| **Modals** | ≤640px | Full screen on mobile, closeable | ⏳ |
| **Kanban Board** | ≤640px | Horizontal scroll or single column | ⏳ |

### 5.2 Tablet Testing (641px - 1024px)

| Test Case | Breakpoint | Expected Result | Status |
|-----------|------------|-----------------|--------|
| **Layout** | 768px | 2-column grid for cards | ⏳ |
| **Sidebar** | 768px | Collapsible or overlay | ⏳ |
| **Dashboard** | 768px | Charts resize proportionally | ⏳ |

---

## 6. Accessibility Testing

### 6.1 Keyboard Navigation

| Test Case | Keys | Expected Result | Status |
|-----------|------|-----------------|--------|
| **Tab Order** | Tab | Logical focus order through page | ⏳ |
| **Skip Links** | Tab (first) | "Skip to main content" appears | ⏳ |
| **Modal Focus** | Tab in modal | Focus trapped within modal | ⏳ |
| **Escape Key** | Esc in modal/dropdown | Closes and returns focus | ⏳ |
| **Enter/Space** | Enter/Space on buttons | Activates correctly | ⏳ |
| **Arrow Keys** | ↑↓ in dropdown/combobox | Navigates options | ⏳ |

### 6.2 Screen Reader Testing (NVDA/JAWS/VoiceOver)

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| **Landmarks** | Page structure announced (header, nav, main, footer) | ⏳ |
| **Headings** | Logical heading hierarchy (h1 → h2 → h3) | ⏳ |
| **Form Labels** | All inputs have associated labels | ⏳ |
| **Error Messages** | Errors announced and associated with fields | ⏳ |
| **Loading States** | "Loading..." announced with aria-live | ⏳ |

### 6.3 Visual Accessibility

| Test Case | Tool | Expected Result | Status |
|-----------|------|-----------------|--------|
| **Color Contrast** | [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) | All text ≥4.5:1, large text ≥3:1 | ⏳ |
| **Focus Indicators** | Visual inspection | Clear visible focus on all interactive elements | ⏳ |
| **Text Scaling** | Browser zoom to 200% | No horizontal scroll, text readable | ⏳ |
| **Reduced Motion** | Set OS to reduced motion | Animations respect prefers-reduced-motion | ⏳ |

---

## 7. Performance Testing

### 7.1 Lighthouse Audits

**Commands to Run:**

```bash
# Mobile Audit (Target: ≥90)
npx lighthouse https://effinity-platform-ec6tlixe7-all-inones-projects.vercel.app \
  --output=html \
  --output-path=./reports/lighthouse-mobile.html \
  --emulated-form-factor=mobile \
  --throttling-method=simulate

# Desktop Audit (Target: ≥95)
npx lighthouse https://effinity-platform-ec6tlixe7-all-inones-projects.vercel.app \
  --output=html \
  --output-path=./reports/lighthouse-desktop.html \
  --emulated-form-factor=desktop \
  --throttling-method=simulate
```

**Target Scores:**

| Category | Mobile Target | Desktop Target | Mobile Actual | Desktop Actual | Status |
|----------|---------------|----------------|---------------|----------------|--------|
| Performance | ≥90 | ≥95 | ___ | ___ | ⏳ |
| Accessibility | ≥90 | ≥90 | ___ | ___ | ⏳ |
| Best Practices | ≥90 | ≥90 | ___ | ___ | ⏳ |
| SEO | ≥90 | ≥90 | ___ | ___ | ⏳ |

### 7.2 Bundle Size Analysis

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Largest Route | ≤250 KB | ___ KB | ⏳ |
| First Load JS | ≤300 KB | ___ KB | ⏳ |
| Shared Chunks | ≤200 KB | ___ KB | ⏳ |

**Check Command:**
```bash
ANALYZE=true pnpm --filter web build
```

### 7.3 Runtime Performance

| Test Case | Target | Expected Result | Status |
|-----------|--------|-----------------|--------|
| **Page Load** | <3s | Homepage fully interactive | ⏳ |
| **Route Transition** | <500ms | Smooth navigation between pages | ⏳ |
| **API Response** | <1s | Data fetching completes | ⏳ |
| **Long Tasks** | <100ms | No blocking scripts (check DevTools) | ⏳ |
| **Memory Leaks** | Stable | No growth after 10 navigations | ⏳ |

---

## 8. Command Palette Testing (Phase 10)

| Test Case | Keys | Expected Result | Status |
|-----------|------|-----------------|--------|
| **Open Palette** | Cmd+K (Mac) / Ctrl+K (Win) | Modal opens with search | ⏳ |
| **Navigation** | Type "productions" | Productions options appear | ⏳ |
| **Search** | Type "tasks" | Task navigation shortcuts shown | ⏳ |
| **Arrow Navigation** | ↑↓ arrows | Highlight moves through options | ⏳ |
| **Select** | Enter | Navigates to selected page | ⏳ |
| **Close** | Esc | Palette closes, focus returns | ⏳ |
| **Dark Mode** | Toggle dark mode | Palette matches theme | ⏳ |

---

## 9. Known Issues & Limitations

### Current Limitations
- [ ] AWS S3 keys not configured (file uploads use mock signed URLs)
- [ ] Some Sentry warnings about instrumentation hooks (non-blocking)
- [ ] GA4 DebugView requires manual verification
- [ ] Real-time notifications pending Phase 10 implementation

### Browser Compatibility
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ IE11 not supported

---

## 10. Sign-Off Checklist

### Phase 9 Requirements
- [ ] All GA4 events verified in DebugView
- [ ] Sentry captures errors with correct context
- [ ] All Productions modules functional (Projects, Tasks, Reports, Clients)
- [ ] File uploads work end-to-end
- [ ] Tenant scoping verified (no cross-org data leaks)
- [ ] Mobile responsive (≤640px tested)
- [ ] Accessibility tested (keyboard + screen reader)
- [ ] Lighthouse scores: Mobile ≥90, Desktop ≥95
- [ ] No console errors on key pages
- [ ] Command Palette works (Cmd+K)

### Ready for Production
- [ ] All critical bugs fixed
- [ ] Performance targets met
- [ ] Security verified (tenant isolation)
- [ ] Monitoring active (GA4 + Sentry)
- [ ] Documentation complete

---

## 11. Bug Reporting Template

```markdown
### Bug Report

**Severity**: Critical / High / Medium / Low
**Module**: Productions / Real Estate / E-commerce / Platform
**URL**: [Direct link to issue]

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Video**:
[Attach if applicable]

**Environment**:
- Browser: Chrome 120 / Firefox 115 / Safari 17
- OS: macOS / Windows / iOS / Android
- Screen Size: 1920x1080 / 390x844 / etc.

**Console Errors**:
```
[Paste console errors]
```

**Additional Context**:
[Any other relevant information]
```

---

## Testing Sign-Off

**Tested By**: _______________
**Date**: _______________
**Version**: v2.0.0-productions-rc
**Status**: ✅ Approved / ⚠️ Issues Found / ❌ Blocked

**Notes**:
[Add any additional comments or observations]
