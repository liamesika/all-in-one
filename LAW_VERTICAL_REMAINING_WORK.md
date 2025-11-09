# Law Vertical - Remaining Implementation Guide

## Status: 7/10 Requirements Complete ✅

**Completed & Deployed** (Commits: `37ba926`, `f0ec61f`):
1. ✅ Mobile Drawer Sidebar (swipe, Esc, focus trap, ARIA)
2. ✅ Shared Card Component (`components/law/Card.tsx`)
3. ✅ View All Button Improvements (aria-label, title, min-h-[44px])
4. ✅ Centralized Auth Flow (`lib/withAuthFetch.ts`)
5. ✅ Shared Modal Component (focus trap, Esc, click-outside)
6. ✅ Empty State & Skeleton Components
7. ✅ Console Cleanliness (fixed icon imports)

**Infrastructure Ready** (Commit: `f0ec61f`):
- DirProvider for RTL/LTR support
- useLongPress hook for mobile interactions
- Calendar navigation utilities with full test coverage
- Vitest testing framework configured

---

## Remaining Work (3 requirements)

### 1. Calendar Quality Pass

**Files to Modify:**
- `apps/web/app/dashboard/law/calendar/CalendarPageClient.tsx`

**Implementation Steps:**

#### A. Add State for Keyboard Navigation
```typescript
const [focusedDay, setFocusedDay] = useState<Date | null>(null);
const [newEventId, setNewEventId] = useState<string | null>(null);
const calendarGridRef = useRef<HTMLDivElement>(null);
```

#### B. Implement Long-Press for Mobile
```typescript
import { useLongPress } from '@/hooks/useLongPress';

// In the day cell rendering:
const longPressHandlers = useLongPress({
  threshold: 500,
  moveTolerance: 10,
  onLongPress: () => {
    setSelectedDate(date);
    setShowCreateModal(true);
  },
});
```

#### C. Add Keyboard Navigation
```typescript
const handleKeyDown = (e: React.KeyboardEvent, date: Date) => {
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      setFocusedDay(moveToPreviousDay(date));
      break;
    case 'ArrowRight':
      e.preventDefault();
      setFocusedDay(moveToNextDay(date));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setFocusedDay(moveToPreviousWeek(date));
      break;
    case 'ArrowDown':
      e.preventDefault();
      setFocusedDay(moveToNextWeek(date));
      break;
    case 'Home':
      e.preventDefault();
      setFocusedDay(moveToWeekStart(date));
      break;
    case 'End':
      e.preventDefault();
      setFocusedDay(moveToWeekEnd(date));
      break;
    case 'PageUp':
      e.preventDefault();
      setFocusedDay(moveToPreviousMonth(date));
      setCurrentDate(moveToPreviousMonth(currentDate));
      break;
    case 'PageDown':
      e.preventDefault();
      setFocusedDay(moveToNextMonth(date));
      setCurrentDate(moveToNextMonth(currentDate));
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      setSelectedDate(date);
      setShowCreateModal(true);
      break;
  }
};
```

#### D. Update Day Cell Rendering
```tsx
<div
  role="gridcell"
  tabIndex={isSameDay(focusedDay, date) ? 0 : -1}
  aria-selected={isSameDay(focusedDay, date)}
  onClick={() => {
    setSelectedDate(date);
    setShowCreateModal(true);
  }}
  onKeyDown={(e) => handleKeyDown(e, date)}
  {...longPressHandlers}
  className={`min-h-[100px] p-2 border rounded-lg transition-all ${
    date
      ? 'bg-[#1e3a5f]/20 cursor-pointer hover:bg-[#2a4a7a]/30 focus:ring-2 focus:ring-amber-500'
      : 'bg-[#0f1a2c]'
  } ${isSameDay(focusedDay, date) ? 'ring-2 ring-amber-400' : ''}`}
>
  {/* Day number */}
  {date && (
    <>
      <span className="text-sm font-medium text-white">{date.getDate()}</span>

      {/* Events for this day */}
      {dayEvents.length > 0 ? (
        <div className="mt-2 space-y-1">
          {dayEvents.map(event => (
            <div key={event.id} className="text-xs truncate">
              {event.title}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 text-white/40 text-xs hidden sm:block">
          No events yet — click to add
        </div>
      )}
    </>
  )}
</div>
```

#### E. Scroll to New Event After Creation
```typescript
const handleEventCreated = async (eventId: string) => {
  setNewEventId(eventId);
  await fetchEvents(); // Refetch to get new event

  // Wait for DOM update
  setTimeout(() => {
    const eventElement = document.querySelector(`[data-event-id="${eventId}"]`);
    if (eventElement) {
      const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
      eventElement.scrollIntoView({ block: 'nearest', behavior });

      // Temporarily highlight
      eventElement.classList.add('ring-2', 'ring-amber-400/80', 'animate-pulse');
      setTimeout(() => {
        eventElement.classList.remove('ring-2', 'ring-amber-400/80', 'animate-pulse');
        setNewEventId(null);
      }, 800);
    }
  }, 100);
};
```

#### F. Focus Management
```typescript
// Focus first day of month when calendar loads
useEffect(() => {
  if (!focusedDay) {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    setFocusedDay(firstDay);
  }
}, [currentDate]);

// Update focus when focused day changes
useEffect(() => {
  if (focusedDay && calendarGridRef.current) {
    const dayElement = calendarGridRef.current.querySelector(
      `[data-date="${focusedDay.toISOString().split('T')[0]}"]`
    );
    if (dayElement instanceof HTMLElement) {
      dayElement.focus();
    }
  }
}, [focusedDay]);
```

---

### 2. RTL/LTR Full Conversion

**Files to Update:**
All Law vertical components need directional utilities converted from `ml-*/mr-*/pl-*/pr-*` to `ms-*/me-*/ps-*/pe-*`.

#### Files List:
1. `apps/web/app/dashboard/law/dashboard/DashboardPageClient.tsx`
2. `apps/web/app/dashboard/law/clients/ClientsPageClient.tsx`
3. `apps/web/app/dashboard/law/cases/CasesPageClient.tsx`
4. `apps/web/app/dashboard/law/tasks/TasksPageClient.tsx`
5. `apps/web/app/dashboard/law/calendar/CalendarPageClient.tsx`
6. `apps/web/app/dashboard/law/billing/BillingPageClient.tsx`
7. `apps/web/components/dashboard/LawSidebar.tsx`
8. `apps/web/components/dashboard/MobileLawDrawer.tsx`

#### Conversion Pattern:
```bash
# Find all instances (example for one file):
grep -n "ml-\|mr-\|pl-\|pr-" apps/web/app/dashboard/law/dashboard/DashboardPageClient.tsx

# Replace pattern:
ml-4 → ms-4    # margin-left → margin-inline-start
mr-4 → me-4    # margin-right → margin-inline-end
pl-4 → ps-4    # padding-left → padding-inline-start
pr-4 → pe-4    # padding-right → padding-inline-end
```

#### Add Tailwind Plugin (if needed):
```typescript
// tailwind.config.ts
module.exports = {
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.ms-auto': { 'margin-inline-start': 'auto' },
        '.me-auto': { 'margin-inline-end': 'auto' },
        // Add more as needed
      };
      addUtilities(newUtilities);
    },
  ],
};
```

#### Icon Mirroring:
Add `icon-mirror` class to directional icons:
- ChevronLeft, ChevronRight in pagination
- Calendar prev/next month buttons
- Breadcrumb arrows

Example:
```tsx
<ChevronLeft className="w-5 h-5 icon-mirror" />
<ChevronRight className="w-5 h-5 icon-mirror" />
```

#### Locale-Aware Formatting:
```typescript
// Dates
const formattedDate = new Date(event.eventDate).toLocaleDateString(
  lang === 'he' ? 'he-IL' : 'en-US',
  { year: 'numeric', month: 'long', day: 'numeric' }
);

// Numbers
const formattedAmount = new Intl.NumberFormat(
  lang === 'he' ? 'he-IL' : 'en-US',
  { style: 'currency', currency: 'ILS' }
).format(invoice.amount);
```

---

### 3. E2E & Unit Tests

#### A. Install Playwright
```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

#### B. Create Playwright Config
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### C. E2E Test Examples

**Test: Create Client**
```typescript
// e2e/law/clients.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Law Clients', () => {
  test.beforeEach(async ({ page }) => {
    // Login (assuming you have auth helper)
    await loginAsTestUser(page);
    await page.goto('/dashboard/law/clients');
  });

  test('should create new client', async ({ page }) => {
    // Click "New Client" button
    await page.click('button:has-text("New Client")');

    // Fill form
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phone"]', '+1234567890');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for toast
    await expect(page.locator('.toast:has-text("Client created")')).toBeVisible();

    // Verify in table
    await expect(page.locator('table >> text=John Doe')).toBeVisible();
  });
});
```

**Test: Calendar Keyboard Navigation**
```typescript
// e2e/law/calendar.spec.ts
test('should navigate with arrow keys and create event', async ({ page }) => {
  await page.goto('/dashboard/law/calendar');

  // Focus first day
  const firstDay = page.locator('[role="gridcell"]').first();
  await firstDay.focus();

  // Navigate with arrows
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');

  // Open modal with Enter
  await page.keyboard.press('Enter');
  await expect(page.locator('h2:has-text("Create Event")')).toBeVisible();

  // Fill and submit
  await page.fill('input[name="title"]', 'Team Meeting');
  await page.click('button[type="submit"]');

  // Verify event appears and is scrolled into view
  const event = page.locator('[data-event-id]', { hasText: 'Team Meeting' });
  await expect(event).toBeVisible();
  await expect(event).toHaveClass(/ring-2/);
});
```

**Test: Auth Guard**
```typescript
test('should redirect to login when not authenticated', async ({ page, context }) => {
  // Clear cookies
  await context.clearCookies();

  // Try to access protected route
  await page.goto('/dashboard/law/clients');

  // Should redirect with returnUrl
  await expect(page).toHaveURL(/\/login\?returnUrl=/);
});
```

#### D. Unit Test for withAuthFetch
```typescript
// lib/withAuthFetch.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAuthFetch, authPost } from './withAuthFetch';
import { auth } from '@/lib/firebase';

vi.mock('@/lib/firebase');
vi.mock('sonner');

describe('withAuthFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should inject auth token', async () => {
    const mockToken = 'mock-token-123';
    auth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue(mockToken),
    } as any;

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });

    await withAuthFetch('/api/test');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
        }),
      })
    );
  });

  it('should retry on 401', async () => {
    const mockToken = 'refreshed-token';
    auth.currentUser = {
      getIdToken: vi.fn()
        .mockResolvedValueOnce('old-token')
        .mockResolvedValueOnce(mockToken),
    } as any;

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({ status: 200, ok: true, json: () => ({}) });

    await withAuthFetch('/api/test');

    expect(auth.currentUser.getIdToken).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should redirect on persistent 401', async () => {
    auth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue('token'),
    } as any;

    global.fetch = vi.fn().mockResolvedValue({ status: 401, ok: false });

    delete window.location;
    window.location = { href: '' } as any;

    await expect(withAuthFetch('/api/test')).rejects.toThrow('Authentication failed');

    expect(window.location.href).toContain('/login?returnUrl=');
  });
});
```

#### E. Add Scripts to package.json
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:report": "playwright show-report"
  }
}
```

#### F. GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Final Polish Checklist

### Aria-Live Regions
Add to layout or create a toast provider:
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {/* Toast messages will be announced */}
</div>
```

### Touch Targets
Verify all buttons meet `min-h-[44px]`:
```bash
# Find buttons without min-h-[44px]
grep -r "button.*className" apps/web/app/dashboard/law/ | grep -v "min-h-\[44px\]"
```

### Remove Inline Styles
```bash
# Find any remaining inline styles
grep -r "style=" apps/web/app/dashboard/law/
```

### Lint & Typecheck
```bash
pnpm lint --fix
pnpm type-check
```

---

## Deployment Checklist

1. **Build Test**
   ```bash
   SKIP_ENV_VALIDATION=true pnpm --filter web build
   ```

2. **Unit Tests**
   ```bash
   pnpm test
   ```

3. **E2E Tests**
   ```bash
   pnpm e2e
   ```

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat(law): calendar interactions, rtl conversion, e2e tests, final polish"
   git push origin main
   ```

5. **Deploy to Production**
   ```bash
   SKIP_ENV_VALIDATION=true vercel --prod --yes
   ```

---

## Estimated Time Breakdown

| Task | Estimated Time |
|------|----------------|
| Calendar Quality Pass | 2-3 hours |
| RTL Conversion (all files) | 1-2 hours |
| E2E Tests (6 flows) | 2-3 hours |
| Unit Tests (withAuthFetch) | 30 min |
| Final Polish | 1 hour |
| **Total** | **6-9 hours** |

---

## Success Criteria

- [ ] Calendar supports long-press, arrow keys, and scrolls to new events
- [ ] All Law components use logical CSS properties (ms-*/me-*)
- [ ] Icons mirror correctly in RTL mode
- [ ] All E2E tests pass (clients, cases, tasks, calendar, billing, auth)
- [ ] All unit tests pass
- [ ] Zero console warnings in Law vertical
- [ ] Build completes without errors
- [ ] Accessibility score >95 on Lighthouse
- [ ] Works flawlessly in Hebrew (RTL) and English (LTR)
