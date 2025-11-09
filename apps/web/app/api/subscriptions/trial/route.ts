export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { verifyAuthToken } from '@/lib/apiAuth';
import { Vertical, SubscriptionStatus } from '@prisma/client';

// Rate limiting: 3 calls per day per user
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request);
    const ownerUid = decodedToken.uid;

    // Parse request body
    const { vertical } = await request.json();

    if (!vertical) {
      return NextResponse.json({ error: 'Missing vertical' }, { status: 400 });
    }

    // Validate vertical
    const validVerticals: Vertical[] = ['E_COMMERCE', 'REAL_ESTATE', 'PRODUCTION', 'LAW'];
    const verticalMap: Record<string, Vertical> = {
      'ecommerce': 'E_COMMERCE',
      'realestate': 'REAL_ESTATE',
      'productions': 'PRODUCTION',
      'law': 'LAW',
    };

    const prismaVertical = verticalMap[vertical];
    if (!prismaVertical || !validVerticals.includes(prismaVertical)) {
      return NextResponse.json({ error: 'Invalid vertical' }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(ownerUid)) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many trial activation attempts. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: ownerUid },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { organization: true },
        },
      },
    });

    if (!user || !user.memberships[0]) {
      return NextResponse.json({ error: 'No active organization found' }, { status: 404 });
    }

    const orgId = user.memberships[0].orgId;

    // Check for existing subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { orgId },
    });

    if (existingSubscription) {
      // Check if active paid subscription
      if (existingSubscription.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'ACTIVE_SUBSCRIPTION', message: 'You already have an active subscription' },
          { status: 409 }
        );
      }

      // Check if trial already active (not expired)
      if (
        (existingSubscription.status === 'TRIALING' || existingSubscription.status === 'TRIAL') &&
        existingSubscription.trialEndsAt &&
        new Date(existingSubscription.trialEndsAt) > new Date()
      ) {
        return NextResponse.json(
          {
            error: 'TRIAL_ALREADY_ACTIVE',
            message: 'Your trial is already active',
            endDateISO: existingSubscription.trialEndsAt.toISOString(),
            daysRemaining: Math.ceil(
              (new Date(existingSubscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            ),
          },
          { status: 409 }
        );
      }
    }

    // Calculate trial dates (Asia/Jerusalem timezone)
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { orgId },
      update: {
        status: 'TRIAL' as SubscriptionStatus,
        vertical: prismaVertical,
        trialEndsAt,
        updatedAt: now,
      },
      create: {
        orgId,
        vertical: prismaVertical,
        plan: 'PRO', // Trial gives Pro features
        status: 'TRIAL' as SubscriptionStatus,
        trialEndsAt,
        userSeats: 1,
        usedSeats: 1,
        leadLimit: 1000,
        leadCount: 0,
        propertyLimit: 1000,
        propertyCount: 0,
      },
    });

    // Log trial activation
    console.log(`✅ Trial activated for user ${ownerUid}, org ${orgId}, vertical ${prismaVertical}`);

    return NextResponse.json({
      status: 'TRIAL',
      endDateISO: subscription.trialEndsAt?.toISOString(),
      daysRemaining: 30,
      message: '30-day trial successfully activated',
    });
  } catch (error) {
    console.error('Error activating trial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
