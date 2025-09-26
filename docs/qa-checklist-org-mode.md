# QA Checklist - Organization Mode

## Pre-Testing Setup

- [ ] Feature flag `ORG_MODE_ENABLED=true` in test environment
- [ ] Database migrations applied successfully
- [ ] Seed data includes both individual and organization accounts
- [ ] Email provider configured for invitation testing
- [ ] Test accounts created for different roles

## Phase 1: Registration & Account Creation

### Individual Registration
- [ ] Individual registration flow works unchanged
- [ ] Existing individual users can still log in
- [ ] Individual users see personal data only
- [ ] Individual users can upgrade to organization later

### Company Registration
- [ ] Company registration form displays correctly
- [ ] Company details validation works (name, domain, seats)
- [ ] Seat limit selection functions properly
- [ ] Email list input accepts multiple emails
- [ ] CSV upload for bulk email import works
- [ ] Form validation prevents invalid submissions
- [ ] Success redirects to organization admin dashboard

## Phase 2: Organization Management

### Organization Dashboard
- [ ] Admin dashboard loads with correct data
- [ ] Overview tab shows accurate KPIs
- [ ] Seat usage displays correctly
- [ ] Recent activity log shows relevant events
- [ ] Navigation between admin sections works

### Team Management
- [ ] Team list displays all organization members
- [ ] Role assignments show correctly
- [ ] Member status (active/invited/suspended) accurate
- [ ] Add member functionality works
- [ ] Remove member functionality works
- [ ] Role change functionality works
- [ ] Seat counter updates correctly

### Invitation System
- [ ] Email invitations send successfully
- [ ] Invitation emails contain correct content and links
- [ ] Invitation links work and redirect properly
- [ ] Invitation expiration handled correctly
- [ ] Resend invitation functionality works
- [ ] Cancel invitation functionality works
- [ ] Invitation status updates in dashboard

## Phase 3: Role-Based Access Control (RBAC)

### Owner Role
- [ ] Can access all organization settings
- [ ] Can manage billing and seats
- [ ] Can delete organization
- [ ] Can assign/change all roles
- [ ] Can view all organization data

### Admin Role
- [ ] Can manage team and invites
- [ ] Can change organization settings
- [ ] Cannot access billing
- [ ] Cannot delete organization
- [ ] Can view all organization data

### Manager Role
- [ ] Can view all organization data
- [ ] Can manage specific verticals assigned
- [ ] Cannot manage team or settings
- [ ] Has appropriate UI restrictions

### Member Role
- [ ] Can access assigned data only
- [ ] Cannot access admin functions
- [ ] Has limited management capabilities
- [ ] UI shows appropriate restrictions

### Viewer Role
- [ ] Read-only access to organization data
- [ ] Cannot modify any data
- [ ] All edit buttons/forms are hidden
- [ ] Navigation reflects read-only status

## Phase 4: Data Isolation & Multi-tenancy

### Organization Switching
- [ ] Organization switcher appears for multi-org users
- [ ] Switching organizations changes all data views
- [ ] Dashboard data updates correctly
- [ ] Navigation context updates
- [ ] No data leakage between organizations

### Data Scoping
- [ ] Real estate properties scoped to organization
- [ ] E-commerce leads scoped to organization
- [ ] Campaigns scoped to organization
- [ ] Law matters scoped to organization (if applicable)
- [ ] No cross-organization data access possible
- [ ] API endpoints enforce organization scoping

### Search & Filtering
- [ ] Search results limited to organization data
- [ ] Filters work within organization scope
- [ ] Pagination works correctly within scope
- [ ] Sort functions work with scoped data

## Phase 5: Domain Management

### Domain Claiming
- [ ] Domain claim form accepts valid domains
- [ ] DNS verification instructions display correctly
- [ ] TXT record verification works
- [ ] Domain status updates after verification
- [ ] Multiple domains per organization supported

### Auto-join Functionality
- [ ] Users with verified domain emails auto-join
- [ ] Auto-join respects organization settings
- [ ] New users get appropriate default role
- [ ] Auto-join notifications sent correctly

## Phase 6: Email & Notifications

### Invitation Emails
- [ ] Owner creation email sends correctly
- [ ] Employee invitation emails send correctly
- [ ] Email content displays properly in email clients
- [ ] Links in emails work correctly
- [ ] Temporary password emails (if enabled) work
- [ ] Email translations work for Hebrew/English

### System Notifications
- [ ] Seat limit reached notifications work
- [ ] Role change notifications send
- [ ] Organization update notifications send
- [ ] Email delivery tracking works

## Phase 7: Security Testing

### Authentication
- [ ] Firebase integration works correctly
- [ ] User claims updated with organization info
- [ ] JWT tokens contain correct organization context
- [ ] Session management works across org switches

### Authorization
- [ ] API endpoints reject unauthorized requests
- [ ] Role-based API access enforced
- [ ] UI components respect user permissions
- [ ] Direct URL access blocked for unauthorized users

### Data Security
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities in org data
- [ ] CSRF protection works
- [ ] Sensitive data not logged or exposed

## Phase 8: User Experience

### Internationalization
- [ ] Hebrew (RTL) layout works correctly
- [ ] English layout works correctly
- [ ] All organization text is translated
- [ ] Date/time formats respect locale
- [ ] Currency formats work correctly

### Mobile Responsiveness
- [ ] Organization dashboard works on mobile
- [ ] Team management works on mobile
- [ ] Navigation works on small screens
- [ ] Tables convert to cards on mobile
- [ ] Touch interactions work properly

### Accessibility
- [ ] Screen reader support works
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards
- [ ] Focus indicators visible
- [ ] ARIA labels present and correct

## Phase 9: Performance Testing

### Load Testing
- [ ] Large organization (100+ members) loads quickly
- [ ] Organization switching is fast
- [ ] Dashboard KPIs calculate efficiently
- [ ] Search/filter performance acceptable

### Database Performance
- [ ] Organization queries use proper indexes
- [ ] No N+1 query issues
- [ ] Bulk operations perform well
- [ ] Migration scripts run efficiently

## Phase 10: Integration Testing

### Third-party Integrations
- [ ] Firebase user management works
- [ ] Email provider integration works
- [ ] External API integrations respect org scoping
- [ ] Webhook handling works correctly

### Existing Features
- [ ] Real estate features work unchanged
- [ ] E-commerce features work unchanged
- [ ] Campaign management works unchanged
- [ ] Import/export functions work with org scoping

## Phase 11: Error Handling & Edge Cases

### Error Scenarios
- [ ] Invalid invitation tokens handled gracefully
- [ ] Expired invitations handled correctly
- [ ] Network errors during org operations handled
- [ ] Database errors handled and logged

### Edge Cases
- [ ] User belongs to multiple organizations
- [ ] Organization with zero members after removal
- [ ] Seat limit exceeded scenarios
- [ ] Domain verification failures
- [ ] Email delivery failures

## Phase 12: Migration & Backward Compatibility

### Data Migration
- [ ] Existing users have personal organizations created
- [ ] Existing data properly assigned to organizations
- [ ] No data loss during migration
- [ ] Migration rollback works if needed

### Backward Compatibility
- [ ] Existing API endpoints still work
- [ ] Legacy data access patterns supported
- [ ] Gradual migration path works
- [ ] Feature flag enables/disables correctly

## Phase 13: Browser & Device Testing

### Browser Compatibility
- [ ] Chrome: Latest version works
- [ ] Firefox: Latest version works
- [ ] Safari: Latest version works
- [ ] Edge: Latest version works
- [ ] Mobile browsers work correctly

### Device Testing
- [ ] Desktop (1920x1080) works
- [ ] Laptop (1366x768) works
- [ ] Tablet (iPad) works
- [ ] Mobile (iPhone/Android) works

## Phase 14: Final Validation

### Smoke Tests
- [ ] Complete registration → invite → accept → dashboard flow
- [ ] Organization switching affects all pages
- [ ] Key API endpoints return 200 status
- [ ] Critical user journeys complete successfully

### Production Readiness
- [ ] All environment variables configured
- [ ] Monitoring and alerting set up
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Backup and recovery tested

---

## Sign-off

### QA Team Sign-off
- [ ] All critical issues resolved
- [ ] All test scenarios passed
- [ ] Performance acceptable
- [ ] Security validation complete
- [ ] User experience approved

**QA Lead:** _________________ **Date:** _________

### Product Team Sign-off
- [ ] Feature requirements met
- [ ] User flows validated
- [ ] Business logic correct
- [ ] Data integrity verified

**Product Manager:** _________________ **Date:** _________

### Engineering Sign-off
- [ ] Code review complete
- [ ] Architecture review passed
- [ ] Database changes validated
- [ ] Security review passed

**Tech Lead:** _________________ **Date:** _________

---

**Notes:**
- Mark any failed tests with details in the "Issues Found" section below
- Include screenshots for UI-related issues
- Document any workarounds or limitations
- Update this checklist as new scenarios are identified

## Issues Found

| Issue ID | Description | Severity | Status | Assigned To | Notes |
|----------|-------------|----------|---------|-------------|-------|
| | | | | | |