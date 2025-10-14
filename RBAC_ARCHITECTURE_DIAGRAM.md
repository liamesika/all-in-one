# RBAC System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐        ┌──────────────────┐                       │
│  │  React Component │        │  Permission Hook │                       │
│  │  with Gate       │───────>│  usePermission() │                       │
│  └──────────────────┘        └──────────────────┘                       │
│           │                            │                                 │
│           │                            │ Fetches                         │
│           ▼                            ▼                                 │
│  ┌────────────────────────────────────────────────┐                     │
│  │       <PermissionGate permission="...">        │                     │
│  │         {children}                             │                     │
│  │       </PermissionGate>                        │                     │
│  └────────────────────────────────────────────────┘                     │
│                            │                                             │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │ HTTP Request
                             │ Headers: x-user-id, x-org-id
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ GET /api/permissions/check                               │            │
│  │ GET /api/permissions/me                                  │            │
│  └─────────────────────────────────────────────────────────┘            │
│                            │                                             │
│                            │                                             │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ Protected API Route                                      │            │
│  │ export async function GET(request) {                     │            │
│  │   return withPermissions(                                │            │
│  │     request,                                             │            │
│  │     ['LEADS_READ'],                                      │            │
│  │     async (req, context) => { ... }                      │            │
│  │   );                                                     │            │
│  │ }                                                        │            │
│  └─────────────────────────────────────────────────────────┘            │
│                            │                                             │
│                            │ Middleware                                  │
│                            ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ requirePermission(...permissions)                        │            │
│  │   1. Extract userId, orgId from headers                 │            │
│  │   2. Call PermissionChecker                              │            │
│  │   3. Return 403 if denied, null if granted              │            │
│  └─────────────────────────────────────────────────────────┘            │
│                            │                                             │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PERMISSION CHECKER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ PermissionChecker.checkPermission(userId, orgId, perm)  │            │
│  │                                                          │            │
│  │ 1. Get Membership + Organization + Subscription         │─────┐      │
│  │                                                          │     │      │
│  │ 2. Verify membership.status === 'ACTIVE'               │     │      │
│  │                                                          │     │      │
│  │ 3. Verify subscription.status === 'ACTIVE'             │     │      │
│  │                                                          │     │      │
│  │ 4. Check plan permissions (from config)                 │     │      │
│  │    ├─> getPlanPermissions(subscription.plan)           │     │      │
│  │    └─> includes(permission)?                            │     │      │
│  │                                                          │     │      │
│  │ 5. Check role permissions (from config)                 │     │      │
│  │    ├─> ROLE_PERMISSIONS[membership.role]               │     │      │
│  │    └─> includes(permission)?                            │     │      │
│  │                                                          │     │      │
│  │ 6. Apply custom permissions (from database)             │     │      │
│  │    ├─> Check for grant: customPermissions[]            │     │      │
│  │    └─> Check for deny: customPermissions['!perm']      │     │      │
│  │                                                          │     │      │
│  │ Return: boolean                                          │     │      │
│  └─────────────────────────────────────────────────────────┘     │      │
│                                                                   │      │
└───────────────────────────────────────────────────────────────────┼──────┘
                                                                    │
                                                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (PostgreSQL)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐       ┌──────────────────┐                        │
│  │   Membership     │       │  Organization    │                        │
│  ├──────────────────┤       ├──────────────────┤                        │
│  │ id               │       │ id               │                        │
│  │ userId           │       │ name             │                        │
│  │ orgId            │───────│ slug             │                        │
│  │ role             │       │ ownerUserId      │                        │
│  │ status           │       └──────────────────┘                        │
│  │ customPermissions│                 │                                 │
│  │ invitedBy        │                 │                                 │
│  │ joinedAt         │                 │                                 │
│  └──────────────────┘                 │                                 │
│                                       │                                 │
│                                       │                                 │
│                                       ▼                                 │
│                            ┌──────────────────┐                         │
│                            │  Subscription    │                         │
│                            ├──────────────────┤                         │
│                            │ id               │                         │
│                            │ orgId            │                         │
│                            │ plan             │◄────┐                   │
│                            │ status           │     │                   │
│                            │ userSeats        │     │                   │
│                            │ leadLimit        │     │                   │
│                            └──────────────────┘     │                   │
│                                                     │                   │
│                                                     │                   │
│                                          ┌──────────────────┐           │
│                                          │ PlanPermissions  │           │
│                                          ├──────────────────┤           │
│                                          │ id               │           │
│                                          │ plan  ───────────┘           │
│                                          │ permissions      │           │
│                                          │  (JSONB array)   │           │
│                                          └──────────────────┘           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Permission Evaluation Logic

```
START: checkPermission(userId, orgId, permission)
│
├─> Get Membership (userId + orgId)
│   │
│   ├─> NOT FOUND? ──────────> DENY (No membership)
│   │
│   └─> membership.status !== 'ACTIVE'? ──> DENY (Inactive member)
│
├─> Get Organization.Subscription
│   │
│   ├─> NOT FOUND? ──────────> DENY (No subscription)
│   │
│   └─> subscription.status !== 'ACTIVE'? ──> DENY (Inactive subscription)
│
├─> Check PLAN Permissions
│   │
│   ├─> getPlanPermissions(subscription.plan)
│   │   │
│   │   ├─> BASIC: [8 permissions]
│   │   ├─> PRO: [BASIC + 19 more]
│   │   ├─> AGENCY: [PRO + 14 more]
│   │   └─> ENTERPRISE: [AGENCY + 4 more]
│   │
│   └─> permission NOT in plan? ──> DENY (Plan doesn't include feature)
│
├─> Check ROLE Permissions
│   │
│   ├─> ROLE_PERMISSIONS[membership.role]
│   │   │
│   │   ├─> OWNER: [ALL 42 permissions]
│   │   ├─> ADMIN: [ALL except ORG_BILLING]
│   │   ├─> MANAGER: [28 permissions]
│   │   ├─> MEMBER: [9 permissions]
│   │   └─> VIEWER: [4 read-only permissions]
│   │
│   └─> permission NOT in role? ──> DENY (Role doesn't grant permission)
│
├─> Check CUSTOM Permissions (Optional Override)
│   │
│   ├─> customPermissions includes `permission`? ──> GRANT (Explicit grant)
│   │
│   └─> customPermissions includes `!permission`? ──> DENY (Explicit denial)
│
└─> GRANT (All checks passed)
```

## Data Flow: User Action to Database

```
1. User clicks "Delete Lead" button
   │
   ▼
2. PermissionGate wraps button
   │
   ├─> usePermission('LEADS_DELETE') hook
   │   │
   │   └─> Fetches: POST /api/permissions/check
   │       │
   │       └─> Returns: { hasPermission: true/false }
   │
   ├─> hasPermission === false?
   │   │
   │   └─> Show <UpgradePrompt /> instead of button
   │
   └─> hasPermission === true?
       │
       └─> Render button
           │
           ▼
3. User clicks button
   │
   ▼
4. DELETE /api/real-estate/leads/[id]
   │
   ├─> withPermissions(request, ['LEADS_DELETE'], handler)
   │   │
   │   ├─> Extract userId, orgId from headers
   │   │
   │   ├─> requirePermission('LEADS_DELETE')
   │   │   │
   │   │   ├─> PermissionChecker.checkPermission()
   │   │   │   │
   │   │   │   ├─> Query: Membership + Organization + Subscription
   │   │   │   │
   │   │   │   ├─> Verify: status, plan, role
   │   │   │   │
   │   │   │   └─> Return: boolean
   │   │   │
   │   │   ├─> Permission denied? ──> Return 403 Error
   │   │   │
   │   │   └─> Permission granted? ──> Continue
   │   │
   │   └─> Call handler(request, { userId, orgId })
   │
   ▼
5. Handler executes
   │
   ├─> prisma.realEstateLead.delete({
   │     where: { id, orgId }  // ← ALWAYS scope by orgId
   │   })
   │
   └─> Return 200 OK
```

## Configuration Inheritance

```
PLAN PERMISSIONS (Inherited)
│
├─> BASIC
│   └─> [LEADS_READ, LEADS_WRITE, PROPERTIES_READ, ...]
│
├─> PRO
│   ├─> Inherits: ALL BASIC permissions
│   └─> Adds: [LEADS_DELETE, AUTOMATIONS_READ, ...]
│
├─> AGENCY
│   ├─> Inherits: ALL PRO permissions (which includes BASIC)
│   └─> Adds: [API_ACCESS, WHITE_LABEL, ...]
│
└─> ENTERPRISE
    ├─> Inherits: ALL AGENCY permissions (which includes PRO + BASIC)
    └─> Adds: [CUSTOM_INTEGRATIONS, DEDICATED_SUPPORT, ORG_BILLING]


ROLE PERMISSIONS (Fixed per role)
│
├─> OWNER: [ALL 42 permissions]
│
├─> ADMIN: [ALL except ORG_BILLING]
│
├─> MANAGER: [28 permissions - team mgmt + operations]
│
├─> MEMBER: [9 permissions - basic read/write]
│
└─> VIEWER: [4 permissions - read-only]


EFFECTIVE PERMISSIONS = PLAN ∩ ROLE ± CUSTOM
│
│ 1. Get permissions available in plan (with inheritance)
│ 2. Filter by permissions granted to role
│ 3. Apply custom permission overrides
│    ├─> Add explicitly granted permissions
│    └─> Remove explicitly denied permissions
│
└─> Result: Set of permissions user has
```

## Component Hierarchy

```
Frontend Application
│
├─> App Shell
│   ├─> Header
│   │   └─> <IfHasPermission permission="ORG_SETTINGS">
│   │         <SettingsButton />
│   │       </IfHasPermission>
│   │
│   └─> Sidebar
│       ├─> <PermissionGate permission="LEADS_READ">
│       │     <LeadsLink />
│       │   </PermissionGate>
│       │
│       ├─> <PermissionGate permission="CAMPAIGNS_READ">
│       │     <CampaignsLink />
│       │   </PermissionGate>
│       │
│       └─> <PermissionGate permission="AUTOMATIONS_READ" showUpgradePrompt>
│             <AutomationsLink />
│           </PermissionGate>
│
├─> Leads Page
│   ├─> <PermissionGate permission="LEADS_READ">
│   │     <LeadsList />
│   │   </PermissionGate>
│   │
│   ├─> <PermissionGate permission="LEADS_WRITE">
│   │     <CreateLeadButton />
│   │   </PermissionGate>
│   │
│   └─> <PermissionGate permission="LEADS_EXPORT" showUpgradePrompt>
│         <ExportButton />
│       </PermissionGate>
│
├─> Organization Settings
│   ├─> <PermissionGate permission="ORG_MEMBERS_READ">
│   │     <MemberList
│   │       onRoleChange={...}      ← Requires ORG_MEMBERS_WRITE
│   │       onRemoveMember={...}    ← Requires ORG_MEMBERS_DELETE
│   │       onInviteMember={...}    ← Requires ORG_INVITE_MEMBERS
│   │     />
│   │   </PermissionGate>
│   │
│   └─> <PermissionGate permission="ORG_SETTINGS">
│         <OrganizationSettings />
│       </PermissionGate>
│
└─> Billing Page
    └─> <PermissionGate permission="ORG_BILLING">
          <BillingDashboard />
          <InvoicesList />
          <UpgradeOptions />
        </PermissionGate>
```

## Permission Check Flow Visualization

```
API Request with Headers
    │
    ├─> x-user-id: "user-abc"
    └─> x-org-id: "org-xyz"
    │
    ▼
┌──────────────────────────┐
│ withPermissions wrapper  │
├──────────────────────────┤
│ 1. Extract auth context  │
│ 2. Call permission check │
│ 3. Execute handler       │
└──────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ PermissionChecker               │
├─────────────────────────────────┤
│ Query: Membership               │
│   ├─> userId = "user-abc"      │
│   └─> orgId = "org-xyz"        │
│                                 │
│ Result:                         │
│ {                               │
│   id: "mem-123",                │
│   userId: "user-abc",           │
│   orgId: "org-xyz",             │
│   role: "ADMIN",                │
│   status: "ACTIVE",             │
│   customPermissions: null,      │
│   organization: {               │
│     subscription: {             │
│       plan: "PRO",              │
│       status: "ACTIVE"          │
│     }                           │
│   }                             │
│ }                               │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Permission Evaluation           │
├─────────────────────────────────┤
│ Check: LEADS_DELETE             │
│                                 │
│ 1. membership.status?           │
│    ✓ ACTIVE                     │
│                                 │
│ 2. subscription.status?         │
│    ✓ ACTIVE                     │
│                                 │
│ 3. Plan includes permission?    │
│    getPlanPermissions('PRO')    │
│    ✓ LEADS_DELETE in PRO        │
│                                 │
│ 4. Role includes permission?    │
│    ROLE_PERMISSIONS['ADMIN']    │
│    ✓ LEADS_DELETE in ADMIN      │
│                                 │
│ 5. Custom overrides?            │
│    ✓ None (customPermissions    │
│      is null)                   │
│                                 │
│ Result: GRANT ✓                 │
└─────────────────────────────────┘
    │
    ▼
Execute Handler
    │
    └─> Database Query with orgId scope
```

## Multi-Tenant Security Architecture

```
┌─────────────────────────────────────────┐
│            Request Context              │
│  Headers: x-user-id, x-org-id           │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│     Membership Verification             │
│  • User must be member of org           │
│  • Membership status must be ACTIVE     │
│  • No cross-org access                  │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│     Permission Verification             │
│  • Check plan-level permissions         │
│  • Check role-level permissions         │
│  • Apply custom overrides               │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│        Data Scoping (CRITICAL)          │
│  ALL queries MUST filter by orgId:      │
│                                         │
│  ✓ findMany({ where: { orgId } })      │
│  ✓ update({ where: { id, orgId } })    │
│  ✓ delete({ where: { id, orgId } })    │
│                                         │
│  ✗ NEVER query without orgId filter    │
└─────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ Multi-layered security (membership, subscription, plan, role, custom)
- ✅ Proper data isolation (always scope by orgId)
- ✅ Clear permission evaluation flow
- ✅ Flexible permission overrides
- ✅ Performance optimized (indexed queries)
- ✅ Scalable for growth
