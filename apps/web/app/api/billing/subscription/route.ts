export const dynamic = 'force-dynamic';
/**
 * Subscription management API
 * GET: Fetch current subscription
 * POST: Create new subscription (checkout)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { createCheckoutSession, STRIPE_PRICE_IDS, validateStripeConfig } from '@/lib/stripe';
import { getUsageStats } from '@/lib/usage-tracker';
import { withAuthAndOrg, getOwnerUid } from '@/lib/apiAuth';


/**
 * GET /api/billing/subscription
 * Fetch current organization subscription with usage stats
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {

    // Fetch subscription
    const subscription = await prisma.subscription.findUnique({
      where: { orgId },
      include: {
        organization: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      // No subscription yet - return default trial state
      return NextResponse.json({
        subscription: null,
        onTrial: false,
        needsSubscription: true,
      });
    }

    // Get usage statistics
    const usageStats = await getUsageStats(orgId);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        currentPeriodEnd: subscription.stripeCurrentPeriodEnd,
        trialEndsAt: subscription.trialEndsAt,
        nextBillingDate: subscription.nextBillingDate,
        billingEmail: subscription.billingEmail,
      },
      usage: usageStats.usage,
      billingPeriod: usageStats.billingPeriod,
      recentInvoices: subscription.invoices.map((inv) => ({
        id: inv.id,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        paidAt: inv.paidAt,
        periodStart: inv.periodStart,
        periodEnd: inv.periodEnd,
        pdfUrl: inv.pdfUrl,
        hostedInvoiceUrl: inv.hostedInvoiceUrl,
      })),
    });
  } catch (error) {
    console.error('[Billing API] Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/billing/subscription
 * Create new subscription (redirect to Stripe Checkout)
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();
    const { plan, returnUrl } = body;

    // Validate plan
    if (!plan || !['BASIC', 'PRO', 'AGENCY'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Get organization and owner details
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        owner: true,
        subscription: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if already has active subscription
    if (organization.subscription && organization.subscription.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Organization already has an active subscription' },
        { status: 400 }
      );
    }

    // Get Stripe price ID for plan
    const priceId = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      customerId: organization.subscription?.stripeCustomerId,
      customerEmail: organization.owner.email,
      priceId,
      successUrl: `${returnUrl || request.headers.get('origin')}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${returnUrl || request.headers.get('origin')}/dashboard/billing?canceled=true`,
      metadata: {
        orgId,
        ownerUid,
        plan,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[Billing API] Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
