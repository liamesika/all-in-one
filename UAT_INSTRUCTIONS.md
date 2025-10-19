# Law Dashboard Prototype - UAT & PR Evidence Collection

## 🎯 Overview

Complete these steps to finalize the PR for `feature/law-dashboard-prototype`:

**Dev Server:** http://localhost:3001/dashboard/law/dashboard

---

## ✅ UAT Checklist

### 1. Dashboard Loads Correctly
**URL:** http://localhost:3001/dashboard/law/dashboard

**Verify:**
- [ ] Page loads without errors (check browser console)
- [ ] 4 KPI cards visible: Active Cases (23), Clients (45), Billable Hours (128.5), Revenue (€89,250)
- [ ] Recent Cases widget shows 5 cases with status badges
- [ ] Upcoming Tasks widget shows 5 tasks with checkboxes
- [ ] Quick Actions visible (desktop: inline buttons, mobile: FAB)

---

### 2. Mobile FAB + Tap Targets

**Desktop (≥1024px):**
- [ ] Quick actions show as inline buttons above KPIs
- [ ] No FAB visible

**Mobile (<768px):**
- [ ] Quick actions hidden from top
- [ ] FAB visible in bottom-right corner
- [ ] FAB shows "+" icon
- [ ] All tap targets minimum 44x44px (verify with browser DevTools)

**Test tap targets:**
- [ ] All buttons minimum 44px height
- [ ] KPI cards clickable and tappable
- [ ] Recent Cases items clickable
- [ ] Task checkboxes large enough (44px touch area)

---

### 3. Accessibility (A11y)

**Keyboard Navigation:**
1. [ ] Tab through entire page (logical order: Quick Actions → KPIs → Recent Cases → Upcoming Tasks → FAB)
2. [ ] All interactive elements focusable (buttons, links, checkboxes)
3. [ ] Visible focus ring on all focused elements (2px law-primary outline)
4. [ ] Enter key triggers actions on buttons
5. [ ] Space key toggles checkboxes

**ARIA & Semantics:**
- [ ] FAB has `aria-label="Quick Actions Menu"`
- [ ] All icon-only buttons have accessible labels
- [ ] Proper heading hierarchy (h1 → h2 → h3)

**Contrast (WCAG AA = 4.5:1 minimum):**
- [ ] KPI text on background (dark navy #0E1A2B on white)
- [ ] Button text on primary background
- [ ] Badge text on colored backgrounds

**Use contrast checker:** https://webaim.org/resources/contrastchecker/

---

### 4. States: Skeleton, Empty, Error

**Skeleton State:**
1. Simulate slow loading by throttling network in DevTools (Slow 3G)
2. [ ] Skeleton screens appear immediately (no blank white screen)
3. [ ] Fixed heights prevent layout shift

**Empty State:**
To test, temporarily modify `NewLawDashboard.tsx`:
```typescript
// Line ~200: Change data to empty
const [data, setData] = useState<DashboardData>({
  kpis: { activeCases: 0, clients: 0, billableHours: 0, revenue: 0 },
  recentCases: [],
  upcomingTasks: [],
});
```
- [ ] "No cases yet" empty state appears in Recent Cases widget
- [ ] "No upcoming tasks" appears in Tasks widget
- [ ] Empty states show helpful messaging and CTA

**Error State:**
To test, simulate API error in console:
```javascript
throw new Error('API Error');
```
- [ ] Error boundary catches error gracefully
- [ ] User-friendly error message displayed

---

### 5. Analytics Behind Consent

**Setup:**
1. Open browser in Incognito/Private mode
2. Open DevTools → Network tab
3. Filter for "collect" (GA4 requests)

**Page Load:**
1. [ ] Visit http://localhost:3001/dashboard/law/dashboard
2. [ ] Check console for: `🔧 [Analytics] Event tracked: law_dashboard_view`
3. [ ] Verify NO network request to google-analytics.com (consent not given)

**Give Consent:**
1. Accept analytics consent (if consent banner present)
2. Reload page
3. [ ] Network request to `google-analytics.com/g/collect` appears
4. [ ] Request includes `law_dashboard_view` event

**Quick Action Click:**
1. Click "New Case" button (or FAB on mobile)
2. [ ] Console shows: `🔧 [Analytics] Event tracked: law_quick_action`
3. [ ] Network request includes event with `action: 'new_case'`

**GA4 DebugView:**
1. Open GA4: https://analytics.google.com/
2. Navigate to: Configure → DebugView
3. Enable debug mode in browser console:
   ```javascript
   window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
   ```
4. [ ] `law_dashboard_view` event appears in DebugView
5. [ ] `law_quick_action` event appears with parameters:
   - `action: 'new_case'`
   - `location: 'dashboard'`
   - `vertical: 'law'`

**Screenshot needed:**
- GA4 DebugView showing both events

---

### 6. RTL + Dark Mode + No CLS

**RTL (Right-to-Left):**
1. Add `dir="rtl"` to `<html>` tag in browser DevTools
2. [ ] Layout mirrors correctly
3. [ ] Text alignment switches to right
4. [ ] Icons and spacing flip appropriately
5. [ ] No overlapping or broken layouts

**Dark Mode:**
1. Add `data-theme="dark"` to `<html>` tag
2. [ ] Background changes to dark (#0E1A2B)
3. [ ] Text switches to light (#FAFAFC)
4. [ ] Accent color adjusts (#E5C54A)
5. [ ] All components remain readable
6. [ ] Contrast still meets WCAG AA

**Cumulative Layout Shift (CLS):**
1. Open DevTools → Performance tab
2. Record page load
3. Stop recording after page fully loads
4. Check "Experience" section for Layout Shifts
5. [ ] CLS score = 0 (no layout shifts)
6. [ ] Skeleton screens have fixed heights matching content

**Alternatively, use Lighthouse:**
- [ ] CLS score in Lighthouse report ≤ 0.1 (good)

---

## 📸 Evidence Collection

### 1. Lighthouse Mobile Audit

**Run Lighthouse:**
1. Open Chrome DevTools (http://localhost:3001/dashboard/law/dashboard)
2. Go to Lighthouse tab
3. Select:
   - Mode: Navigation
   - Device: Mobile
   - Categories: Performance, Accessibility, Best Practices, SEO
4. Click "Analyze page load"

**Target Scores (≥90):**
- [ ] Performance: ≥90
- [ ] Accessibility: ≥90 (ideally 100)
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90

**Screenshots needed:**
- `lighthouse-mobile-overview.png` (all 4 scores visible)
- `lighthouse-mobile-accessibility.png` (accessibility section expanded)

---

### 2. GA4 DebugView Screenshots

**Event 1: `law_dashboard_view`**
1. Visit dashboard in debug mode
2. Open GA4 DebugView
3. Screenshot showing:
   - Event name: `law_dashboard_view`
   - Parameters: `page_title`, `page_path`, `vertical: law`

**Event 2: `law_quick_action`**
1. Click "New Case" button
2. Screenshot showing:
   - Event name: `law_quick_action`
   - Parameters: `action: new_case`, `location: dashboard`, `vertical: law`

**Save as:**
- `ga4-page-view.png`
- `ga4-quick-action.png`

---

### 3. Loom Walkthrough

**Record walkthrough covering:**

**Desktop View (≥1024px):**
1. Page load with all sections
2. KPI cards with hover effects
3. Recent Cases widget - click a case
4. Upcoming Tasks - check/uncheck a task
5. Quick actions inline buttons
6. Keyboard navigation (Tab, Enter, Space)
7. Focus indicators visible

**Mobile View (≤768px):**
1. Responsive layout (stacked columns)
2. FAB in bottom-right
3. Tap on KPI card
4. Tap on Recent Cases item
5. Tap on task checkbox
6. FAB tap to show menu (future functionality)
7. All tap targets easily tappable

**Component Library Demo:**
1. Show theme CSS file (law.theme.css)
2. Show LawCard component code
3. Show LawButton variants
4. Show LawBadge status indicators

**Accessibility Demo:**
1. Full keyboard navigation
2. Visible focus rings
3. Screen reader mode (optional, use VoiceOver on Mac)

**Dark Mode Demo:**
1. Toggle to dark mode
2. Show all components in dark theme
3. Verify readability

**Save Loom URL** and add to PR description.

---

## 🚀 Create Pull Request

Once all evidence is collected:

1. Go to: https://github.com/liamesika/all-in-one/compare/main...feature/law-dashboard-prototype

2. Copy PR description from: `/Users/liamesika/all-in-one/PR_DESCRIPTION.md`

3. Replace placeholders:
   - `LOOM_URL_HERE` → Your Loom video URL
   - Add screenshot paths/links

4. Attach files to PR:
   - `lighthouse-mobile-overview.png`
   - `lighthouse-mobile-accessibility.png`
   - `ga4-page-view.png`
   - `ga4-quick-action.png`

5. Check all UAT checklist boxes in PR description

6. Submit PR for review

---

## 📝 Notes

**Dev Server Running:**
- URL: http://localhost:3001/dashboard/law/dashboard
- Process ID: bbf870

**To stop server:**
```bash
pkill -f "next dev"
```

**Files ready:**
- PR Description: `/Users/liamesika/all-in-one/PR_DESCRIPTION.md`
- Documentation: `/Users/liamesika/all-in-one/LAW-DASHBOARD-PROTOTYPE-SUMMARY.md`

---

## ✅ After Merge

Create next branch:
```bash
git checkout main
git pull origin main
git checkout -b feature/law-cases-crud
```

Next phase: Full CRUD for Cases page with API hooks, forms, optimistic updates, and Playwright tests.
