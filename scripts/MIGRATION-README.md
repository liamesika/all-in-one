# Organization Mode Migration Guide

This guide explains how to migrate the EFFINITY platform from individual user accounts to organization-scoped multi-tenancy.

## Overview

The migration involves:
1. **Database Schema Changes**: Adding Organization, Membership, Invite, and DomainClaim models
2. **Data Migration**: Creating personal organizations for existing users and migrating business data
3. **Zero-Downtime Approach**: Maintaining backward compatibility during transition

## Prerequisites

- [ ] Database backup created
- [ ] Feature flag `ORG_MODE_ENABLED=true` configured
- [ ] All environment variables configured (see `.env.example`)
- [ ] Staging environment tested

## Migration Steps

### 1. Apply Database Schema Changes

```bash
# Generate and apply the migration
yarn prisma migrate deploy

# Or for development
yarn prisma migrate dev --name add_organization_mode
```

### 2. Run Data Backfill Script

```bash
# Standard migration (recommended)
node scripts/backfill-organization-data.js

# Or for better performance on large datasets
node scripts/backfill-organization-data.js --raw-sql
```

### 3. Verify Migration

```bash
# Check migration status
node scripts/verify-organization-migration.js

# Run tests
yarn test
```

## What the Migration Does

### Organizations Created
- Creates a personal organization for each existing user
- Organization ID format: `org_{userId}`
- Organization slug format: `personal-{userId}`
- Default plan tier: `PERSONAL`
- Default seat limit: 1

### Memberships Created
- Creates OWNER membership for each user in their personal organization
- Membership ID format: `mem_{userId}`
- Status: `ACTIVE`
- Role: `OWNER`

### Business Data Migration
All business models get `orgId` field populated:
- **Properties**: `Property.orgId = org_{ownerUid}`
- **Real Estate Leads**: `RealEstateLead.orgId = org_{ownerUid}`
- **E-commerce Leads**: `EcommerceLead.orgId = org_{ownerUid}`
- **Campaigns**: `Campaign.orgId = org_{ownerUid}`
- **Followup Templates**: `AutoFollowupTemplate.orgId = org_{ownerUid}`

### Backward Compatibility
- All existing `ownerUid` fields remain unchanged
- API endpoints continue to work during transition
- Gradual migration to `orgId` queries

## Database Schema Changes

### New Models

```prisma
model Organization {
  id                String            @id @default(cuid())
  ownerUid          String            @unique // Backward compatibility
  name              String
  slug              String            @unique
  seatLimit         Int               @default(5)
  usedSeats         Int               @default(1)
  planTier          OrganizationTier  @default(STARTER)
  ownerUserId       String
  domainAllowlist   String[]          @default([])
  // ... relations and indexes
}

model Membership {
  id           String           @id @default(cuid())
  userId       String
  orgId        String
  ownerUid     String           // Backward compatibility
  role         MembershipRole   @default(MEMBER)
  status       MembershipStatus @default(ACTIVE)
  // ... additional fields
}

model Invite {
  id        String      @id @default(cuid())
  orgId     String
  email     String
  role      MembershipRole @default(MEMBER)
  token     String      @unique
  status    InviteStatus   @default(SENT)
  expiresAt DateTime
  // ... additional fields
}

model DomainClaim {
  id                String   @id @default(cuid())
  orgId             String
  domain            String
  verificationToken String   @unique
  verified          Boolean  @default(false)
  // ... additional fields
}
```

### Enhanced Models

All business models now include:
```prisma
model SomeBusinessModel {
  // ... existing fields
  orgId        String? // Organization scope (nullable during migration)
  organization Organization? @relation(fields: [orgId], references: [id])

  // Organization-scoped indexes
  @@index([orgId])
  @@index([orgId, status])
  // ... other org-scoped indexes
}
```

### New Enums

```prisma
enum MembershipRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}

enum MembershipStatus {
  INVITED
  ACTIVE
  SUSPENDED
}

enum InviteStatus {
  SENT
  ACCEPTED
  EXPIRED
  REVOKED
}

enum OrganizationTier {
  PERSONAL
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

## Rollback Plan

If rollback is needed:

1. **Disable Feature Flag**:
   ```bash
   ORG_MODE_ENABLED=false
   ```

2. **Revert Database Migration**:
   ```bash
   yarn prisma migrate reset --force
   # Then apply previous migration state
   ```

3. **Restore from Backup**:
   ```bash
   # Restore database from backup taken before migration
   pg_restore -d database_name backup_file.sql
   ```

## Verification Checklist

- [ ] All users have personal organizations
- [ ] All users have OWNER memberships
- [ ] All business data has `orgId` populated
- [ ] No `NULL` values in `orgId` fields (after migration complete)
- [ ] Existing API endpoints still work
- [ ] Dashboard data displays correctly
- [ ] Performance is acceptable

## Troubleshooting

### Common Issues

1. **Foreign Key Violations**:
   - Ensure organizations are created before migrating business data
   - Check that `orgId` values match existing organization IDs

2. **Duplicate Slug Errors**:
   - Organization slugs must be unique
   - Script handles conflicts automatically

3. **Memory Issues (Large Datasets)**:
   - Use `--raw-sql` flag for better performance
   - Process data in batches

4. **Timeout Issues**:
   - Increase database connection timeout
   - Run migration during low-traffic periods

### Debug Commands

```bash
# Check organization count
echo "SELECT COUNT(*) FROM \"Organization\";" | psql $DATABASE_URL

# Check membership count
echo "SELECT COUNT(*) FROM \"Membership\";" | psql $DATABASE_URL

# Check unmigrated records
echo "SELECT COUNT(*) FROM \"Property\" WHERE \"orgId\" IS NULL;" | psql $DATABASE_URL
```

## Post-Migration Tasks

1. **Update API Layer**: Implement organization scoping middleware
2. **Update Frontend**: Add organization switcher UI
3. **Update Tests**: Add organization context to tests
4. **Monitor Performance**: Check query performance with new indexes
5. **Update Documentation**: Update API documentation with organization endpoints

## Support

For issues during migration:
1. Check logs in `migration-{timestamp}.log`
2. Run verification script
3. Check database constraints and indexes
4. Contact development team with error details