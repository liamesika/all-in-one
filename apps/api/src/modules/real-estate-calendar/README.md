# Real Estate Calendar API

## Overview

The Calendar Events API generates calendar events from existing Property and RealEstateLead data. It provides a unified interface for viewing upcoming viewings, follow-ups, tasks, and deadlines.

## Endpoints

### GET `/api/real-estate/calendar/events`

Retrieve calendar events within a date range.

#### Headers

- `x-org-id` (required): Organization ID for multi-tenant data scoping

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `startDate` | string | Yes | ISO date string (start of range) | `2025-01-01` |
| `endDate` | string | Yes | ISO date string (end of range) | `2025-01-31` |
| `eventTypes` | string | No | Comma-separated event types to filter | `property_viewing,follow_up` |

#### Event Types

- `property_viewing`: Scheduled property viewings (generated from recent leads)
- `follow_up`: Lead follow-up reminders (based on lead updates)
- `deadline`: Property listing renewal deadlines (30 days after update)
- `task_due`: Property update tasks (3 days after property update)

#### Response Schema

```typescript
{
  id: string;
  title: string;
  type: 'property_viewing' | 'task_due' | 'follow_up' | 'deadline';
  date: string; // ISO 8601 datetime
  status?: string; // 'scheduled', 'pending', 'upcoming', etc.
  propertyId?: string;
  propertyName?: string;
  leadId?: string;
  leadName?: string;
  notes?: string;
}[]
```

## Testing Examples

### 1. Get All Events for January 2025

```bash
curl -X GET "http://localhost:3000/api/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31" \
  -H "x-org-id: YOUR_ORG_ID"
```

### 2. Get Only Property Viewings and Follow-ups

```bash
curl -X GET "http://localhost:3000/api/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31&eventTypes=property_viewing,follow_up" \
  -H "x-org-id: YOUR_ORG_ID"
```

### 3. Get Events for Next 7 Days

```bash
START_DATE=$(date -u +"%Y-%m-%d")
END_DATE=$(date -u -v+7d +"%Y-%m-%d")

curl -X GET "http://localhost:3000/api/real-estate/calendar/events?startDate=$START_DATE&endDate=$END_DATE" \
  -H "x-org-id: YOUR_ORG_ID"
```

### 4. Filter by Single Event Type

```bash
curl -X GET "http://localhost:3000/api/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31&eventTypes=deadline" \
  -H "x-org-id: YOUR_ORG_ID"
```

## Event Generation Logic

### Property Viewing Events
- Source: `RealEstateLead` with `propertyId` set
- Date: 2 days after lead creation
- Filter: Leads created within date range

### Follow-up Events
- Source: `RealEstateLead` records
- Date: 1 day after last update
- Filter: Leads updated within date range

### Deadline Events
- Source: `Property` with status `PUBLISHED`
- Date: 30 days after last update
- Filter: Properties with upcoming deadlines in date range

### Task Due Events
- Source: `Property` with status `DRAFT` or `PUBLISHED`
- Date: 3 days after property update
- Filter: Properties updated within date range

## Database Schema Notes

### Multi-Tenant Safety
All queries are scoped by `ownerUid` (via `x-org-id` header):
- NEVER allows cross-tenant data leakage
- Empty array returned if no data found
- No errors for missing data (graceful degradation)

### Performance Optimizations
- Queries use indexed fields (`ownerUid`, `createdAt`, `updatedAt`)
- Limits applied: Max 50 leads per event type, 20-30 properties
- Date range filtering at database level
- Sorting performed in-memory after generation

## Error Handling

### 400 Bad Request
- Missing `x-org-id` header
- Missing `startDate` or `endDate`
- Invalid date format
- `endDate` before `startDate`
- Invalid `eventTypes` value

### Example Error Response
```json
{
  "statusCode": 400,
  "message": "Invalid event types: invalid_type. Valid types: property_viewing, task_due, follow_up, deadline",
  "error": "Bad Request"
}
```

## Integration with Frontend

### React/TypeScript Example

```typescript
interface CalendarEvent {
  id: string;
  title: string;
  type: 'property_viewing' | 'task_due' | 'follow_up' | 'deadline';
  date: string;
  status?: string;
  propertyId?: string;
  propertyName?: string;
  leadId?: string;
  leadName?: string;
  notes?: string;
}

async function fetchCalendarEvents(
  startDate: string,
  endDate: string,
  eventTypes?: string[]
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  if (eventTypes?.length) {
    params.set('eventTypes', eventTypes.join(','));
  }

  const response = await fetch(
    `/api/real-estate/calendar/events?${params}`,
    {
      headers: {
        'x-org-id': getOrgId(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  return response.json();
}

// Usage
const events = await fetchCalendarEvents('2025-01-01', '2025-01-31', [
  'property_viewing',
  'follow_up',
]);
```

## Future Enhancements

1. Real Task Model: Create dedicated Task table for actual task management
2. Status Field on Leads: Add explicit status tracking to RealEstateLead
3. Recurring Events: Support weekly/monthly recurring patterns
4. Notifications: Trigger email/SMS reminders for upcoming events
5. Calendar Sync: Integration with Google Calendar, Outlook, Apple Calendar
6. Event CRUD: Allow creating/updating/deleting custom events
7. Timezone Support: Convert dates to user's timezone
8. Pagination: Support cursor-based pagination for large result sets

## Architecture Notes

### Why Generate Events Dynamically?

Rather than storing calendar events in a separate table, we generate them on-the-fly from existing data:

**Advantages:**
- No data duplication
- Always reflects current state of leads/properties
- No sync issues between calendar and source data
- Simpler data model

**Trade-offs:**
- Slightly higher query cost (negligible for current scale)
- Limited to simple recurring patterns
- Cannot track event-specific state (e.g., "viewed", "completed")

For MVP, dynamic generation is ideal. As the system scales, consider:
- Caching frequently accessed date ranges
- Pre-generating events for next 30 days
- Migrating to dedicated Event table for custom events

## File Structure

```
apps/api/src/modules/real-estate-calendar/
├── real-estate-calendar.module.ts        # NestJS module definition
├── real-estate-calendar.controller.ts    # HTTP endpoint handlers
├── real-estate-calendar.service.ts       # Business logic for event generation
├── dto/
│   ├── calendar-events-query.dto.ts     # Query parameter validation
│   └── calendar-event.dto.ts            # Response type definition
└── README.md                            # This file
```

## Related APIs

- **GET /api/real-estate/leads**: Enhanced with `includePropertyCount` parameter
- **GET /api/real-estate/properties**: Source of property data
- **GET /api/real-estate/leads/:id**: Individual lead details

## Database Queries Executed

For each event type, the service executes:

1. **property_viewing**: `findMany` on `realEstateLead` with property relation
2. **follow_up**: `findMany` on `realEstateLead` with date filters
3. **deadline**: `findMany` on `property` with status and date filters
4. **task_due**: `findMany` on `property` with status and date filters

All queries include:
- `where: { ownerUid: orgId }` (multi-tenant isolation)
- Date range filtering
- Order by relevant timestamp
- Limit to prevent over-fetching

## Testing Checklist

- [ ] Empty date range returns empty array
- [ ] Invalid date format returns 400 error
- [ ] Missing x-org-id header returns 400 error
- [ ] Invalid eventTypes returns 400 error
- [ ] Cross-tenant data isolation verified
- [ ] Events sorted by date ascending
- [ ] All event types generate correctly
- [ ] Property and lead relations included
- [ ] Date math generates correct future dates
- [ ] Large date ranges perform acceptably

## Deployment Notes

No database migrations required. This feature uses existing schema:
- `Property` table (no changes)
- `RealEstateLead` table (no changes)

Simply deploy the new API module and it's ready to use.
