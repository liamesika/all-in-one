# Pull Request Template

## 📋 Description

Brief description of the changes and why they are needed.

## 🎯 Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Configuration change

## 🔧 Changes Made

- [ ] Added new API endpoints
- [ ] Modified database schema
- [ ] Updated UI components
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] Added feature flags
- [ ] Environment variable changes

## 📊 Database Changes

- [ ] No database changes
- [ ] Schema changes (migrations included)
- [ ] Data migration required
- [ ] Backfill script included

## 🧪 Testing

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

### Test Scenarios Covered
- [ ] Happy path functionality
- [ ] Error handling
- [ ] Edge cases
- [ ] Regression testing
- [ ] Performance impact
- [ ] Security considerations

## 🔒 Security Considerations

- [ ] No sensitive data exposed in logs
- [ ] Authentication/authorization properly implemented
- [ ] Input validation added
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

## 🌐 Internationalization

- [ ] No text changes
- [ ] All new text is localized (en/he)
- [ ] RTL layout considerations applied
- [ ] Translation keys added to locale files

## 📱 Mobile Responsiveness

- [ ] No UI changes
- [ ] Mobile layouts tested on small screens
- [ ] Touch interactions work properly
- [ ] Responsive breakpoints validated

## 🚀 Deployment

### Environment Variables
- [ ] No new environment variables
- [ ] New environment variables documented in .env.example
- [ ] Environment variables added to deployment configs

### Feature Flags
- [ ] No feature flags used
- [ ] Feature flag properly configured
- [ ] Gradual rollout plan documented

### Dependencies
- [ ] No new dependencies
- [ ] New dependencies approved and documented
- [ ] Package.json updated

## 📝 Checklist

### Code Quality
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] No console.log statements left in production code
- [ ] Error handling implemented
- [ ] Performance implications considered

### Documentation
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Inline code comments added where necessary
- [ ] Changelog entry added (if applicable)

### Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes documented and justified
- [ ] Migration guide provided
- [ ] Backward compatibility maintained where possible

## 🔗 Related Issues

Closes #[issue_number]
Related to #[issue_number]

## 📸 Screenshots/Videos

<!-- Add screenshots or videos demonstrating the changes -->

## 🎮 How to Test

1. Check out this branch
2. Run `yarn install`
3. Run migrations: `yarn prisma:generate`
4. Start development servers: `yarn dev`
5. Navigate to [specific URL or feature]
6. Test scenarios:
   - [ ] Scenario 1
   - [ ] Scenario 2
   - [ ] Scenario 3

## 🤝 Review Requests

- [ ] Code review requested
- [ ] Design review requested (if UI changes)
- [ ] Security review requested (if security-sensitive)
- [ ] Performance review requested (if performance-critical)

## 📊 Performance Impact

- [ ] No performance impact
- [ ] Performance tested and acceptable
- [ ] Performance improvements included
- [ ] Performance monitoring added

## 🚨 Rollback Plan

- [ ] No rollback needed (safe changes)
- [ ] Feature flag allows easy rollback
- [ ] Database migration is reversible
- [ ] Deployment can be safely reverted

---

**Reviewer Guidelines:**
- Verify all checkboxes are appropriately marked
- Test the changes locally following the "How to Test" section
- Check for any security, performance, or accessibility concerns
- Ensure documentation is updated and accurate
- Validate mobile responsiveness if UI changes are present