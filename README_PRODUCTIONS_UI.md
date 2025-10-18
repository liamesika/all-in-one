# Productions UI - Creative Productions Module

## Overview

The **Creative Productions** module is a full-featured video/ad production workflow system within the Effinity All-in-One platform. It provides end-to-end project management for creative teams, from client onboarding to render delivery.

**Key Distinction**: This is separate from the general "Productions" vertical (construction/events) and focuses specifically on **creative content production** (videos, ads, social media).

---

## Routes

| Route | Page | Description | Status |
|-------|------|-------------|--------|
| `/dashboard/production/creative` | Overview | Dashboard with KPI cards and recent activity | ⏳ Pending update |
| `/dashboard/production/creative/projects` | Projects | Project list/table with detail tabs | ⏳ Pending update |
| `/dashboard/production/creative/assets` | Assets | Media library with upload flow | ⏳ Pending update |
| `/dashboard/production/creative/renders` | Renders | Queue & history with status tracking | ⏳ Pending update |
| `/dashboard/production/creative/tasks` | Tasks | Kanban/table with assignees & due dates | ⏳ Pending update |
| `/dashboard/production/creative/reviews` | Reviews | Approval workflow with feedback | ⏳ Pending update |
| `/dashboard/production/creative/customers` | **Customers** | CRM-lite for client management | ✅ **Implemented** |
| `/dashboard/production/creative/calendar` | **Calendar** | Timeline view of deadlines/milestones | ✅ **Implemented** |
| `/dashboard/production/creative/analytics` | Analytics | Usage overview (no billing) | ⏳ Pending |
| `/dashboard/production/creative/settings` | Settings | Module preferences | ⏳ Pending |

---

## API Endpoints

### Customers (CRM-lite)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/creative-clients` | Create new customer | Required |
| `GET` | `/creative-clients` | List customers (with filters) | Required |
| `GET` | `/creative-clients/statistics` | Get summary stats | Required |
| `GET` | `/creative-clients/:id` | Get customer detail + projects | Required |
| `PUT` | `/creative-clients/:id` | Update customer | Required |
| `DELETE` | `/creative-clients/:id` | Delete customer (unlinks projects) | Required |

**Query Params (GET /creative-clients)**:
- `search` (string): Search by name or company
- `tags` (comma-separated): Filter by tags (e.g., `vip,enterprise`)

**Example Request**:
```bash
GET /creative-clients?search=tech&tags=vip,enterprise
Headers:
  x-org-id: demo-org
  x-owner-uid: demo-user
```

**Example Response**:
```json
[
  {
    "id": "ckx123...",
    "name": "Sarah Cohen",
    "company": "TechCorp Ltd",
    "emails": ["sarah@techcorp.com"],
    "phones": ["+972-50-1234567"],
    "tags": ["vip", "enterprise"],
    "notes": "Key client for Q1 campaigns",
    "projects": [
      { "id": "proj1", "name": "Summer Campaign", "status": "IN_PROGRESS" }
    ],
    "_count": { "projects": 5 },
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2025-01-15T14:30:00Z"
  }
]
```

### Calendar (Timeline Events)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/creative-calendar/events` | Get timeline events | Required |
| `GET` | `/creative-calendar/summary` | Get event counts & upcoming | Required |

**Query Params (GET /creative-calendar/events)**:
- `startDate` (ISO 8601): Filter start date
- `endDate` (ISO 8601): Filter end date
- `projectId` (string): Filter to specific project
- `eventTypes` (comma-separated): Filter by event type (e.g., `project_deadline,task_due`)

**Event Types**:
1. `project_deadline` ← `CreativeProject.dueDate`
2. `task_due` ← `CreativeTask.dueAt`
3. `review_requested` ← `CreativeReview.requestedAt`
4. `render_milestone` ← `CreativeRender` (QUEUED/RENDERING/READY)

**Example Request**:
```bash
GET /creative-calendar/events?startDate=2025-01-01&endDate=2025-01-31&eventTypes=project_deadline,task_due
Headers:
  x-org-id: demo-org
  x-owner-uid: demo-user
```

**Example Response**:
```json
[
  {
    "id": "project-ckx123",
    "title": "Summer Campaign 2025 (Deadline)",
    "type": "project_deadline",
    "date": "2025-01-20T23:59:59Z",
    "status": "IN_PROGRESS",
    "projectId": "ckx123",
    "projectName": "Summer Campaign 2025",
    "metadata": { "status": "IN_PROGRESS" }
  },
  {
    "id": "task-ckx456",
    "title": "Script Writing",
    "type": "task_due",
    "date": "2025-01-22T17:00:00Z",
    "status": "TODO",
    "projectId": "ckx123",
    "projectName": "Summer Campaign 2025",
    "metadata": { "status": "TODO", "taskId": "ckx456" }
  }
]
```

---

## Feature Flags

| Flag | Description | Default (Staging) | Default (Prod) |
|------|-------------|-------------------|----------------|
| `ff.productions_prod_mode` | Enable Productions module | `ON` | `OFF` |
| `ff.productions_calendar` | Show Calendar page | `ON` | `OFF` |
| `ff.productions_customers` | Show Customers page | `ON` | `OFF` |

**Usage in Code**:
```typescript
const showCalendar = featureFlags.get('ff.productions_calendar');

if (!showCalendar) {
  return <ComingSoonPage />;
}
```

**Disabled Features**:
- Show tooltip: "Coming soon" or "Contact admin to enable"
- Track click intent in GA4: `prod_feature_requested`

---

## GA4 Events

All Productions events use the `prod_*` prefix:

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `prod_customer_created` | Customer form submitted | `customer_id`, `has_company`, `tag_count` |
| `prod_customer_updated` | Customer edited | `customer_id`, `fields_changed` |
| `prod_customer_deleted` | Customer removed | `customer_id`, `project_count` |
| `prod_customer_viewed` | Customer detail opened | `customer_id` |
| `prod_calendar_viewed` | Calendar page loaded | `view_mode` (month/week/agenda), `event_count` |
| `prod_calendar_filtered` | Filters applied | `event_types`, `date_range` |
| `prod_project_created` | Project form submitted | `project_id`, `has_deadline`, `channel_count` |
| `prod_render_requested` | Render job queued | `render_id`, `format`, `priority` |
| `prod_asset_uploaded` | Asset upload completed | `asset_id`, `type`, `size_bytes` |

**Implementation**:
```typescript
// analytics.ts
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      vertical: 'productions',
      account_id: userProfile.organizationId,
      ...properties,
    });
  }
};

// Usage
trackEvent('prod_customer_created', {
  customer_id: customer.id,
  has_company: !!customer.company,
  tag_count: customer.tags.length,
});
```

---

## Database Schema

### CreativeClient

```prisma
model CreativeClient {
  id             String            @id @default(cuid())
  orgId          String
  organization   Organization      @relation(fields: [orgId], references: [id], onDelete: Cascade)
  ownerUid       String

  // Contact information
  name           String
  company        String?
  emails         String[]          // Array of email addresses
  phones         String[]          // Array of phone numbers

  // Metadata
  tags           String[]          // e.g., ["vip", "enterprise", "startup"]
  notes          String?           // Internal notes

  // Relationships
  projects       CreativeProject[] // Projects linked to this client

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([orgId])
  @@index([ownerUid])
  @@index([orgId, ownerUid])
  @@index([name])
  @@index([company])
}
```

### CreativeProject (Updated)

```prisma
model CreativeProject {
  id             String                @id @default(cuid())
  orgId          String
  name           String
  objective      String?
  targetAudience String?
  channels       String[]
  status         CreativeProjectStatus @default(DRAFT)
  dueDate        DateTime?
  ownerUid       String

  // Client relationship (new)
  clientId       String?
  client         CreativeClient?       @relation(fields: [clientId], references: [id], onDelete: SetNull)

  tasks   CreativeTask[]
  assets  CreativeAsset[]
  reviews CreativeReview[]
  renders CreativeRender[]

  @@index([clientId])
}
```

---

## UI Components

All pages use the **Effinity Design System 2.0** (shared components):

### Cards
- `UniversalCard` - Base card container
- `CardHeader` - Card header with title
- `CardBody` - Card content area
- `KPICard` - Stat card with trend indicator

### Tables
- `UniversalTable` - Base table wrapper
- `UniversalTableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell`
- `TableEmptyState` - Empty state with icon, title, description, CTA
- `TablePagination` - Pagination controls

### Buttons
- `UniversalButton` - Primary button (variants: primary, outline, ghost, success, danger)
- `IconButton` - Icon-only button
- `ButtonGroup` - Button group wrapper

### Badges & Tags
- `StatusBadge` - Status indicator (success, warning, error, info)
- `UniversalBadge` - Generic badge
- `CountBadge` - Notification badge with count

### Modals & Drawers
- `UniversalModal` - Base modal
- `Drawer` - Side drawer (used for mobile filters)
- `ConfirmModal` - Confirmation dialog
- `FormModal` - Form wrapper modal

### Bulk Actions
- `BulkActionsMenu` - Floating menu for bulk operations
- `BottomSheet` - Mobile bottom sheet

---

## Security

### Multi-Tenant Scoping

**CRITICAL**: All queries are scoped by `organizationId` + `ownerUid`:

```typescript
// ✅ Correct
const customers = await prisma.creativeClient.findMany({
  where: {
    orgId: organizationId,
    ownerUid: ownerUid,
  },
});

// ❌ WRONG - NO SCOPING
const customers = await prisma.creativeClient.findMany();
```

### Ownership Verification

Always verify ownership before updates/deletes:

```typescript
async update(clientId: string, orgId: string, ownerUid: string, dto: UpdateDto) {
  // Verify ownership FIRST
  await this.findOne(clientId, orgId, ownerUid); // Throws NotFoundException if not found

  // Then update
  return this.prisma.creativeClient.update({
    where: { id: clientId },
    data: dto,
  });
}
```

### Auth Headers

API requests require authentication headers:

```typescript
headers: {
  'x-org-id': organizationId,      // From Firebase JWT
  'x-owner-uid': ownerUid,          // From Firebase JWT
  'x-user-id': userId,              // From Firebase JWT
}
```

**Production**: Replace with proper NestJS JWT guard:
```typescript
@UseGuards(FirebaseAuthGuard)
@Controller('creative-clients')
export class CreativeClientsController {
  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    const { organizationId, ownerUid } = req.user;
    // ...
  }
}
```

---

## Known Limitations & TODOs

### High Priority

1. **API Integration**: Wire frontend to actual backend endpoints
   - Currently using mock data
   - Replace `fetchCustomers()` / `fetchEvents()` with real API calls

2. **Firebase Storage**: Implement asset upload flow
   - Generate presigned URLs via Firebase Admin SDK
   - Path: `gs://{bucket}/organizations/{orgId}/creative-assets/{assetId}/{filename}`

3. **Calendar Month/Week Views**: Implement grid layouts
   - Consider FullCalendar.js or custom implementation
   - Drag-and-drop to reschedule

4. **Create/Edit Modals**: Build full forms with validation
   - Customer form: name, company, emails[], phones[], tags, notes
   - Project form: name, objective, channels, deadline, clientId

5. **JWT Auth Guard**: Replace header-based auth with proper NestJS guard

### Medium Priority

6. **Render Worker**: Implement background job processing
   - BullMQ integration
   - FFmpeg for video, ImageMagick for images
   - Status updates via WebSocket

7. **Usage Analytics Dashboard**: Build internal analytics page
   - Storage usage charts
   - Render compute time trends
   - Project velocity metrics

8. **ICS Export**: Calendar export functionality
   - Behind feature flag `ff.productions_calendar_export`
   - Generate .ics file from events

9. **Tags Taxonomy**: Admin UI to manage tag suggestions
   - Pre-populated: vip, enterprise, startup, agency, recurring
   - Allow custom tags per organization

10. **Search Optimization**: Full-text search for customers
    - PostgreSQL `ts_vector` or Algolia integration

### Low Priority

11. **Render Queue Visualization**: Show queue depth and estimated wait time
12. **Batch Operations**: Bulk customer import via CSV
13. **Email Integration**: Send review requests via email
14. **WhatsApp Integration**: Similar to Real Estate leads
15. **Project Templates**: Save/reuse project configurations

---

## Performance Targets

### Lighthouse Scores (Target: ≥90)

| Metric | Target | Current |
|--------|--------|---------|
| Performance | 90+ | ⏳ Pending audit |
| Accessibility | 90+ | ⏳ Pending audit |
| Best Practices | 90+ | ⏳ Pending audit |
| SEO | 90+ | ⏳ Pending audit |

**Run Lighthouse**:
```bash
npx lighthouse https://effinity-platform.vercel.app/dashboard/production/creative/customers --view
```

### Mobile Optimization

- ✅ All touch targets ≥44px (iOS/Android standards)
- ✅ Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- ✅ Mobile-first card views with table fallback on desktop
- ✅ Filter drawer for mobile (vs. inline dropdowns on desktop)

### Dark Mode

- ✅ Tailwind `dark:` variants throughout
- ✅ Color tokens: `bg-gray-50 dark:bg-[#0E1A2B]`
- ✅ Contrast ratios meet WCAG AA standards

### RTL Support

- ✅ Conditional `rtl` / `ltr` class based on language context
- ✅ Mirrored layouts for Hebrew (`language === 'he'`)
- ✅ Icons remain LTR (universal direction)

---

## Development

### Local Setup

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm --filter web dev

# Build for production
SKIP_ENV_VALIDATION=true pnpm --filter web build
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Firebase
FIREBASE_ADMIN_PRIVATE_KEY="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID="G-..."
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests (Playwright)
pnpm --filter web test:e2e

# Lighthouse audit
pnpm lighthouse
```

---

## Deployment

### Vercel (Recommended)

```bash
# Deploy to staging
npx vercel

# Deploy to production
npx vercel --prod
```

**Environment Variables** (set in Vercel dashboard):
- All `.env` vars above
- `SKIP_ENV_VALIDATION=true` (if using Vercel's env management)

### Build Optimization

```json
{
  "scripts": {
    "prebuild": "prisma generate",
    "build": "NEXT_DISABLE_SWC_TOOLS_PATCHING=1 next build"
  }
}
```

---

## Screenshots

### Customers Page (Desktop)
![Customers Desktop](./docs/screenshots/customers-desktop.png)
_CRM-lite with search, tags filter, bulk actions, and table view_

### Customers Page (Mobile)
![Customers Mobile](./docs/screenshots/customers-mobile.png)
_Card view with 44px touch targets and filter drawer_

### Calendar Page (Agenda View)
![Calendar Agenda](./docs/screenshots/calendar-agenda.png)
_Timeline view with color-coded event types_

### Left Navigation
![Navigation](./docs/screenshots/navigation.png)
_10-item sidebar with Orange-to-Purple gradient branding_

---

## Support & Feedback

**Documentation**: `/PHASE_11_PROGRESS_PART2.md`

**Issues**: https://github.com/all-inone/effinity-platform/issues

**Contact**: For staging creds or feature requests, contact platform team.

---

**Last Updated**: 2025-01-18
**Version**: 1.0.0 (Phase 11 - Productions Production Mode)
**Status**: Customers & Calendar implemented, remaining pages pending
