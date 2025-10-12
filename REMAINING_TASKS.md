# Remaining Tasks for Real Estate Phase 2

## ✅ Completed So Far (4/8 Major Items)

1. ✅ **Properties Route Fix & Deployment** - Pushed to production
2. ✅ **Media Upload** - Firebase Storage with drag & drop
3. ✅ **Property CRUD** - Create/Edit modal with validation
4. ✅ **Leads Page - Complete** - Import/Export, Filters, Bulk Actions

---

## 🚧 Remaining Priority Tasks

### 1. Landing Page Persistence (HIGH PRIORITY)

**Files to Create:**
```
packages/server/db/prisma/schema.prisma - Add LandingPage model
```

**Model Schema:**
```prisma
model LandingPage {
  id         String   @id @default(uuid())
  propertyId String
  ownerUid   String
  url        String
  html       String?  @db.Text
  createdAt  DateTime @default(now())

  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([ownerUid])
  @@index([propertyId])
}
```

**Files to Modify:**
- `app/api/real-estate/property-ad-generator/route.ts`
  - After generating landing page, save to database
  - Return landingPage ID and URL

**UI Updates:**
- `apps/web/app/dashboard/real-estate/properties/[id]/PropertyDetail.tsx`
  - Add "Landing Pages" section
  - List all landing pages for property
  - Copy URL button for each

**Acceptance:**
- Each generated landing page is persisted
- Property detail page shows all landing pages
- URLs are copyable

---

### 2. Property Imports (CSV/Google Sheets)

**Files to Create:**
```
app/api/real-estate/properties/import/route.ts
components/real-estate/properties/ImportPropertiesModal.tsx
```

**CSV Schema:**
```csv
title,address,city,price,rooms,sizeSqm,status,images
Luxury Apt,Tel Aviv,Tel Aviv,2150000,3,95,LISTED,https://img1.jpg|https://img2.jpg
```

**Features:**
- Same UX as ImportLeadsModal
- Column mapping
- Preview table
- Image URLs pipe-separated
- Validation (price > 0, required fields)
- Deduplication by (ownerUid, address, city)

**Google Sheets (Optional):**
- Accept Sheet URL or ID
- Use Google Sheets API or web scraping
- If not ready, add placeholder in UI

---

### 3. Property Scoring System

**Algorithm:**
```javascript
function calculatePropertyScore(property) {
  let score = 50; // base

  // Price per sqm (up to 25 pts)
  const pricePerSqm = property.price / property.size;
  const neighborhoodMedian = getNeighborhoodMedian(property.city);
  if (pricePerSqm < neighborhoodMedian) {
    score += 25 * ((neighborhoodMedian - pricePerSqm) / neighborhoodMedian);
  }

  // Days on market (up to 15 pts)
  const daysOnMarket = (Date.now() - property.createdAt) / 86400000;
  if (daysOnMarket < 30) {
    score += 15 * (1 - daysOnMarket / 30);
  }

  // Photo completeness (up to 10 pts)
  const imageCount = property.images?.length || 0;
  score += Math.min(10, (imageCount / 5) * 10);

  // Description quality (up to 10 pts)
  const descLength = property.description?.length || 0;
  score += Math.min(10, (descLength / 500) * 10);

  return Math.round(Math.max(0, Math.min(100, score)));
}
```

**Files to Modify:**
- `app/api/real-estate/properties/route.ts` - Add score calculation
- `components/real-estate/properties/PropertiesClient.tsx` - Show score badge

**UI:**
- Score badge 0-100 with color coding:
  - 80-100: Green
  - 60-79: Yellow
  - 0-59: Red
- Tooltip with breakdown

---

### 4. Assign Agent to Properties

**Only for Company accounts** (orgMode === 'COMPANY')

**DB Changes:**
```prisma
model Property {
  // ... existing fields
  assignedAgentId String?
  assignedAgent   User?   @relation(fields: [assignedAgentId], references: [uid])
}
```

**Files to Create:**
```
components/real-estate/properties/AssignAgentModal.tsx
```

**Features:**
- Get list of users in same organization
- Dropdown to assign/unassign
- Filter properties by assigned agent
- Show agent badge on property card

---

### 5. Comps Widget + PDF Export

**Files to Create:**
```
app/dashboard/real-estate/comps/page.tsx
app/dashboard/real-estate/comps/CompsClient.tsx
app/api/real-estate/comps/route.ts
lib/pdf/compsReport.ts
```

**Charts (use recharts):**
- Price vs Time (line chart)
- Price per SQM distribution (bar chart)
- Property status breakdown (pie chart)

**KPIs:**
- Median price
- Average price
- Min/Max price
- Total properties

**Filters:**
- Date range picker
- Neighborhood selector
- Status filter

**PDF Export:**
- Use jsPDF or similar
- Include charts as images (html2canvas)
- KPIs table
- Filter parameters shown

---

### 6. Minor Enhancements

**Property FormModal:**
- ✅ Images upload (done)
- Add "Create Property" manual mode (already works)

**Leads Actions:**
- Wire "Qualify with AI" button to existing API
- Create LinkPropertyModal for property linking
- Create EditLeadModal

---

## 📋 QA Checklist (Before Deploy)

### Routes:
- [ ] `/dashboard/real-estate/properties` loads with 3 properties
- [ ] `/dashboard/real-estate/leads` loads with filters working
- [ ] All dashboard links navigate correctly

### Properties:
- [ ] Create property works
- [ ] Edit property works
- [ ] Image upload works (drag & drop)
- [ ] Scoring badge displays
- [ ] Landing pages listed

### Leads:
- [ ] Import CSV works
- [ ] Export CSV works (with Hebrew)
- [ ] Filters work (status, source, search)
- [ ] Bulk select works
- [ ] Bulk export works

### General:
- [ ] AI Advisor present on all pages
- [ ] i18n EN/HE works
- [ ] RTL layout correct
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Toast notifications work

---

## 🚀 Deployment Steps

1. Run migration (if DB changes)
```bash
npx prisma migrate dev --name add_landing_pages_and_scoring
```

2. Generate Prisma client
```bash
npx prisma generate
```

3. Build
```bash
pnpm build
```

4. Deploy to Vercel
```bash
git push origin main
```

5. Test production URLs
- https://www.effinity.co.il/dashboard/real-estate/properties
- https://www.effinity.co.il/dashboard/real-estate/leads

---

## 📝 Documentation to Create

1. **LEADS_IMPORT_EXPORT.md** - Guide for CSV import/export
2. **PROPERTIES_IMPORT.md** - Guide for property imports
3. **SCORING_ALGORITHM.md** - Explain property scoring
4. Update **PHASE_2_PROGRESS.md** - Final status

---

**Current Status:** 4/8 items complete (50%)
**Next Session:** Landing Page Persistence → Property Imports → Scoring
