# Phase 3: Cross-Vertical Alignment - Implementation Plan

**Status:** Ready to Execute
**Objective:** Apply Design System 2.0 to Real Estate, E-Commerce, and Law verticals

---

## 🎯 Overview

Phase 3 will systematically update all remaining verticals to match the Productions vertical's visual and functional standards. Each vertical will use the unified component library and follow the same design patterns.

---

## ✅ Completed Benchmark: Productions Vertical

The Productions vertical now serves as the reference implementation:

**Components Used:**
- UniversalCard (with CardHeader, CardBody, CardFooter)
- KPICard for metrics
- UniversalButton (all variants)
- UniversalBadge, StatusBadge, CountBadge
- UniversalTable (with pagination, sorting, empty states)
- FormModal for all dialogs
- Lucide React icons (no emojis)

**Design Patterns:**
- Typography: text-heading-1, text-body-base, text-caption
- Colors: #2979FF (primary), #0E1A2B (dark bg), #1A2F4B (medium bg)
- Spacing: 8pt grid (p-6, gap-4, space-y-8)
- Shadows: shadow-sm, shadow-md, shadow-glow-primary
- Dark mode: Full support via dark: prefix
- Empty states: TableEmptyState with icon, title, description, action
- Loading states: Skeleton screens with pulse animation

---

## 📊 Phase 3 Scope

### 3.1 Real Estate Vertical (Priority 1)

**Dashboard Page:**
- File: `/apps/web/app/dashboard/real-estate/dashboard/page.tsx`
- Current: Custom KPI cards, manual styling
- Update: Use KPICard, UniversalCard, StatusBadge
- Metrics: New Leads, Conversion Rates, Time to Contact, Scheduled Viewings, Offers Created, Avg DOM, ROAS/CAC, Pipeline Value

**Properties List:**
- File: `/apps/web/app/dashboard/real-estate/properties/page.tsx`
- Current: Custom table, filter UI
- Update: UniversalTable with sorting, pagination, filters
- Actions: View, Edit, Delete with UniversalButton

**Leads Page:**
- File: `/apps/web/app/dashboard/real-estate/leads/page.tsx`
- Current: Custom lead cards/table
- Update: UniversalTable with StatusBadge (Hot, Warm, Cold)
- Filters: Date range, source, status

**AI Searcher:**
- File: `/apps/web/app/dashboard/real-estate/ai-searcher/page.tsx`
- Current: Custom search interface
- Update: UniversalCard for search form, results table

**Campaigns:**
- File: `/apps/web/app/dashboard/real-estate/campaigns/page.tsx`
- Current: Campaign cards
- Update: UniversalCard, StatusBadge, metrics display

**Reports:**
- File: `/apps/web/app/dashboard/real-estate/reports/page.tsx`
- Current: Charts and metrics
- Update: KPICard grid, UniversalCard for charts

---

### 3.2 E-Commerce Vertical (Priority 2)

**Dashboard Page:**
- File: `/apps/web/app/dashboard/e-commerce/dashboard/page.tsx` (if exists)
- Metrics: Leads, Conversions, Revenue, Campaign Performance
- Update: KPICard, UniversalCard, StatusBadge

**Leads Page:**
- File: `/apps/web/app/dashboard/e-commerce/leads/page.tsx`
- Current: Lead list with custom styling
- Update: UniversalTable with filters, StatusBadge

**Campaigns:**
- File: `/apps/web/app/dashboard/e-commerce/campaigns/page.tsx`
- Current: Campaign management
- Update: UniversalCard, StatusBadge, UniversalTable

---

### 3.3 Law Vertical (Priority 3)

**Dashboard Page:**
- File: `/apps/web/app/dashboard/law/dashboard/page.tsx` (create if missing)
- Metrics: Active Cases, Billable Hours, Client Intake, Revenue
- Components: KPICard, UniversalCard, StatusBadge

**Cases Page:**
- File: `/apps/web/app/dashboard/law/cases/page.tsx`
- Layout: UniversalTable with case status, client, attorney
- Filters: Practice area, status, date range

**Clients Page:**
- File: `/apps/web/app/dashboard/law/clients/page.tsx`
- Layout: UniversalCard grid or UniversalTable
- Actions: View, Edit, Add Note

---

## 🎨 Design System Application Checklist

For each page, ensure:

### Colors
- [ ] Primary actions use `bg-[#2979FF]`
- [ ] Dark backgrounds use `bg-gray-50 dark:bg-[#0E1A2B]`
- [ ] Card backgrounds use `bg-white dark:bg-[#1A2F4B]`
- [ ] Borders use `border-gray-200 dark:border-[#2979FF]/20`
- [ ] Text uses `text-gray-900 dark:text-white` (primary)
- [ ] Secondary text uses `text-gray-600 dark:text-gray-400`

### Typography
- [ ] Page titles use `text-heading-1`
- [ ] Section titles use `text-heading-3`
- [ ] Card titles use `text-heading-4`
- [ ] Body text uses `text-body-base`
- [ ] Captions use `text-body-sm` or `text-caption`

### Spacing
- [ ] Card padding is `p-6`
- [ ] Section gaps are `space-y-8` or `gap-6`
- [ ] Element gaps are `gap-4`
- [ ] Grid columns use `gap-6`

### Components
- [ ] All cards use `UniversalCard`
- [ ] All buttons use `UniversalButton`
- [ ] All status indicators use `StatusBadge`
- [ ] All data tables use `UniversalTable`
- [ ] All modals use `FormModal` or `UniversalModal`
- [ ] All badges use `UniversalBadge`
- [ ] All icons are from Lucide React (no emojis)

### States
- [ ] Empty states use `TableEmptyState`
- [ ] Loading states use skeleton screens
- [ ] Error states use UniversalCard with AlertCircle icon
- [ ] Hover effects on interactive elements

### Accessibility
- [ ] All buttons have aria-labels
- [ ] All form inputs have labels
- [ ] Keyboard navigation works
- [ ] Focus states visible

---

## 📝 Implementation Strategy

### Step 1: Dashboard Pages (Week 1)
1. Real Estate Dashboard
2. E-Commerce Dashboard
3. Law Dashboard (create if missing)

**Goal:** Unified KPI display across all verticals

### Step 2: List/Table Pages (Week 2)
1. Real Estate Properties
2. Real Estate Leads
3. E-Commerce Leads
4. Law Cases

**Goal:** Consistent table experience with sorting, filtering, pagination

### Step 3: Detail/Form Pages (Week 3)
1. Property Detail/Edit
2. Lead Detail/Edit
3. Case Detail/Edit

**Goal:** Consistent form layouts and edit experiences

### Step 4: Feature Pages (Week 4)
1. Real Estate AI Searcher
2. Real Estate Campaigns
3. E-Commerce Campaigns
4. Law Reports

**Goal:** Feature-specific pages following design system

---

## 🔄 Migration Pattern

For each page:

### 1. Read Existing Implementation
```bash
Read file to understand current structure, data fetching, state management
```

### 2. Identify Components to Replace
- Custom cards → UniversalCard
- Custom buttons → UniversalButton
- Custom badges → UniversalBadge, StatusBadge
- Custom tables → UniversalTable
- Custom modals → FormModal

### 3. Update Imports
```tsx
import {
  UniversalCard,
  KPICard,
  UniversalButton,
  StatusBadge,
  UniversalTable,
  // ...
} from '@/components/shared';
```

### 4. Replace Components
```tsx
// Before
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-xl font-bold">Title</h3>
  <p>Content</p>
</div>

// After
<UniversalCard>
  <CardHeader>
    <h3 className="text-heading-3">Title</h3>
  </CardHeader>
  <CardBody>
    <p className="text-body-base">Content</p>
  </CardBody>
</UniversalCard>
```

### 5. Update Typography
```tsx
// Before
<h1 className="text-3xl font-bold">Page Title</h1>

// After
<h1 className="text-heading-1">Page Title</h1>
```

### 6. Update Colors
```tsx
// Before
className="bg-blue-600 text-white"

// After
className="bg-[#2979FF] text-white"
```

### 7. Add Loading/Empty States
```tsx
if (loading) return <LoadingSkeleton />;
if (data.length === 0) return <TableEmptyState />;
```

---

## 📈 Success Metrics

**Visual Consistency:**
- [ ] All verticals use same component library
- [ ] Typography hierarchy matches across verticals
- [ ] Color palette consistent (no custom blues)
- [ ] Spacing follows 8pt grid

**Functional Consistency:**
- [ ] Empty states present everywhere
- [ ] Loading states with skeletons
- [ ] Error handling with retry buttons
- [ ] Hover effects on all interactive elements

**Code Quality:**
- [ ] Zero custom card components
- [ ] Zero custom button components
- [ ] Zero custom badge components
- [ ] All icons from Lucide React
- [ ] Full TypeScript coverage

---

## 🐛 Known Issues to Address

### Real Estate Vertical
- Custom KPI cards need KPICard replacement
- Property cards need UniversalCard
- Lead status badges need StatusBadge
- Filter UI needs UniversalButton + UniversalCard

### E-Commerce Vertical
- Campaign cards need redesign
- Lead table needs UniversalTable
- Status indicators need StatusBadge

### Law Vertical
- May need complete dashboard creation
- Case list needs UniversalTable
- Client cards need UniversalCard

---

## 📅 Timeline

**Week 1 (Current):**
- ✅ Phase 1: Foundation Complete
- ✅ Phase 2: Productions Complete
- 🔄 Phase 3: Real Estate Dashboard

**Week 2:**
- Real Estate List Pages
- E-Commerce Dashboard + List Pages

**Week 3:**
- Law Vertical Complete
- Detail/Edit Pages

**Week 4:**
- Feature Pages
- QA Testing
- Visual Consistency Audit

---

## 🎯 Next Immediate Steps

1. **Read Real Estate Dashboard implementation**
2. **Identify all KPI metrics and data structure**
3. **Redesign with KPICard components**
4. **Replace custom cards with UniversalCard**
5. **Update typography and spacing**
6. **Test loading/empty/error states**
7. **Move to Properties list page**

---

**Document Status:** Ready for Implementation
**Last Updated:** Current Session
**Next Action:** Begin Real Estate Dashboard Redesign
