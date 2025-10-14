# RBAC Implementation Guide

This guide shows how to apply role-based permission guards to API routes.

## Overview

The RBAC system is now implemented with:
- Database schema with `FeatureAccess` enum and enhanced `Membership` model
- Permission configuration at `/apps/web/config/permissions.ts`
- Permission checker library at `/apps/web/lib/permissions.ts`
- Middleware at `/apps/web/middleware/permissions.ts`
- Frontend hooks at `/apps/web/hooks/usePermission.ts`
- UI components at `/apps/web/components/permissions/`

## Applying Permission Guards to API Routes

### Method 1: Using `withPermissions` wrapper

This is the recommended approach for most routes:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/middleware/permissions';

export async function GET(request: NextRequest) {
  return withPermissions(
    request,
    ['LEADS_READ'], // Required permissions
    async (req, context) => {
      const { userId, orgId } = context;

      // Your route logic here with guaranteed auth context
      const leads = await prisma.realEstateLead.findMany({
        where: { orgId },
      });

      return NextResponse.json({ leads });
    }
  );
}

export async function POST(request: NextRequest) {
  return withPermissions(
    request,
    ['LEADS_WRITE'],
    async (req, context) => {
      const { userId, orgId } = context;
      const body = await req.json();

      const lead = await prisma.realEstateLead.create({
        data: {
          ...body,
          orgId,
          ownerUid: orgId, // Backward compatibility
        },
      });

      return NextResponse.json({ lead });
    }
  );
}

export async function DELETE(request: NextRequest) {
  return withPermissions(
    request,
    ['LEADS_DELETE'],
    async (req, context) => {
      const { orgId } = context;
      const { id } = await req.json();

      await prisma.realEstateLead.delete({
        where: { id, orgId },
      });

      return NextResponse.json({ success: true });
    }
  );
}
```

### Method 2: Using middleware directly

For more control over error handling:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, getAuthContext } from '@/middleware/permissions';

export async function GET(request: NextRequest) {
  // Check permission
  const permCheck = await requirePermission('LEADS_READ')(request);
  if (permCheck) return permCheck; // Returns 403 if permission denied

  // Get auth context
  const authContext = getAuthContext(request);
  if (!authContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, orgId } = authContext;

  // Your route logic
  const leads = await prisma.realEstateLead.findMany({
    where: { orgId },
  });

  return NextResponse.json({ leads });
}
```

### Method 3: Using role-based guards

For routes that require specific roles:

```typescript
import { withRole } from '@/middleware/permissions';

export async function POST(request: NextRequest) {
  return withRole(
    request,
    ['OWNER', 'ADMIN'], // Only owners and admins
    async (req, context) => {
      // Your admin-only logic
      return NextResponse.json({ success: true });
    }
  );
}
```

## Permission Mapping by Feature

### Leads Management
- `GET /api/real-estate/leads` → `LEADS_READ`
- `POST /api/real-estate/leads` → `LEADS_WRITE`
- `DELETE /api/real-estate/leads/[id]` → `LEADS_DELETE`
- `POST /api/real-estate/leads/export` → `LEADS_EXPORT`
- `POST /api/real-estate/leads/bulk` → `LEADS_BULK_ACTIONS`

### Properties
- `GET /api/real-estate/properties` → `PROPERTIES_READ`
- `POST /api/real-estate/properties` → `PROPERTIES_WRITE`
- `DELETE /api/real-estate/properties/[id]` → `PROPERTIES_DELETE`
- `POST /api/real-estate/properties/[id]/publish` → `PROPERTIES_PUBLISH`
- `POST /api/real-estate/properties/[id]/assign-agent` → `PROPERTIES_ASSIGN_AGENT`

### Campaigns
- `GET /api/real-estate/campaigns` → `CAMPAIGNS_READ`
- `POST /api/real-estate/campaigns` → `CAMPAIGNS_WRITE`
- `DELETE /api/real-estate/campaigns/[id]` → `CAMPAIGNS_DELETE`
- `POST /api/real-estate/campaigns/[id]/activate` → `CAMPAIGNS_ACTIVATE`
- `GET /api/real-estate/campaigns/[id]/analytics` → `CAMPAIGNS_VIEW_ANALYTICS`

### Automations
- `GET /api/real-estate/automations` → `AUTOMATIONS_READ`
- `POST /api/real-estate/automations` → `AUTOMATIONS_WRITE`
- `DELETE /api/real-estate/automations/[id]` → `AUTOMATIONS_DELETE`
- `POST /api/real-estate/automations/execute` → `AUTOMATIONS_EXECUTE`

### Integrations
- `GET /api/real-estate/integrations` → `INTEGRATIONS_READ`
- `POST /api/real-estate/integrations` → `INTEGRATIONS_WRITE`
- `DELETE /api/real-estate/integrations/[id]` → `INTEGRATIONS_DELETE`
- `POST /api/real-estate/integrations/[id]/sync` → `INTEGRATIONS_SYNC`

### Organization Management
- `GET /api/organizations/members` → `ORG_MEMBERS_READ`
- `POST /api/organizations/members` → `ORG_INVITE_MEMBERS`
- `PATCH /api/organizations/members/[id]` → `ORG_MEMBERS_WRITE`
- `DELETE /api/organizations/members/[id]` → `ORG_MEMBERS_DELETE`
- `GET /api/billing` → `ORG_BILLING`

## Frontend Permission Usage

### Using Permission Gates in Components

```tsx
import { PermissionGate } from '@/components/permissions/PermissionGate';

function MyComponent() {
  return (
    <PermissionGate permission="LEADS_DELETE">
      <button onClick={handleDelete}>Delete Lead</button>
    </PermissionGate>
  );
}
```

### Using Permission Hooks

```tsx
import { usePermission } from '@/hooks/usePermission';

function MyComponent() {
  const { hasPermission, isLoading } = usePermission('LEADS_EXPORT');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {hasPermission && (
        <button onClick={handleExport}>Export Leads</button>
      )}
    </div>
  );
}
```

### Using Role Hooks

```tsx
import { useRole } from '@/hooks/usePermission';

function AdminPanel() {
  const { isOwner, isAdmin, isLoading } = useRole();

  if (isLoading) return <div>Loading...</div>;

  if (!isOwner && !isAdmin) {
    return <div>Access denied</div>;
  }

  return <div>Admin content</div>;
}
```

## Testing Permission Guards

### Manual Testing Checklist

1. Test each role (OWNER, ADMIN, MANAGER, MEMBER, VIEWER)
2. Test plan-based restrictions (BASIC, PRO, AGENCY, ENTERPRISE)
3. Test permission denials return 403
4. Test UI hides features without permission
5. Test upgrade prompts show for plan-gated features

### Test with curl

```bash
# Test with user and org headers
curl -X GET http://localhost:3000/api/real-estate/leads \
  -H "x-user-id: user-123" \
  -H "x-org-id: org-456"

# Should return 403 if user lacks LEADS_READ permission
```

## Migration Checklist

For each API route:
1. Identify the feature/resource being accessed
2. Choose appropriate permission(s) from `FeatureAccess` enum
3. Apply permission guard using one of the methods above
4. Test with different roles
5. Update frontend to use permission gates
6. Document in this guide

## Common Patterns

### Multiple Permissions

```typescript
// Require ALL permissions
return withPermissions(
  request,
  ['CAMPAIGNS_WRITE', 'CAMPAIGNS_MANAGE_BUDGET'],
  async (req, context) => {
    // Logic
  }
);
```

### Conditional Permissions

```typescript
export async function PATCH(request: NextRequest) {
  const { userId, orgId } = getAuthContext(request)!;
  const body = await request.json();

  // Different permissions based on action
  if (body.status === 'PUBLISHED') {
    const permCheck = await requirePermission('PROPERTIES_PUBLISH')(request);
    if (permCheck) return permCheck;
  } else {
    const permCheck = await requirePermission('PROPERTIES_WRITE')(request);
    if (permCheck) return permCheck;
  }

  // Continue with update
}
```

### Custom Permission Overrides

Admins can grant custom permissions to users via the database:

```sql
UPDATE "Membership"
SET "customPermissions" = '["LEADS_DELETE", "CAMPAIGNS_ACTIVATE"]'
WHERE "userId" = 'user-123' AND "orgId" = 'org-456';

-- To deny a permission (even if role normally has it):
UPDATE "Membership"
SET "customPermissions" = '["!LEADS_DELETE"]'
WHERE "userId" = 'user-789' AND "orgId" = 'org-456';
```

## Security Best Practices

1. ALWAYS check permissions on the backend (API routes)
2. Use frontend permission gates only for UX, not security
3. ALWAYS scope queries by orgId
4. Log permission denials for audit trails
5. Never trust client-side headers - validate against database
6. Use role-based guards for administrative functions
7. Keep custom permissions minimal and well-documented
