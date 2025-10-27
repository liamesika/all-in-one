# E2E Testing Setup Guide

## Prerequisites

### 1. Environment Variables

Create or update `/Users/liamesika/all-in-one/apps/web/.env.local`:

```bash
# Firebase Configuration (already present)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# E2E Test Credentials (ADD THESE)
E2E_TEST_USER_EMAIL=test@example.com
E2E_TEST_USER_PASSWORD=your-test-password
```

### 2. Create Test User in Firebase

1. Go to Firebase Console → Authentication
2. Add a new user with email/password
3. Use this user's credentials in the env vars above
4. Ensure this user has access to Real Estate leads in your database

## Running E2E Tests

### Install Playwright Browsers (First Time Only)

```bash
cd apps/web
npx playwright install
```

### Run Tests

```bash
# From repo root

# Run all Real Estate leads tests (desktop + mobile)
pnpm --filter @apps/web exec playwright test e2e/real-estate-leads.spec.ts

# Run only desktop tests
pnpm --filter @apps/web exec playwright test --project=chromium-desktop

# Run only mobile tests
pnpm --filter @apps/web exec playwright test --project=chromium-mobile

# Run specific test
pnpm --filter @apps/web exec playwright test e2e/real-estate-leads.spec.ts --grep "should create"

# Run with UI mode (interactive)
pnpm --filter @apps/web exec playwright test --ui

# Run and show report
pnpm --filter @apps/web exec playwright test
pnpm --filter @apps/web exec playwright show-report
```

## How It Works

### Firebase Authentication

1. **Global Setup** (`e2e/global-setup.ts`):
   - Runs once before all tests
   - Uses Firebase REST API to sign in
   - Creates storage state with auth tokens
   - Saves to `e2e/.auth/storage-state.json`

2. **Storage State Reuse**:
   - All test projects configured to use saved storage state
   - No need to login in each test
   - Fast execution, no UI flakiness

3. **Auth Helper** (`e2e/utils/firebase-auth.ts`):
   - `signInWithFirebase()` - REST API authentication
   - `createStorageState()` - Format for Playwright
   - `setupAuth()` - Complete flow

### Test Structure

```typescript
test.describe('Real Estate Leads - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    // Auth is already set up via storage state
    await page.goto('/dashboard/real-estate/leads');
    await page.waitForLoadState('networkidle');
  });

  test('should create lead', async ({ page }) => {
    // Test implementation
  });
});
```

### Test IDs

All actionable elements have stable `data-testid` attributes:

```typescript
// Buttons
page.getByTestId('create-lead-button')
page.getByTestId('import-leads-button')
page.getByTestId('export-leads-button')

// Inputs
page.getByTestId('search-leads-input')
page.getByTestId('filter-status-select')
page.getByTestId('filter-source-select')

// Table/Cards
page.getByTestId('leads-table')              // Desktop
page.getByTestId('leads-mobile-cards')       // Mobile
page.getByTestId('lead-row-{id}')            // Row
page.getByTestId('lead-card-{id}')           // Card

// Actions
page.getByTestId('view-lead-{id}')
page.getByTestId('edit-lead-{id}')
page.getByTestId('delete-lead-{id}')
page.getByTestId('link-property-{id}')
```

### Fixtures

- `e2e/fixtures/leads.csv` - Test data for CSV import
- `e2e/fixtures/leads-export.expected.csv` - Expected export format

## Troubleshooting

### "Firebase auth failed" Error

**Problem**: Global setup can't authenticate

**Solutions**:
1. Check env vars are set correctly
2. Verify Firebase API key is valid
3. Ensure test user exists in Firebase Auth
4. Check Firebase project allows password auth

**Debug**:
```bash
# Run global setup manually
cd apps/web
npx ts-node e2e/global-setup.ts
```

### "Storage state not found" Error

**Problem**: Global setup didn't create storage state

**Solution**:
```bash
# Delete and regenerate
rm -rf e2e/.auth/storage-state.json
pnpm --filter @apps/web exec playwright test
```

### Tests Fail with "Authentication required"

**Problem**: Storage state is expired or invalid

**Solutions**:
1. Delete storage state and re-run
2. Check test user still exists in Firebase
3. Verify API keys haven't changed

### Port 3001 Already in Use

**Problem**: Dev server conflict

**Solution**:
```bash
# Kill existing server
lsof -ti:3001 | xargs kill -9

# Or use different port in playwright.config.ts
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: cd apps/web && npx playwright install --with-deps

      - name: Build application
        run: pnpm --filter @apps/web build

      - name: Run E2E tests
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          E2E_TEST_USER_EMAIL: ${{ secrets.E2E_TEST_USER_EMAIL }}
          E2E_TEST_USER_PASSWORD: ${{ secrets.E2E_TEST_USER_PASSWORD }}
        run: |
          pnpm --filter @apps/web start -p 3001 &
          sleep 10
          pnpm --filter @apps/web exec playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

### Environment Secrets

Add to GitHub repository secrets:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `E2E_TEST_USER_EMAIL`
- `E2E_TEST_USER_PASSWORD`

## Test Coverage

### ✅ Implemented Tests

**Desktop (1280×720)**:
- Display leads management page with all UI elements
- Create new lead → verify appears in table
- Edit lead (name + qualificationStatus) → verify persists
- Search leads by fullName → verify correct results
- Filter by status (NEW, CONTACTED, etc.)
- Filter by source (Website, Facebook, etc.)
- Export leads to CSV → verify file downloads
- Import leads from CSV → verify rows added
- Add note to lead via Edit modal
- Delete lead → verify removed

**Mobile (iPhone 12)**:
- Display mobile card view (not table)
- Create lead on mobile
- Search leads on mobile
- Verify touch targets ≥44px

**Accessibility**:
- ARIA attributes on modals
- Close modal with Escape key
- Accessible button labels

**Performance**:
- Load leads page within acceptable time (<5s)
- No horizontal scroll on mobile

### 📋 Additional Tests to Add

- **Qualify Lead Modal**: AI insights, property recommendations
- **Link Property Modal**: Search, link/unlink operations
- **Bulk Actions**: Select multiple leads, bulk export
- **Agent Assignment**: Assign lead to agent, verify display
- **Status Transitions**: NEW → CONTACTED → IN_PROGRESS
- **Error States**: Invalid data, API failures
- **Empty States**: No leads scenario
- **Pagination**: If implemented

## Performance Tips

### Parallel Execution

Tests run in parallel by default. Adjust workers in `playwright.config.ts`:

```typescript
workers: process.env.CI ? 1 : 4,  // 4 parallel workers locally
```

### Test Isolation

Each test gets a fresh browser context but shares storage state:
- Fast (no re-authentication)
- Isolated (no shared state between tests)
- Reliable (consistent starting point)

### Debugging

```bash
# Run in debug mode
pnpm --filter @apps/web exec playwright test --debug

# Run headed (see browser)
pnpm --filter @apps/web exec playwright test --headed

# Trace viewer (after failure)
pnpm --filter @apps/web exec playwright show-trace trace.zip
```

## Next Steps

1. **Set up environment variables** with test user credentials
2. **Run first test** to verify setup: `pnpm --filter @apps/web exec playwright test --grep "should display"`
3. **Add more tests** for remaining scenarios (Qualify, Link Property, etc.)
4. **Integrate with CI/CD** using the GitHub Actions example
5. **Add visual regression** testing with Playwright screenshots

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Firebase REST API](https://firebase.google.com/docs/reference/rest/auth)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
