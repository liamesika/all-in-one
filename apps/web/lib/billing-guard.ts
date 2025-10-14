/**
 * Billing guard middleware
 * Helper functions for enforcing subscription limits in API routes
 */

import { NextResponse } from 'next/server';
import { enforceLimit, checkLimit, UsageLimitError, ResourceType } from './usage-tracker';

/**
 * Guard function to check subscription limits before allowing resource creation
 * Returns NextResponse with error if limit exceeded
 */
export async function guardResourceCreation(
  orgId: string,
  resourceType: ResourceType
): Promise<NextResponse | null> {
  try {
    await enforceLimit(orgId, resourceType);
    return null; // All good, proceed
  } catch (error) {
    if (error instanceof UsageLimitError) {
      return NextResponse.json(
        {
          error: 'Subscription limit reached',
          message: error.message,
          limitInfo: {
            resourceType: error.resourceType,
            limit: error.limit,
            current: error.current,
          },
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Other errors
    console.error('[Billing Guard] Error checking limit:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription limits' },
      { status: 500 }
    );
  }
}

/**
 * Check if organization has an active subscription
 */
export async function requireActiveSubscription(orgId: string): Promise<NextResponse | null> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { orgId },
    });

    if (!subscription) {
      return NextResponse.json(
        {
          error: 'No subscription found',
          message: 'This organization does not have an active subscription',
          requiresSubscription: true,
        },
        { status: 402 } // Payment Required
      );
    }

    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
      return NextResponse.json(
        {
          error: 'Subscription not active',
          message: `Subscription status is ${subscription.status}. Please update your billing information.`,
          requiresPayment: true,
        },
        { status: 402 }
      );
    }

    return null; // All good
  } catch (error) {
    console.error('[Billing Guard] Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription status' },
      { status: 500 }
    );
  }
}

/**
 * Get remaining capacity for a resource type
 */
export async function getRemainingCapacity(
  orgId: string,
  resourceType: ResourceType
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const stats = await checkLimit(orgId, resourceType);

  return {
    allowed: stats.allowed,
    remaining: stats.remaining,
    limit: stats.limit,
  };
}
