# EFFINITY Billing & Subscription System Implementation

## Overview

Complete billing and subscription system for the EFFINITY platform with Stripe integration, tiered pricing, usage tracking, and limit enforcement.

---

## Database Schema Changes

### New Enums Added
```prisma
enum SubscriptionPlan {
  BASIC       // $29/month
  PRO         // $99/month
  AGENCY      // $299/month
  ENTERPRISE  // Custom pricing
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  TRIALING
  INCOMPLETE
}
```

### New Models Added

#### 1. Subscription
- **Purpose**: Track organization subscription plans and usage
- **Location**: `packages/server/db/prisma/schema.prisma` (lines 1947-1983)
- **Key Fields**:
  - `plan`: Current subscription tier
  - `status`: Subscription status
  - `stripeCustomerId`: Stripe customer ID
  - `stripeSubscriptionId`: Stripe subscription ID
  - `leadCount`, `propertyCount`: Current usage tracking
  - `leadLimit`, `propertyLimit`: Plan limits
  - `trialEndsAt`: Trial expiration date

#### 2. Invoice
- **Purpose**: Record billing invoices
- **Location**: `packages/server/db/prisma/schema.prisma` (lines 1986-2008)
- **Key Fields**:
  - `stripeInvoiceId`: Stripe invoice reference
  - `amount`: Invoice amount in cents
  - `status`: Payment status (paid, open, void, uncollectible)
  - `pdfUrl`, `hostedInvoiceUrl`: Invoice download links

#### 3. UsageRecord
- **Purpose**: Track usage events for analytics
- **Location**: `packages/server/db/prisma/schema.prisma` (lines 2011-2027)
- **Key Fields**:
  - `resourceType`: Type of resource (leads, properties, etc.)
  - `action`: Action performed (created, deleted, updated)
  - `quantity`: Number of items affected

### Database Migration

To apply the schema changes:

```bash
# Generate Prisma client
pnpm prisma generate --schema packages/server/db/prisma/schema.prisma

# Create migration (when ready for production)
pnpm prisma migrate dev --schema packages/server/db/prisma/schema.prisma --name add-billing-system
```

---

## Stripe Integration

### Server-Side Library
**File**: `/apps/web/lib/stripe.ts`

Functions provided:
- `stripe`: Initialized Stripe instance
- `createCheckoutSession()`: Create subscription checkout
- `createBillingPortalSession()`: Access billing portal
- `updateSubscription()`: Change subscription plan
- `cancelSubscription()`: Cancel subscription
- `getOrCreateCustomer()`: Manage Stripe customers

### Client-Side Library
**File**: `/apps/web/lib/stripe-client.ts`

Functions provided:
- `getStripe()`: Load Stripe.js for client-side operations

---

## Pricing Configuration

**File**: `/apps/web/config/pricing.ts`

### Pricing Tiers

| Plan | Price | Users | Leads/Month | Properties | Automations | Integrations |
|------|-------|-------|-------------|------------|-------------|--------------|
| **BASIC** | $29/mo | 1 | 100 | 50 | 5 | 3 |
| **PRO** | $99/mo | 5 | 1,000 | 500 | 50 | Unlimited |
| **AGENCY** | $299/mo | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| **ENTERPRISE** | Custom | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |

### Utility Functions
- `getPlanConfig(plan)`: Get plan details
- `getPlanLimits(plan)`: Get plan limits
- `checkPlanLimit(plan, resource, usage)`: Check if within limits
- `getNextUpgradePlan(plan)`: Get next tier
- `isUpgrade(fromPlan, toPlan)`: Check if upgrade
- `formatPrice(plan)`: Format price string

---

## Usage Tracking

**File**: `/apps/web/lib/usage-tracker.ts`

### Functions

#### Limit Checking
```typescript
await checkLimit(orgId, 'leads'); // Returns usage stats
await enforceLimit(orgId, 'leads'); // Throws UsageLimitError if exceeded
```

#### Usage Tracking
```typescript
await trackLeadCreation(orgId, leadId, metadata);
await trackPropertyCreation(orgId, propertyId, metadata);
await trackAutomationExecution(orgId, automationId, metadata);
await trackIntegrationSync(orgId, integrationId, itemsSynced, metadata);
```

#### Deletion Tracking
```typescript
await trackLeadDeletion(orgId, leadId);
await trackPropertyDeletion(orgId, propertyId);
```

#### Statistics
```typescript
const stats = await getUsageStats(orgId);
// Returns: { plan, status, usage: { leads, properties, users, automations, integrations }, billingPeriod }
```

---

## API Endpoints

### 1. GET/POST `/api/billing/subscription`
- **GET**: Fetch current subscription with usage stats
- **POST**: Create new subscription (redirects to Stripe Checkout)
- **Headers Required**: `x-org-id`, `x-owner-uid`

### 2. POST `/api/billing/portal`
- **Purpose**: Create Stripe billing portal session
- **Use**: Manage payment methods, view invoices, cancel subscription
- **Headers Required**: `x-org-id`

### 3. POST `/api/billing/upgrade`
- **Purpose**: Upgrade/downgrade subscription plan
- **Body**: `{ newPlan: 'BASIC' | 'PRO' | 'AGENCY' }`
- **Headers Required**: `x-org-id`

### 4. GET `/api/billing/usage`
- **Purpose**: Get usage statistics for current billing period
- **Headers Required**: `x-org-id`

### 5. POST `/api/billing/webhooks`
- **Purpose**: Handle Stripe webhook events
- **Events Handled**:
  - `checkout.session.completed`: Activate subscription
  - `invoice.paid`: Record payment
  - `invoice.payment_failed`: Handle failed payment
  - `customer.subscription.updated`: Sync subscription changes
  - `customer.subscription.deleted`: Cancel subscription
  - `customer.subscription.trial_will_end`: Trial ending notification

---

## Billing Guard Middleware

**File**: `/apps/web/lib/billing-guard.ts`

### Functions

```typescript
// Check limits before resource creation
const error = await guardResourceCreation(orgId, 'leads');
if (error) return error;

// Require active subscription
const error = await requireActiveSubscription(orgId);
if (error) return error;

// Get remaining capacity
const { allowed, remaining, limit } = await getRemainingCapacity(orgId, 'leads');
```

---

## UI Components

### 1. PricingCards
**File**: `/apps/web/components/billing/PricingCards.tsx`

Displays all subscription plans with features, pricing, and CTA buttons.

```tsx
<PricingCards
  currentPlan="BASIC"
  onSelectPlan={(plan) => handleUpgrade(plan)}
  loading={false}
/>
```

### 2. UsageStats
**File**: `/apps/web/components/billing/UsageStats.tsx`

Shows current usage vs limits with visual progress bars.

```tsx
<UsageStats usage={{
  leads: { current: 45, limit: 100, percentage: 45 },
  properties: { current: 20, limit: 50, percentage: 40 },
  // ...
}} />
```

### 3. InvoicesList
**File**: `/apps/web/components/billing/InvoicesList.tsx`

Displays billing history with download links.

```tsx
<InvoicesList invoices={recentInvoices} />
```

### 4. UpgradePrompt
**File**: `/apps/web/components/billing/UpgradePrompt.tsx`

Modal shown when user hits usage limits.

```tsx
<UpgradePrompt
  isOpen={showPrompt}
  onClose={() => setShowPrompt(false)}
  limitType="leads"
  currentUsage={100}
  limit={100}
/>
```

---

## Billing Dashboard

**File**: `/apps/web/app/dashboard/billing/page.tsx`

Complete billing management interface:
- View current plan and status
- Usage statistics with progress bars
- Upgrade/downgrade options
- Billing history
- Manage payment methods (via Stripe portal)

**Route**: `/dashboard/billing`

---

## Integration Guide

### Adding Limits to Existing API Routes

**Example**: `/api/real-estate/leads/route.ts`

```typescript
import { guardResourceCreation, requireActiveSubscription } from '@/lib/billing-guard';
import { trackLeadCreation } from '@/lib/usage-tracker';

export async function POST(request: NextRequest) {
  const orgId = request.headers.get('x-org-id');

  // 1. Check subscription is active
  const subCheck = await requireActiveSubscription(orgId);
  if (subCheck) return subCheck;

  // 2. Check if within limits
  const limitCheck = await guardResourceCreation(orgId, 'leads');
  if (limitCheck) return limitCheck;

  // 3. Create resource (existing logic)
  const lead = await prisma.realEstateLead.create({ ... });

  // 4. Track usage
  await trackLeadCreation(orgId, lead.id, { source: 'api' });

  return NextResponse.json({ lead });
}
```

### Routes to Update

Apply billing guards to:
- ✅ `/api/real-estate/leads/route.ts` - Leads creation
- ✅ `/api/real-estate/properties/route.ts` - Properties creation
- ✅ `/api/real-estate/automations/route.ts` - Automations creation
- ✅ `/api/real-estate/integrations/route.ts` - Integrations creation
- ✅ `/api/e-commerce/leads/route.ts` - E-commerce leads

---

## Environment Variables

Add to `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (from Stripe Dashboard)
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_AGENCY="price_..."
```

---

## Stripe Setup Checklist

### 1. Create Stripe Account
- Sign up at https://stripe.com
- Enable test mode for development

### 2. Create Products and Prices
In Stripe Dashboard:
1. Products → Create product
2. For each plan (BASIC, PRO, AGENCY):
   - Name: "EFFINITY [Plan Name]"
   - Pricing: Recurring, monthly
   - Price: $29, $99, $299
   - Copy Price ID to `.env`

### 3. Configure Webhooks
1. Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://yourdomain.com/api/billing/webhooks`
3. Events to listen:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
4. Copy webhook signing secret to `.env`

### 4. Enable Billing Portal
1. Settings → Billing → Customer portal
2. Enable portal
3. Configure:
   - Update payment method: Enabled
   - Cancel subscription: Enabled
   - View invoice history: Enabled

---

## Testing Guide

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/billing/webhooks

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.updated
```

### Manual Testing Checklist

#### Subscription Flow
- [ ] Navigate to `/dashboard/billing`
- [ ] Select a plan
- [ ] Complete checkout (use test card `4242 4242 4242 4242`)
- [ ] Verify subscription appears in dashboard
- [ ] Check database for subscription record

#### Usage Tracking
- [ ] Create leads until limit reached
- [ ] Verify limit enforcement error
- [ ] Check usage stats update in dashboard

#### Upgrade Flow
- [ ] Click "Upgrade" in billing dashboard
- [ ] Select higher tier plan
- [ ] Verify immediate upgrade
- [ ] Check prorated charges in Stripe

#### Billing Portal
- [ ] Click "Manage Billing"
- [ ] Update payment method
- [ ] View invoice history
- [ ] Cancel subscription
- [ ] Reactivate subscription

#### Webhooks
- [ ] Use Stripe CLI to trigger events
- [ ] Verify database updates
- [ ] Check logs for webhook processing

---

## Security Considerations

1. **Webhook Signature Verification**: All webhooks verify Stripe signatures
2. **Server-Side Enforcement**: All limits checked server-side, never client-side
3. **API Key Security**: Secret keys never exposed to client
4. **Idempotency**: Webhook handlers are idempotent (safe to retry)
5. **Rate Limiting**: Consider adding rate limiting to billing endpoints

---

## Error Handling

### Client-Side Errors
```typescript
{
  error: 'Subscription limit reached',
  message: 'You\'ve reached your lead limit',
  limitInfo: {
    resourceType: 'leads',
    limit: 100,
    current: 100
  },
  upgradeRequired: true
}
```

### HTTP Status Codes
- `401`: Unauthorized (missing auth)
- `402`: Payment Required (no active subscription)
- `403`: Forbidden (limit exceeded)
- `404`: Not Found (subscription not found)
- `500`: Server Error

---

## Monitoring & Analytics

### Key Metrics to Track
- Subscription conversion rate
- Average revenue per user (ARPU)
- Churn rate
- Upgrade/downgrade frequency
- Usage patterns per plan
- Trial conversion rate

### Database Queries
```sql
-- Active subscriptions by plan
SELECT plan, COUNT(*) FROM "Subscription"
WHERE status = 'ACTIVE'
GROUP BY plan;

-- Monthly recurring revenue (MRR)
SELECT plan,
  CASE
    WHEN plan = 'BASIC' THEN COUNT(*) * 29
    WHEN plan = 'PRO' THEN COUNT(*) * 99
    WHEN plan = 'AGENCY' THEN COUNT(*) * 299
  END as mrr
FROM "Subscription"
WHERE status IN ('ACTIVE', 'TRIALING')
GROUP BY plan;

-- Usage statistics
SELECT resourceType, COUNT(*), SUM(quantity)
FROM "UsageRecord"
WHERE "createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY resourceType;
```

---

## Future Enhancements

### Phase 2
- [ ] Annual billing with discount
- [ ] Add-ons (extra seats, extra leads)
- [ ] Custom enterprise contracts
- [ ] Volume-based pricing
- [ ] Usage-based billing for automations

### Phase 3
- [ ] Multi-currency support
- [ ] Regional pricing
- [ ] Payment plans for enterprise
- [ ] Referral program
- [ ] Reseller/agency pricing

---

## Support & Troubleshooting

### Common Issues

**Issue**: Webhook not received
- Verify webhook endpoint is publicly accessible
- Check Stripe webhook logs
- Ensure signing secret matches

**Issue**: Limit not enforced
- Verify `guardResourceCreation()` is called before creation
- Check orgId is passed correctly
- Verify subscription exists in database

**Issue**: Usage not tracked
- Ensure `trackLeadCreation()` called after successful creation
- Check for errors in usage tracker logs
- Verify subscription ID is correct

---

## Contact

For issues or questions:
- Technical: dev@effinity.co.il
- Billing: billing@effinity.co.il
- Sales (Enterprise): sales@effinity.co.il
