# Transaction Type (Sale/Rent) Implementation Guide

## Overview

This document tracks the implementation of For Sale / For Rent segmentation across the Real Estate vertical.

## ✅ COMPLETED

### 1. Data Model & Schema
**Status**: ✅ Complete

- Added `TransactionType` enum with `SALE | RENT` values
- Updated `Property` model with:
  - `transactionType` field (default: `SALE`)
  - `rentPriceMonthly` (Int?) for rental properties
  - `rentTerms` (String?) for lease terms
  - Kept `price` field for sale properties
- Database synced via `prisma db push`
- Prisma Client regenerated
- Backward compatible (existing properties default to SALE)

**Files Modified**:
- `packages/server/db/prisma/schema.prisma`

**Commit**: `feat(schema): Add TransactionType enum (SALE/RENT) for property segmentation`

---

## 🚧 IN PROGRESS / TODO

### 2. TypeScript Types & Interfaces
**Status**: ⚠️ Pending

**Tasks**:
- [ ] Update property interfaces to include `transactionType`
- [ ] Add `rentPriceMonthly` and `rentTerms` to type definitions
- [ ] Export `TransactionType` from Prisma client

**Files to Update**:
- Type definitions in components using Property interface

---

### 3. Properties List UI
**Status**: ⚠️ Pending

**Tasks**:
- [ ] Add Transaction Type filter dropdown (All / For Sale / For Rent)
- [ ] Display badge on each property card ("For Sale" / "For Rent")
- [ ] Show correct pricing:
  - SALE: Display `price` and price per sqm
  - RENT: Display `rentPriceMonthly` with "₪X/month"
- [ ] Filter functionality that updates list

**Files to Update**:
- `apps/web/app/dashboard/real-estate/properties/PropertiesClient.tsx`

**UI Components Needed**:
```typescript
// Transaction Type Badge Component
<span className={`px-2 py-1 rounded-lg text-xs ${
  transactionType === 'SALE'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-green-100 text-green-700'
}`}>
  {transactionType === 'SALE' ? 'For Sale' : 'For Rent'}
</span>

// Filter Dropdown
<select onChange={handleTransactionTypeFilter}>
  <option value="ALL">All Properties</option>
  <option value="SALE">For Sale</option>
  <option value="RENT">For Rent</option>
</select>
```

---

### 4. Property Detail Page
**Status**: ⚠️ Pending

**Tasks**:
- [ ] Display transaction type badge near title
- [ ] Conditional rendering based on type:
  - SALE: Show sale price, price/sqm
  - RENT: Show monthly rent, rent terms, hide SALE-specific metrics
- [ ] Update key info section

**Files to Update**:
- `apps/web/app/dashboard/real-estate/properties/[id]/PropertyDetail.tsx`

**Example**:
```typescript
{property.transactionType === 'SALE' ? (
  <>
    <div>Price: ₪{property.price?.toLocaleString()}</div>
    <div>Per Sqm: ₪{(property.price! / property.size!).toLocaleString()}</div>
  </>
) : (
  <>
    <div>Monthly Rent: ₪{property.rentPriceMonthly?.toLocaleString()}/month</div>
    {property.rentTerms && <div>Terms: {property.rentTerms}</div>}
  </>
)}
```

---

### 5. Public Landing Pages
**Status**: ⚠️ Pending

**Tasks**:
- [ ] Display transaction badge
- [ ] Show correct pricing fields (price vs rentPriceMonthly)
- [ ] Update SEO/JSON-LD with proper Offer type
  - SALE: Use regular price
  - RENT: Use `priceSpecification` with `unitCode: "MON"`
- [ ] Contact form should capture transaction interest

**Files to Update**:
- `apps/web/app/(public)/real-estate/[slug]/page.tsx`
- `apps/web/app/(public)/real-estate/[slug]/PublicPropertyLanding.tsx`

**JSON-LD Example for Rent**:
```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "offers": {
    "@type": "Offer",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "5000",
      "priceCurrency": "ILS",
      "unitCode": "MON"
    }
  }
}
```

---

### 6. Ad Generator (Sale vs Rent Copy)
**Status**: ⚠️ Pending

**Tasks**:
- [ ] Include `transactionType` in API request
- [ ] Update system prompt to generate type-specific copy:
  - SALE: Focus on investment, value, price/sqm, comps
  - RENT: Focus on monthly rent, lifestyle, flexibility, commute
- [ ] Ensure clean separation in both EN and HE outputs

**Files to Update**:
- `apps/web/app/api/real-estate/property-ad-generator/route.ts`

**Prompt Updates**:
```typescript
const prompt = `Generate marketing copy for a ${transactionType === 'SALE' ? 'FOR SALE' : 'FOR RENT'} property.

${transactionType === 'SALE'
  ? 'Focus on: Investment potential, property value, price per sqm, comparable sales, appreciation, buyer benefits'
  : 'Focus on: Monthly rent affordability, flexible terms, lifestyle, commute convenience, neighborhood amenities, tenant benefits'
}

Property Details: ...
```

---

### 7. CSV Import with Transaction Type
**Status**: ⚠️ Pending

**Tasks**:
- [ ] Add `transactionType` to system fields mapping
- [ ] Accept values: "SALE", "RENT", "For Sale", "For Rent" → normalize to enum
- [ ] Validate required fields based on type:
  - SALE requires `price`
  - RENT requires `rentPriceMonthly`
- [ ] Show clear error messages for validation failures
- [ ] Update template download with transactionType column

**Files to Update**:
- `apps/web/components/real-estate/ImportPropertiesModal.tsx`

**System Fields Addition**:
```typescript
const SYSTEM_FIELDS = [
  { value: 'name', label: 'Property Name', required: true },
  { value: 'transactionType', label: 'Transaction Type (SALE/RENT)', required: true },
  { value: 'price', label: 'Sale Price', required: false },
  { value: 'rentPriceMonthly', label: 'Monthly Rent', required: false },
  { value: 'rentTerms', label: 'Rent Terms', required: false },
  // ... other fields
];

// Normalization
const normalizeTransactionType = (value: string): 'SALE' | 'RENT' => {
  const normalized = value.toUpperCase().trim();
  if (normalized.includes('RENT')) return 'RENT';
  return 'SALE'; // Default
};

// Validation
if (transactionType === 'SALE' && !price) {
  errors.push('Sale properties require a price');
}
if (transactionType === 'RENT' && !rentPriceMonthly) {
  errors.push('Rental properties require monthly rent');
}
```

---

### 8. Property Scoring (Type-Aware)
**Status**: ⚠️ Pending

**Tasks**:
- [ ] Update scoring algorithm to be type-aware:
  - SALE: Use current price/sqm vs neighborhood median sale prices
  - RENT: Use rent/sqm vs neighborhood median rent prices
- [ ] Update neighborhood median mock data with rent prices
- [ ] Badge tooltip shows type-specific factors
- [ ] Labels: "Sale Score" vs "Rental Score"

**Files to Update**:
- `apps/web/lib/propertyScoring.ts`
- `apps/web/components/real-estate/ScoreBadge.tsx`

**Mock Data Addition**:
```typescript
export const mockNeighborhoodMedians = [
  {
    city: 'Tel Aviv',
    saleMedian: { pricePerSqm: 25000 },
    rentMedian: { pricePerSqm: 40 } // ₪40/sqm/month
  },
  // ... others
];
```

**Scoring Logic**:
```typescript
if (property.transactionType === 'SALE') {
  // Current logic with price/sqm
  const pricePerSqm = property.price / property.size;
  // Compare to saleMedian...
} else if (property.transactionType === 'RENT') {
  // New logic with rent/sqm
  const rentPerSqm = property.rentPriceMonthly / property.size;
  // Compare to rentMedian...
}
```

---

### 9. Comps Widget (Type-Aware)
**Status**: ⚠️ Pending (Feature not yet created)

**Tasks**:
- [ ] Create `/dashboard/real-estate/comps` page
- [ ] Add Transaction Type filter (Sale / Rent toggle)
- [ ] Charts update based on selected type:
  - SALE: Price trends, price/sqm
  - RENT: Monthly rent trends, rent/sqm
- [ ] KPI cards show type-specific metrics
- [ ] PDF export includes transaction type in header
- [ ] PDF uses correct units (₪ for sale, ₪/month for rent)

**Files to Create**:
- `apps/web/app/dashboard/real-estate/comps/page.tsx`
- `apps/web/components/real-estate/CompsWidget.tsx`
- `apps/web/lib/compsUtils.ts`

---

### 10. Leads & AI Analyze
**Status**: ⚠️ Pending

**Tasks**:
- [ ] AI Analyze: Match lead intent (sale vs rent) when recommending properties
- [ ] If lead mentions budget → infer transaction type
- [ ] Allow manual override in UI
- [ ] Recommended properties prefer matching transaction type

**Files to Update**:
- Lead analyze AI route (when created)

**Prompt Enhancement**:
```typescript
const prompt = `Analyze this lead and recommend 3-5 properties.

Lead Info: ${leadData}

Preferences:
${leadBudget > 1000000 ? 'Likely looking to BUY (SALE)' : 'Likely looking to RENT'}
${leadNotes.includes('rent') ? 'Explicitly mentioned RENT' : ''}
${leadNotes.includes('buy') || leadNotes.includes('purchase') ? 'Explicitly mentioned SALE' : ''}

Prioritize properties matching the lead's transaction type preference.
`;
```

---

### 11. WhatsApp Integration
**Status**: ⚠️ Pending

**Tasks**:
- [ ] Include transaction type in prefilled WhatsApp message
- [ ] Format message appropriately:
  - SALE: "I'm interested in purchasing [Property] listed at ₪X"
  - RENT: "I'm interested in renting [Property] at ₪X/month"

**Files to Update**:
- WhatsApp link generation in leads components

**Example**:
```typescript
const whatsappMessage = property.transactionType === 'SALE'
  ? `Hi, I'm interested in purchasing ${property.name} listed at ₪${property.price?.toLocaleString()}.`
  : `Hi, I'm interested in renting ${property.name} at ₪${property.rentPriceMonthly?.toLocaleString()}/month.`;

const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
```

---

### 12. Global Dashboard Header
**Status**: ⚠️ Pending (Feature not yet created)

**Tasks**:
- [ ] Create `DashboardHeader` component with sticky positioning
- [ ] Persistent Effinity logo (links to /)
- [ ] Global Filters including Transaction Type
- [ ] Apply to all `/dashboard/real-estate/*` routes
- [ ] RTL/LTR layout handling

**Files to Create**:
- `apps/web/components/layout/DashboardHeader.tsx`
- `apps/web/components/layout/GlobalFilters.tsx`

**Files to Update**:
- `apps/web/app/dashboard/real-estate/layout.tsx`

---

### 13. Testing
**Status**: ⚠️ Not Started

**Unit Tests Needed**:
```typescript
// Transaction type normalization
test('normalizes transaction type strings', () => {
  expect(normalizeTransactionType('For Sale')).toBe('SALE');
  expect(normalizeTransactionType('RENT')).toBe('RENT');
  expect(normalizeTransactionType('for rent')).toBe('RENT');
});

// Type-aware scoring
test('calculates sale property score', () => {
  const property = { transactionType: 'SALE', price: 2000000, size: 100 };
  const score = calculatePropertyScore(property);
  expect(score.pricing).toBeGreaterThan(0);
});

test('calculates rent property score', () => {
  const property = { transactionType: 'RENT', rentPriceMonthly: 5000, size: 100 };
  const score = calculatePropertyScore(property);
  expect(score.pricing).toBeGreaterThan(0);
});
```

**API Tests Needed**:
```typescript
// Properties API
test('POST creates property with transactionType', async () => {
  const response = await request(app)
    .post('/api/real-estate/properties')
    .send({
      name: 'Test Property',
      transactionType: 'RENT',
      rentPriceMonthly: 5000,
      // ... other fields
    })
    .expect(201);

  expect(response.body.transactionType).toBe('RENT');
  expect(response.body.rentPriceMonthly).toBe(5000);
});

// CSV Import validation
test('validates SALE requires price', async () => {
  const csvData = 'name,transactionType\nTest,SALE';
  const response = await request(app)
    .post('/api/real-estate/properties/import')
    .send({ csv: csvData })
    .expect(400);

  expect(response.body.errors).toContain('Sale properties require a price');
});
```

**E2E Tests Needed**:
```typescript
test('creates FOR SALE property and verifies display', async ({ page }) => {
  await page.goto('/dashboard/real-estate/properties');
  await page.click('text=New Property');
  await page.selectOption('[name="transactionType"]', 'SALE');
  await page.fill('[name="price"]', '2000000');
  await page.click('button:has-text("Save")');

  await expect(page.locator('text=For Sale')).toBeVisible();
  await expect(page.locator('text=₪2,000,000')).toBeVisible();
});

test('creates FOR RENT property and verifies display', async ({ page }) => {
  await page.goto('/dashboard/real-estate/properties');
  await page.click('text=New Property');
  await page.selectOption('[name="transactionType"]', 'RENT');
  await page.fill('[name="rentPriceMonthly"]', '5000');
  await page.click('button:has-text("Save")');

  await expect(page.locator('text=For Rent')).toBeVisible();
  await expect(page.locator('text=₪5,000/month')).toBeVisible();
});

test('filters properties by transaction type', async ({ page }) => {
  await page.goto('/dashboard/real-estate/properties');
  await page.selectOption('[name="transactionTypeFilter"]', 'RENT');

  // All visible properties should be FOR RENT
  const rentBadges = page.locator('text=For Rent');
  expect(await rentBadges.count()).toBeGreaterThan(0);

  const saleBadges = page.locator('text=For Sale');
  expect(await saleBadges.count()).toBe(0);
});
```

---

### 14. Documentation
**Status**: ⚠️ Pending

**Documents to Update**:
- [ ] `IMPLEMENTATION_SUMMARY.md` - Add transaction type section
- [ ] `README_AI.md` - Update with type-aware prompt examples
- [ ] `TESTS.md` - Add transaction type test scenarios
- [ ] Import/export docs - Add transactionType column examples

**New Documents Needed**:
- [ ] `TRANSACTION_TYPE_USER_GUIDE.md` - User-facing guide

---

## Implementation Priority

1. **HIGH PRIORITY** (Core Functionality):
   - Properties List UI (filter + badge + pricing display)
   - Property Detail page updates
   - Public Landing Pages updates
   - CSV Import with transactionType

2. **MEDIUM PRIORITY** (Enhanced Features):
   - Ad Generator type-specific copy
   - Type-aware Scoring
   - Leads AI matching

3. **LOWER PRIORITY** (Nice to Have):
   - Comps Widget (can be separate feature)
   - Global Dashboard Header (broader UX improvement)

---

## Acceptance Criteria

### Properties List
- [x] Schema updated with transactionType
- [ ] Filter dropdown functional (All / Sale / Rent)
- [ ] Badge displays correct type
- [ ] Pricing shows correctly (price vs rent/month)
- [ ] Filter persists across page reloads

### Property Detail
- [ ] Transaction badge visible
- [ ] Conditional rendering works (SALE vs RENT)
- [ ] No SALE fields shown for RENT properties
- [ ] No RENT fields shown for SALE properties

### Landing Pages
- [ ] Transaction badge displayed
- [ ] Correct pricing shown
- [ ] SEO/JSON-LD accurate for type
- [ ] No 404 errors

### CSV Import
- [ ] transactionType column mappable
- [ ] Normalization works ("For Sale" → SALE)
- [ ] Validation catches missing required fields
- [ ] Template includes transactionType

### Testing
- [ ] All unit tests pass
- [ ] All API tests pass
- [ ] All E2E tests pass
- [ ] Coverage >= 80%

---

## Next Steps

1. Update PropertiesClient with filter and badges ← **START HERE**
2. Update PropertyDetail with conditional rendering
3. Update Public Landing Pages
4. Update CSV Import
5. Write tests
6. Deploy and verify

---

**Last Updated**: January 2025
**Status**: Schema Complete, UI Pending
