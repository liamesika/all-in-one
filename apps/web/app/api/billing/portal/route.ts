/**
 * Stripe Billing Portal API
 * POST: Create billing portal session for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createBillingPortalSession } from '@/lib/stripe';
import { withAuthAndOrg } from '@/lib/apiAuth';

const prisma = new PrismaClient();

/**
 * POST /api/billing/portal
 * Create Stripe billing portal session
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const { returnUrl } = body;

    // Get subscription with Stripe customer ID
    const subscription = await prisma.subscription.findUnique({
      where: { orgId },
    });

    if (!subscription || !subscription.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Create billing portal session
    const session = await createBillingPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: returnUrl || `${request.headers.get('origin')}/dashboard/billing`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('[Billing Portal API] Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
