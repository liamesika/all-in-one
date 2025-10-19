# Law Vertical Redesign - Implementation Plan

## Project Scope
Complete UI/UX redesign and functionality hardening for Law vertical with premium legal aesthetic while maintaining Effinity brand consistency.

## Status: Phase 1 Complete ✅
- **Design token system created**
- **Theme foundation established**
- **Ready for component development**

---

## Phase Breakdown

### Phase 1: Foundation ✅ (COMPLETE)
**Duration:** 1 session
**Status:** Committed to `feature/law-vertical-redesign`

**Completed:**
- [x] Law design tokens (CSS variables)
- [x] Tailwind configuration extension
- [x] Theme system (light/dark/RTL support)
- [x] Token categories (colors, typography, spacing, shadows)
- [x] Status color utilities (case/priority/invoice)
- [x] Global import in layout.tsx

**Deliverables:**
- `/apps/web/styles/themes/law.theme.css`
- `/apps/web/lib/themes/law-theme-config.ts`
- Updated `/apps/web/app/layout.tsx`

---

### Phase 2: Global Branding Updates
**Duration:** 1-2 hours
**Priority:** HIGH

**Tasks:**
- [ ] Update Productions header (replace "production" label with Effinity branding)
- [ ] Verify homepage MarketingNav has proper Effinity branding (already has it)
- [ ] Ensure consistent logo/wordmark across all headers
- [ ] Test language switch icon-only mode
- [ ] Verify notification/profile/chat components

**Files to Update:**
- `/apps/web/app/dashboard/production/*/layout.tsx` or header components
- `/apps/web/components/dashboard/ProductionHeader.tsx` (if exists)

---

### Phase 3: Shared Law UI Component Library
**Duration:** 2-3 hours
**Priority:** HIGH

**Components to Create:**
```
/apps/web/components/law/
├── LawCard.tsx                    # Base card with law theme
├── LawButton.tsx                  # Primary/secondary/destructive buttons
├── LawInput.tsx                   # Form input with validation states
├── LawSelect.tsx                  # Dropdown with law styling
├── LawTextarea.tsx                # Text area for notes/descriptions
├── LawBadge.tsx                   # Status badges (case/priority/invoice)
├── LawModal.tsx                   # Accessible modal with focus trap
├── LawDrawer.tsx                  # Mobile-friendly drawer
├── LawTable.tsx                   # Data table with sorting/filtering
├── LawKanban.tsx                  # Drag-and-drop kanban board
├── LawCalendar.tsx                # Calendar component
├── LawDatePicker.tsx              # Date/time picker
├── LawFileUpload.tsx              # Drag-drop upload with progress
├── LawSkeleton.tsx                # Loading skeletons
├── LawEmptyState.tsx              # Empty state illustrations
└── LawToast.tsx                   # Toast notifications
```

**Requirements:**
- TypeScript with full prop types
- Accessibility (ARIA labels, focus management, keyboard nav)
- Mobile-first responsive
- Dark mode support
- RTL support
- 44px minimum tap targets on mobile
- react-hook-form integration
- zod validation support

---

### Phase 4: Law Dashboard Redesign
**Duration:** 3-4 hours
**Priority:** HIGH

**File:** `/apps/web/app/dashboard/law/dashboard/page.tsx`

**Features:**
- [ ] KPI cards with real-time data
- [ ] Activity timeline with infinite scroll
- [ ] Quick actions (create case/client/task/event)
- [ ] Working loading states
- [ ] Error boundaries with retry
- [ ] Empty states with illustrations
- [ ] Filters (date range, attorney, practice area)
- [ ] Mobile optimization
- [ ] Analytics integration (law_dashboard_view, law_kpi_click)

**API Integration:**
- GET `/api/law/dashboard` with query params
- Loading/error/empty state handling
- React Query caching and invalidation

---

### Phase 5: Cases Module (CRUD + Detail Page)
**Duration:** 4-6 hours
**Priority:** HIGH

**Files:**
- `/apps/web/app/dashboard/law/cases/page.tsx` (list)
- `/apps/web/app/dashboard/law/cases/[id]/page.tsx` (detail)
- `/apps/web/app/dashboard/law/cases/new/page.tsx` (create)

**Features:**
**List Page:**
- [ ] Table with sorting/filtering/search
- [ ] Status badges
- [ ] Pagination
- [ ] Bulk actions
- [ ] Create button with drawer
- [ ] Row click → detail page

**Detail Page:**
- [ ] Tabs: Summary / Documents / Tasks / Activity / Billing
- [ ] Edit mode with validation
- [ ] Document attachments
- [ ] Task list with inline create
- [ ] Activity log with timestamps
- [ ] Sidebar with client info and case metadata

**Mobile:**
- [ ] Card layout for list
- [ ] Bottom sheet for quick view
- [ ] Swipeable tabs on detail page

---

### Phase 6: Clients Module (CRM + Drawer)
**Duration:** 3-4 hours
**Priority:** HIGH

**File:** `/apps/web/app/dashboard/law/clients/page.tsx`

**Features:**
- [ ] CRM-style list with avatars
- [ ] Tags and categories
- [ ] Search and filters
- [ ] Quick view drawer (not full page)
- [ ] Edit drawer with validation
- [ ] Link/unlink cases
- [ ] Contact history
- [ ] Mobile-optimized cards

---

### Phase 7: Documents Module (Upload + Preview)
**Duration:** 3-4 hours
**Priority:** HIGH

**File:** `/apps/web/app/dashboard/law/documents/page.tsx`

**Features:**
- [ ] Drag-and-drop upload zone
- [ ] Progress bars for uploads
- [ ] Max file size validation (10MB default)
- [ ] PDF preview in modal
- [ ] DOCX fallback (download button)
- [ ] Assign to case/client
- [ ] Delete with confirmation
- [ ] Folder/category organization
- [ ] Search and filters
- [ ] Mobile-friendly upload

**Storage:**
- AWS S3 integration
- Pre-signed URLs for upload
- Thumbnail generation (optional)

---

### Phase 8: Calendar Module
**Duration:** 4-5 hours
**Priority:** MEDIUM

**File:** `/apps/web/app/dashboard/law/calendar/page.tsx`

**Features:**
- [ ] Month/Week/Agenda views
- [ ] Filters (attorney, case, event type, date)
- [ ] Event create/edit modal
- [ ] Conflict validation (overlap detection)
- [ ] Drag-to-reschedule
- [ ] Recurring events
- [ ] iCal export
- [ ] Mobile: default to Agenda view
- [ ] Swipe between months

---

### Phase 9: Tasks Module (Kanban + Table)
**Duration:** 4-5 hours
**Priority:** HIGH

**File:** `/apps/web/app/dashboard/law/tasks/page.tsx`

**Features:**
- [ ] Toggle between Kanban and Table views
- [ ] Kanban: drag-and-drop between columns (To Do, In Progress, Review, Done)
- [ ] Optimistic updates + server reconciliation
- [ ] Error rollback on failed drag
- [ ] Quick add task inline
- [ ] Bulk update (assign, status, priority)
- [ ] Filters (assignee, case, priority, due date)
- [ ] Mobile: long-press drag with haptics

**Libraries:**
- `@dnd-kit/core` for drag-and-drop
- React Query for optimistic updates

---

### Phase 10: Invoices Module
**Duration:** 3-4 hours
**Priority:** MEDIUM

**File:** `/apps/web/app/dashboard/law/invoices/page.tsx`

**Features:**
- [ ] CRUD operations
- [ ] Auto-numbering (INV-2025-0001)
- [ ] Status workflow (draft → sent → paid)
- [ ] PDF generation (placeholder)
- [ ] Export list to Excel
- [ ] Filters (client, status, date range, amount)
- [ ] Payment tracking
- [ ] Overdue alerts

---

### Phase 11: Reports Module
**Duration:** 3-4 hours
**Priority:** MEDIUM

**File:** `/apps/web/app/dashboard/law/reports/page.tsx`

**Features:**
- [ ] Analyzed KPIs with charts
- [ ] Filters (date range, attorney, practice area)
- [ ] Multi-sheet Excel export (Summary, Cases, Revenue, Time)
- [ ] Loading states during export
- [ ] Empty states with suggestions
- [ ] Print-friendly version

**Excel Export:**
```typescript
const XLSX = await import('xlsx'); // Lazy load
```

---

### Phase 12: Team Module
**Duration:** 2-3 hours
**Priority:** LOW

**File:** `/apps/web/app/dashboard/law/team/page.tsx`

**Features:**
- [ ] Team member list with avatars
- [ ] Roles display (RBAC placeholder)
- [ ] Workload counters (active cases, tasks)
- [ ] Filter by availability
- [ ] Quick view drawer
- [ ] Invite member (placeholder)

---

### Phase 13: Settings Module
**Duration:** 2-3 hours
**Priority:** LOW

**File:** `/apps/web/app/dashboard/law/settings/page.tsx`

**Features:**
- [ ] Firm logo upload
- [ ] Firm information (name, address, phone, email)
- [ ] Notification preferences
- [ ] Default settings (case status, billing rates)
- [ ] Integrations placeholder
- [ ] Data export

---

### Phase 14: Mobile Optimization Pass
**Duration:** 2-3 hours
**Priority:** HIGH

**All Pages:**
- [ ] 44px minimum tap targets
- [ ] No horizontal scroll
- [ ] Sticky headers on long lists
- [ ] Filter drawer with Apply/Reset
- [ ] Bottom sheet modals where appropriate
- [ ] Large, tappable cards
- [ ] Swipe gestures where applicable
- [ ] Touch-friendly form inputs

---

### Phase 15: Accessibility Audit (WCAG AA)
**Duration:** 2-3 hours
**Priority:** HIGH

**Checklist:**
- [ ] Color contrast ratios ≥ 4.5:1
- [ ] Focus outlines visible
- [ ] Keyboard navigation complete
- [ ] Screen reader labels (ARIA)
- [ ] Skip links in long pages
- [ ] Form labels and error messages
- [ ] Modal focus trapping
- [ ] Heading hierarchy (h1 → h6)

**Tools:**
- axe DevTools
- Lighthouse Accessibility audit
- NVDA/JAWS screen reader testing

---

### Phase 16: Performance Optimization
**Duration:** 2-3 hours
**Priority:** MEDIUM

**Tasks:**
- [ ] Code-split heavy components (`next/dynamic`)
- [ ] Lazy load `xlsx` library (only on export)
- [ ] Avoid full library imports
- [ ] Image optimization with `next/image`
- [ ] Bundle analysis (`@next/bundle-analyzer`)
- [ ] React Query caching strategy
- [ ] Debounce search inputs
- [ ] Virtual scrolling for long lists

---

### Phase 17: Telemetry & Analytics
**Duration:** 1-2 hours
**Priority:** MEDIUM

**GA4 Events:**
```typescript
law_dashboard_view
law_case_create
law_case_view
law_client_create
law_document_upload
law_calendar_event_create
law_task_drag
law_invoice_generate
law_report_export
law_modal_open
law_filter_apply
```

**Sentry Tags:**
```typescript
vertical: 'law'
accountId: string
caseId: string (if applicable)
```

---

### Phase 18: QA Testing
**Duration:** 2-3 hours
**Priority:** HIGH

**Manual Testing:**
- [ ] All routes load without 404
- [ ] CRUD operations work (create/read/update/delete)
- [ ] Forms validate correctly
- [ ] Modals/drawers open/close properly
- [ ] Mobile responsive on iPhone/Android
- [ ] Dark mode works correctly
- [ ] RTL support (if Hebrew enabled)
- [ ] Analytics events fire

**Lighthouse Audits:**
- [ ] Desktop: /dashboard/law/dashboard ≥90
- [ ] Desktop: /dashboard/law/tasks ≥90
- [ ] Mobile: /dashboard/law/dashboard ≥90
- [ ] Mobile: /dashboard/law/tasks ≥90

**Automated:**
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console errors in browser
- [ ] Bundle size acceptable

---

### Phase 19: Documentation & Handoff
**Duration:** 1-2 hours
**Priority:** LOW

**Deliverables:**
- [ ] QA report with screenshots
- [ ] Staging URL for review
- [ ] Component documentation (Storybook optional)
- [ ] API integration guide
- [ ] Known issues/limitations

---

## Total Estimated Duration
**40-60 hours** (5-8 working days for single developer)

## Current Status
✅ **Phase 1 Complete** - Foundation established
⏳ **Ready for Phase 2** - Global branding updates

---

## Branch Strategy
- Feature branch: `feature/law-vertical-redesign`
- Commit frequently with descriptive messages
- Push to remote daily for backup
- Create PR when 80% complete for early feedback
- Merge to main after full QA and approval

---

## Dependencies
- React Query (caching)
- @dnd-kit/core (drag-and-drop)
- xlsx (Excel export)
- react-hook-form (forms)
- zod (validation)
- Framer Motion (animations)
- date-fns or dayjs (dates)

---

## Notes
- Prioritize mobile-first design
- Test on actual devices (iPhone, Android)
- Use real API data (no mocks)
- Follow Effinity design system
- Maintain brand consistency
- Document complex logic
- Write clean, maintainable code

---

Generated: October 19, 2025
