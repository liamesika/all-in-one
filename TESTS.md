# Testing Documentation

## Overview

This document outlines the testing strategy and procedures for the All-in-One Real Estate platform.

## Test Types

### 1. Unit Tests
### 2. API Tests
### 3. E2E Tests

---

## Unit Tests

**Framework**: Jest + React Testing Library
**Location**: `__tests__/unit/`

### Language Detection Utility

**File**: `apps/web/lib/__tests__/languageDetection.test.ts`

```typescript
describe('languageDetection', () => {
  test('detects Hebrew when ≥70% Hebrew characters', () => {
    const result = detectLanguage('שלום עולם');
    expect(result.language).toBe('he');
    expect(result.hebrewRatio).toBeGreaterThanOrEqual(0.7);
  });

  test('detects English when <70% Hebrew characters', () => {
    const result = detectLanguage('Hello world');
    expect(result.language).toBe('en');
    expect(result.hebrewRatio).toBeLessThan(0.7);
  });

  test('handles mixed text correctly', () => {
    const result = detectLanguage('Hello שלום');
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('respects forceLocale override', () => {
    const locale = determineConversationLanguage('Hello', 'he', 'en');
    expect(locale).toBe('en');
  });
});
```

### Property Scoring Utility

**File**: `apps/web/lib/__tests__/propertyScoring.test.ts`

```typescript
describe('propertyScoring', () => {
  test('base score is 50', () => {
    const breakdown = calculatePropertyScore({});
    expect(breakdown.base).toBe(50);
    expect(breakdown.total).toBe(50);
  });

  test('awards pricing points for below-market properties', () => {
    const property = {
      price: 2000000,
      size: 100,
      city: 'Tel Aviv'
    };
    const breakdown = calculatePropertyScore(property, mockNeighborhoodMedians);
    expect(breakdown.pricing).toBeGreaterThan(0);
  });

  test('awards market time points for new listings', () => {
    const property = {
      publishedAt: new Date().toISOString()
    };
    const breakdown = calculatePropertyScore(property);
    expect(breakdown.marketTime).toBe(15);
  });

  test('awards photo points correctly', () => {
    const property = { images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'] };
    const breakdown = calculatePropertyScore(property);
    expect(breakdown.photos).toBe(10);
  });

  test('scores description quality', () => {
    const property = {
      description: 'Modern spacious luxury apartment with stunning views and parking'
    };
    const breakdown = calculatePropertyScore(property);
    expect(breakdown.description).toBeGreaterThan(0);
  });

  test('returns correct badge color', () => {
    expect(getScoreBadgeColor(85).bg).toBe('bg-green-100');
    expect(getScoreBadgeColor(70).bg).toBe('bg-blue-100');
    expect(getScoreBadgeColor(55).bg).toBe('bg-yellow-100');
    expect(getScoreBadgeColor(40).bg).toBe('bg-red-100');
  });
});
```

### Comps Data Transforms

**File**: `apps/web/lib/__tests__/compsUtils.test.ts`

```typescript
describe('compsUtils', () => {
  test('aggregates property data by month', () => {
    const properties = [
      { price: 1000000, publishedAt: '2024-01-15', size: 50 },
      { price: 2000000, publishedAt: '2024-01-20', size: 100 },
    ];
    const result = aggregateByMonth(properties);
    expect(result['2024-01']).toBeDefined();
    expect(result['2024-01'].average).toBe(1500000);
  });

  test('calculates price per sqm correctly', () => {
    const properties = [
      { price: 1000000, size: 50 },
      { price: 2000000, size: 100 },
    ];
    const result = calculatePricePerSqm(properties);
    expect(result[0].pricePerSqm).toBe(20000);
    expect(result[1].pricePerSqm).toBe(20000);
  });

  test('filters properties by date range', () => {
    const properties = [
      { publishedAt: '2024-01-01' },
      { publishedAt: '2024-06-01' },
      { publishedAt: '2024-12-01' },
    ];
    const filtered = filterByDateRange(properties, '6m');
    expect(filtered.length).toBeLessThan(properties.length);
  });
});
```

**Run Unit Tests**:
```bash
npm run test:unit
# or
yarn test:unit
```

---

## API Tests

**Framework**: Jest + Supertest
**Location**: `__tests__/api/`

### Leads API

**File**: `__tests__/api/leads.test.ts`

```typescript
describe('/api/real-estate/leads', () => {
  test('POST creates new lead with valid data', async () => {
    const response = await request(app)
      .post('/api/real-estate/leads')
      .send({
        name: 'Test User',
        phone: '+972501234567',
        email: 'test@example.com',
        source: 'Website'
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test User');
  });

  test('POST validates required fields', async () => {
    const response = await request(app)
      .post('/api/real-estate/leads')
      .send({ email: 'test@example.com' })
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  test('POST deduplicates by (ownerUid, phone)', async () => {
    const leadData = {
      name: 'Test User',
      phone: '+972501234567',
      email: 'test@example.com'
    };

    await request(app).post('/api/real-estate/leads').send(leadData);
    const response = await request(app)
      .post('/api/real-estate/leads')
      .send(leadData)
      .expect(409);

    expect(response.body.error).toContain('duplicate');
  });

  test('PUT updates lead', async () => {
    const lead = await createTestLead();
    const response = await request(app)
      .put(`/api/real-estate/leads/${lead.id}`)
      .send({ name: 'Updated Name' })
      .expect(200);

    expect(response.body.name).toBe('Updated Name');
  });

  test('POST /analyze returns insights and recommendations', async () => {
    const lead = await createTestLead();
    const response = await request(app)
      .post('/api/real-estate/leads/analyze')
      .send({
        leadId: lead.id,
        notes: '3 rooms in Tel Aviv, budget 2.5M'
      })
      .expect(200);

    expect(response.body.insights).toBeDefined();
    expect(response.body.recommendations).toHaveLength(3);
  });
});
```

### Properties API

**File**: `__tests__/api/properties.test.ts`

```typescript
describe('/api/real-estate/properties', () => {
  test('PUT assigns agent to property', async () => {
    const property = await createTestProperty();
    const response = await request(app)
      .put(`/api/real-estate/properties/${property.id}`)
      .send({ assignedAgentId: 'agent_123' })
      .expect(200);

    expect(response.body.assignedAgentId).toBe('agent_123');
  });

  test('POST imports properties from CSV', async () => {
    const csvData = 'name,address,city,price\nTest Property,Test St,Tel Aviv,1000000';
    const response = await request(app)
      .post('/api/real-estate/properties/import')
      .send({ csv: csvData, mappings: {...} })
      .expect(200);

    expect(response.body.imported).toBeGreaterThan(0);
  });

  test('POST /property-ad-generator creates bilingual ads', async () => {
    const property = await createTestProperty();
    const response = await request(app)
      .post('/api/real-estate/property-ad-generator')
      .send({ propertyId: property.id })
      .expect(200);

    expect(response.body.en).toBeDefined();
    expect(response.body.he).toBeDefined();
    expect(response.body.en.title).toBeTruthy();
    expect(response.body.he.title).toBeTruthy();
  });
});
```

### Comps API

**File**: `__tests__/api/comps.test.ts`

```typescript
describe('/api/real-estate/comps', () => {
  test('GET returns comps data with filters', async () => {
    const response = await request(app)
      .get('/api/real-estate/comps')
      .query({ neighborhood: 'Florentin', range: '6m' })
      .expect(200);

    expect(response.body.kpis).toBeDefined();
    expect(response.body.chartData).toBeDefined();
    expect(response.body.properties).toBeInstanceOf(Array);
  });

  test('GET validates neighborhood parameter', async () => {
    const response = await request(app)
      .get('/api/real-estate/comps')
      .query({ neighborhood: '', range: '6m' })
      .expect(400);

    expect(response.body.error).toBeDefined();
  });
});
```

**Run API Tests**:
```bash
npm run test:api
# or
yarn test:api
```

---

## E2E Tests

**Framework**: Playwright
**Location**: `__tests__/e2e/`

### Properties Flow

**File**: `__tests__/e2e/properties.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Properties Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('creates new property', async ({ page }) => {
    await page.goto('/dashboard/real-estate/properties');
    await page.click('text=New Property');

    await page.fill('[name="name"]', 'Test Property E2E');
    await page.fill('[name="address"]', 'Test Street 123');
    await page.fill('[name="city"]', 'Tel Aviv');
    await page.fill('[name="price"]', '1500000');
    await page.fill('[name="rooms"]', '3');
    await page.fill('[name="size"]', '85');

    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Test Property E2E')).toBeVisible();
  });

  test('uploads CSV and imports properties', async ({ page }) => {
    await page.goto('/dashboard/real-estate/properties');
    await page.click('text=Import CSV');

    const csvContent = 'name,address,city,price,rooms,size\nImport Test,Test St,Tel Aviv,1000000,2,60';
    await page.setInputFiles('input[type="file"]', {
      name: 'properties.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });

    await page.click('text=Import Properties');
    await expect(page.locator('text=Import Complete')).toBeVisible();
  });

  test('copies landing page URL', async ({ page }) => {
    await page.goto('/dashboard/real-estate/properties/luxury-penthouse-tel-aviv');
    await page.click('[title="Copy link"]');

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/real-estate/luxury-penthouse-tel-aviv');
  });

  test('assigns agent to property', async ({ page }) => {
    await page.goto('/dashboard/real-estate/properties');
    await page.click('text=View >> first');
    await page.click('text=Assign Agent');

    await page.click('text=David Cohen');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=David Cohen')).toBeVisible();
  });
});
```

### Leads Flow

**File**: `__tests__/e2e/leads.spec.ts`

```typescript
test.describe('Leads Management', () => {
  test('imports leads from CSV', async ({ page }) => {
    await page.goto('/dashboard/real-estate/leads');
    await page.click('text=Import CSV');

    const csvContent = 'name,phone,email,source\nTest Lead,+972501234567,test@example.com,Website';
    await page.setInputFiles('input[type="file"]', {
      name: 'leads.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });

    await page.click('text=Import');
    await expect(page.locator('text=Import Complete')).toBeVisible();
  });

  test('views lead details', async ({ page }) => {
    await page.goto('/dashboard/real-estate/leads');
    await page.click('[data-testid="view-lead"] >> first');

    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Lead Details')).toBeVisible();
  });

  test('edits lead and updates list', async ({ page }) => {
    await page.goto('/dashboard/real-estate/leads');
    await page.click('[data-testid="edit-lead"] >> first');

    await page.fill('[name="name"]', 'Updated Lead Name');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Updated Lead Name')).toBeVisible();
  });

  test('links property to lead', async ({ page }) => {
    await page.goto('/dashboard/real-estate/leads');
    await page.click('[data-testid="link-property"] >> first');

    await page.fill('[placeholder="Search properties"]', 'Luxury Penthouse');
    await page.click('text=Luxury Penthouse - Tel Aviv');
    await page.click('button:has-text("Link")');

    await expect(page.locator('text=Linked to')).toBeVisible();
  });

  test('analyzes lead with AI', async ({ page }) => {
    await page.goto('/dashboard/real-estate/leads');
    await page.click('[data-testid="analyze-lead"] >> first');

    await page.fill('[name="notes"]', '3 rooms, budget 2M');
    await page.click('button:has-text("Analyze")');

    await expect(page.locator('text=Recommended Properties')).toBeVisible();
    await expect(page.locator('[data-testid="recommendation"]')).toHaveCount(3);
  });

  test('opens WhatsApp with prefilled message', async ({ page }) => {
    await page.goto('/dashboard/real-estate/leads');

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="whatsapp-lead"] >> first')
    ]);

    expect(popup.url()).toContain('wa.me');
    expect(popup.url()).toContain('text=');
  });

  test('exports leads to CSV', async ({ page }) => {
    await page.goto('/dashboard/real-estate/leads');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Export CSV')
    ]);

    expect(download.suggestedFilename()).toBe('leads_export.csv');
  });
});
```

### Comps Flow

**File**: `__tests__/e2e/comps.spec.ts`

```typescript
test.describe('Comps Widget', () => {
  test('loads and displays charts', async ({ page }) => {
    await page.goto('/dashboard/real-estate/comps');

    await expect(page.locator('canvas')).toHaveCount(2); // Line + Bar charts
    await expect(page.locator('text=Average Price')).toBeVisible();
    await expect(page.locator('text=Median Price')).toBeVisible();
  });

  test('filters by neighborhood', async ({ page }) => {
    await page.goto('/dashboard/real-estate/comps');

    await page.selectOption('[name="neighborhood"]', 'Florentin');
    await page.waitForTimeout(500); // Wait for data refresh

    await expect(page.locator('text=Florentin')).toBeVisible();
  });

  test('changes date range and updates data', async ({ page }) => {
    await page.goto('/dashboard/real-estate/comps');

    await page.click('text=6 months');
    await page.waitForTimeout(500);

    // Verify KPIs updated
    const avgPrice = await page.locator('[data-testid="avg-price"]').textContent();
    expect(avgPrice).toBeTruthy();
  });

  test('downloads PDF with current filters', async ({ page }) => {
    await page.goto('/dashboard/real-estate/comps');

    await page.selectOption('[name="neighborhood"]', 'Florentin');
    await page.click('text=6 months');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Download PDF')
    ]);

    expect(download.suggestedFilename()).toContain('comps');
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
```

**Run E2E Tests**:
```bash
# Start dev server first
npm run dev

# In another terminal
npx playwright test

# With UI
npx playwright test --ui

# Specific test file
npx playwright test __tests__/e2e/properties.spec.ts
```

---

## Test Commands

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest __tests__/unit",
    "test:api": "jest __tests__/api",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:all": "npm run test:unit && npm run test:api && npm run test:e2e"
  }
}
```

---

## CI/CD Integration

**GitHub Actions**: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit

  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:api

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run dev & npx wait-on http://localhost:3000
      - run: npm run test:e2e
```

---

## Coverage Requirements

**Minimum Coverage**:
- Unit Tests: 80% coverage
- API Tests: 90% coverage for critical endpoints
- E2E Tests: All critical user flows

**Generate Coverage Report**:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## Test Data

**Fixtures**: `__tests__/fixtures/`

```typescript
// properties.fixtures.ts
export const mockProperty = {
  id: '1',
  name: 'Test Property',
  address: 'Test Street 123',
  city: 'Tel Aviv',
  price: 1500000,
  rooms: 3,
  size: 85,
  status: 'LISTED'
};

// leads.fixtures.ts
export const mockLead = {
  id: '1',
  name: 'Test Lead',
  phone: '+972501234567',
  email: 'test@example.com',
  source: 'Website',
  status: 'NEW'
};
```

---

## Debugging Tests

**Jest Debug**:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

**Playwright Debug**:
```bash
npx playwright test --debug
```

**VS Code Launch Config**:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

---

## Best Practices

1. **Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear test descriptions
3. **Arrange-Act-Assert**: Structure tests consistently
4. **Mock External Services**: Don't call real APIs in tests
5. **Clean Up**: Reset database/state after each test
6. **Fast Execution**: Keep tests fast (<1s per unit test)
7. **Flake-Free**: Avoid timing-dependent assertions

---

**Last Updated**: January 2025
**Maintainer**: Development Team
