# Organization Mode Implementation

This document outlines the implementation of Organization Mode for the EFFINITY platform, enabling multi-tenant organization management with role-based access control (RBAC).

## Overview

Organization Mode transforms the platform from individual user accounts to a multi-tenant system where:
- Users can register as **Individual** or **Company**
- Companies create Organizations with multiple members
- All business data is organization-scoped
- Role-based permissions control access levels
- Zero-downtime migration maintains backward compatibility

## Architecture

### Database Models

#### Core Organization Models
- `Organization`: Company/org entity with seat limits and configuration
- `Membership`: User-Organization relationship with roles and status
- `Invite`: Pending invitations to join organizations
- `DomainClaim`: Domain verification for automatic user joining

#### Existing Models Enhanced
All business models get `orgId` foreign key:
- Real Estate: `Property`, `RealEstateLead`, `SearchJob`, `Listing`
- E-commerce: `EcommerceLead`, `Campaign`, `AutoFollowupTemplate`
- Law: `LawMatter`, `LawClient`

### RBAC Roles

| Role | Permissions |
|------|-------------|
| **OWNER** | Full control: billing, seat management, delete org |
| **ADMIN** | Manage team, invites, settings (except billing) |
| **MANAGER** | View all data, manage specific verticals |
| **MEMBER** | Access assigned data, limited management |
| **VIEWER** | Read-only access to org data |

### API Endpoints

#### Authentication & Registration
- `POST /api/auth/register` - Register individual or company
- `GET /api/me/memberships` - User's organizations and roles

#### Organization Management
- `POST /api/orgs` - Create organization
- `GET /api/orgs/:id` - Organization details
- `PATCH /api/orgs/:id` - Update organization settings

#### Team Management
- `GET /api/orgs/:id/users` - List organization members
- `PATCH /api/orgs/:id/users/:userId` - Update member role/status
- `POST /api/orgs/:id/invite` - Send invitations
- `POST /api/orgs/:id/seed-users` - Create users with temp passwords

#### Domain Management
- `POST /api/orgs/:id/domains` - Claim domain
- `POST /api/orgs/:id/domains/verify` - Verify domain ownership

## User Flows

### Company Registration Flow
1. **Account Type Selection**: Individual vs Company
2. **Company Details**: Name, seat limit, domain (optional)
3. **Team Setup**:
   - Email invitations (recommended)
   - CSV upload for bulk invites
   - Temporary passwords (optional, with forced change)
4. **Review & Confirm**
5. **Success**: Redirect to `/org/admin`

### Employee Onboarding Flow
1. **Invitation Email**: Magic link to join organization
2. **Account Creation**: If no existing account
3. **Accept Invitation**: Join organization with assigned role
4. **First Login**: Access organization dashboard

### Domain-based Auto-join Flow
1. **Domain Verification**: Admin verifies domain ownership
2. **Employee Registration**: User registers with verified domain email
3. **Automatic Membership**: User automatically joins organization

## Frontend Implementation

### New Routes
- `/register` - Enhanced stepper with company option
- `/org/admin` - Organization admin dashboard
- `/org/admin/overview` - KPIs and activity overview
- `/org/admin/team` - Team and seat management
- `/org/admin/invites` - Invitation management
- `/org/admin/domains` - Domain verification
- `/org/admin/billing` - Plan and billing management
- `/org/admin/audit` - Activity audit log

### UI Components
- Organization switcher in top navigation
- Role-based permission guards
- Responsive tables for team management
- Invitation status indicators
- Seat usage progress indicators

### Internationalization
- Full Hebrew (RTL) and English support
- Localized email templates
- RTL-compatible layouts

## Security Considerations

### Data Isolation
- All queries scoped by `orgId`
- Middleware enforces organization context
- No cross-organization data access

### Authentication
- Firebase integration for user management
- Custom claims for organization roles
- JWT tokens with organization context

### Authorization
- RBAC guards on all sensitive operations
- Role-based UI component rendering
- API endpoint protection

### Audit Logging
- All organization changes logged
- Member role changes tracked
- Invitation activities recorded

## Migration Strategy

### Zero-Downtime Approach
1. **Schema Changes**: Add new models, add `orgId` to existing
2. **Data Backfill**: Create personal orgs for existing users
3. **Backward Compatibility**: Maintain `ownerUid` during transition
4. **Feature Flag**: Gradual rollout with `ORG_MODE_ENABLED`
5. **Legacy Cleanup**: Remove `ownerUid` after full migration

### Backfill Process
```sql
-- Create personal organization for each existing user
INSERT INTO "Organization" (id, name, slug, "seatLimit", "usedSeats", "planTier", "ownerUserId")
SELECT
  'org_' || id,
  'Personal Organization',
  'personal_' || id,
  1,
  1,
  'PERSONAL',
  id
FROM "User";

-- Create owner membership for each user
INSERT INTO "Membership" (id, "userId", "orgId", role, status)
SELECT
  'mem_' || u.id,
  u.id,
  'org_' || u.id,
  'OWNER',
  'ACTIVE'
FROM "User" u;

-- Backfill orgId for all business data
UPDATE "Property" SET "orgId" = 'org_' || (SELECT id FROM "User" WHERE "User".id = "Property"."ownerUid"::text);
-- Repeat for all business models...
```

## Testing Strategy

### Unit Tests
- RBAC guard functionality
- Organization scoping middleware
- Invitation email generation
- Role permission checks

### Integration Tests
- Complete registration flows
- Organization creation and management
- Team member lifecycle
- Domain verification process

### E2E Tests (Playwright)
- Company registration → invite → accept → dashboard
- Organization switching affects all pages
- Role-based access control enforcement
- Mobile responsive behavior

### QA Scenarios
- Individual vs Company registration paths
- All RBAC roles with appropriate permissions
- Invitation flows (email and temp password)
- Domain claiming and verification
- Data isolation between organizations
- Regression testing for existing features

## Deployment

### Environment Variables
```bash
# Feature Flag
ORG_MODE_ENABLED=true

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email

# Email Provider
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key

# Invite Settings
INVITE_LINK_BASE_URL=https://your-domain.com
CSV_SIGNING_SECRET=your-signing-secret
```

### Rollout Plan
1. **Staging Deployment**: Full feature testing
2. **Demo Environment**: Sales team preparation
3. **Production Rollout**: Gradual feature flag enablement
4. **Monitoring**: 48h stability monitoring
5. **Full Activation**: Feature flag to 100%

## Monitoring & Analytics

### Key Metrics
- Organization creation rate
- Invitation acceptance rate
- Seat utilization across plans
- Role distribution per organization
- Feature adoption by organization size

### Events Tracked
- `org_created`: New organization registered
- `invite_sent`: Invitation sent to user
- `invite_accepted`: User joined organization
- `seat_limit_reached`: Organization hit seat limit
- `role_changed`: Member role updated
- `domain_verified`: Domain verification completed

### Alerting
- Failed invitation deliveries
- Organization creation errors
- High seat limit breach rate
- Authentication/authorization failures

## Support Playbook

### Common Admin Tasks
- **Add Member**: Send invitation or create temp password user
- **Change Role**: Update membership role via admin dashboard
- **Remove Member**: Suspend or delete membership
- **Domain Issues**: Re-verify domain or update DNS
- **Seat Limit**: Upgrade plan or remove inactive members

### Troubleshooting
- **Invite Expired**: Generate new invitation link
- **Domain Not Verified**: Check DNS TXT record
- **Permission Denied**: Verify user role and organization context
- **Data Missing**: Check organization switching in UI

This implementation ensures a smooth transition to organization mode while maintaining all existing functionality and providing a foundation for enterprise features.