import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscriptions/status
 * Returns current subscription status for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request);
    const ownerUid = decodedToken.uid;

    // Get user's organization (first active membership)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: ownerUid,
        status: 'ACTIVE',
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { subscription: null, message: 'No active organization found' },
        { status: 200 }
      );
    }

    // Get subscription for this organization
    const subscription = await prisma.subscription.findUnique({
      where: {
        orgId: membership.orgId,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { subscription: null, message: 'No subscription found' },
        { status: 200 }
      );
    }

    // Return subscription status
    return NextResponse.json({
      subscription: {
        status: subscription.status,
        plan: subscription.plan,
        trialEndsAt: subscription.trialEndsAt?.toISOString(),
        vertical: subscription.vertical,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[GET /api/subscriptions/status] Error:', error);

    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}
