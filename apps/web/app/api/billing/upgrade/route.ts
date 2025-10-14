/**
 * Subscription upgrade/downgrade API
 * POST: Update subscription plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SubscriptionPlan } from '@prisma/client';
import { updateSubscription, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { getPlanLimits } from '@/config/pricing';
import { withAuthAndOrg } from '@/lib/apiAuth';

const prisma = new PrismaClient();

/**
 * POST /api/billing/upgrade
 * Upgrade or downgrade subscription plan
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const { newPlan } = body;

    // Validate new plan
    if (!newPlan || !['BASIC', 'PRO', 'AGENCY'].includes(newPlan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { orgId },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Check if trying to change to same plan
    if (subscription.plan === newPlan) {
      return NextResponse.json({ error: 'Already on this plan' }, { status: 400 });
    }

    // Get Stripe price ID for new plan
    const newPriceId = STRIPE_PRICE_IDS[newPlan as keyof typeof STRIPE_PRICE_IDS];

    if (!newPriceId) {
      return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 400 });
    }

    // Update subscription in Stripe
    const updatedStripeSubscription = await updateSubscription({
      subscriptionId: subscription.stripeSubscriptionId,
      newPriceId,
    });

    // Update subscription in database
    const newLimits = getPlanLimits(newPlan as SubscriptionPlan);

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: newPlan as SubscriptionPlan,
        stripePriceId: newPriceId,
        stripeCurrentPeriodEnd: new Date(updatedStripeSubscription.current_period_end * 1000),
        // Update limits
        userSeats: newLimits.users,
        leadLimit: newLimits.leads,
        propertyLimit: newLimits.properties,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        plan: updatedSubscription.plan,
        status: updatedSubscription.status,
        currentPeriodEnd: updatedSubscription.stripeCurrentPeriodEnd,
      },
      message: `Successfully upgraded to ${newPlan} plan`,
    });
  } catch (error) {
    console.error('[Billing Upgrade API] Error upgrading subscription:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
