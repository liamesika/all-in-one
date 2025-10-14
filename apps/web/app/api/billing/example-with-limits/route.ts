import { withAuth, getOwnerUid } from '@/lib/apiAuth';
/**
 * EXAMPLE: API Route with Billing Limits Enforcement
 *
 * This is an example showing how to integrate billing limits into any API route.
 * Copy this pattern to existing routes like:
 * - /api/real-estate/leads/route.ts
 * - /api/real-estate/properties/route.ts
 * - /api/real-estate/automations/route.ts
 * - /api/real-estate/integrations/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { guardResourceCreation, requireActiveSubscription } from '@/lib/billing-guard';
import { trackLeadCreation } from '@/lib/usage-tracker';


/**
 * Example: Create a new lead with limit enforcement
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const orgId = request.headers.get('x-org-id');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 401 });
    }

    // STEP 1: Check if subscription is active
    const subscriptionCheck = await requireActiveSubscription(orgId);
    if (subscriptionCheck) {
      return subscriptionCheck; // Return error response
    }

    // STEP 2: Check if within lead limits
    const limitCheck = await guardResourceCreation(orgId, 'leads');
    if (limitCheck) {
      return limitCheck; // Return limit exceeded error
    }

    // STEP 3: Create the resource (existing logic)
    const body = await request.json();

    // Example: Create lead in database
    const lead = await prisma.realEstateLead.create({
      data: {
        orgId,
        fullName: body.fullName,
        phone: body.phone,
        email: body.email,
        message: body.message,
        source: body.source,
        ownerUid: getOwnerUid(user) || 'unknown',
      },
    });

    // STEP 4: Track usage after successful creation
    await trackLeadCreation(orgId, lead.id, {
      source: body.source,
      createdBy: getOwnerUid(user),
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

/**
 * Example: List leads (no limit check needed for reads)
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const orgId = request.headers.get('x-org-id');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 401 });
    }

    // No need to check limits for read operations
    const leads = await prisma.realEstateLead.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('[API] Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
});

/**
 * INTEGRATION CHECKLIST:
 *
 * To add billing limits to an existing API route:
 *
 * 1. Import the guard functions:
 *    import { guardResourceCreation, requireActiveSubscription } from '@/lib/billing-guard';
 *    import { trackLeadCreation } from '@/lib/usage-tracker';
 *
 * 2. Add orgId extraction (if not already present):
 *    const orgId = request.headers.get('x-org-id');
 *
 * 3. Before creating resource, add checks:
 *    const subscriptionCheck = await requireActiveSubscription(orgId);
 *    if (subscriptionCheck) return subscriptionCheck;
 *
 *    const limitCheck = await guardResourceCreation(orgId, 'leads'); // or 'properties', 'automations', etc.
 *    if (limitCheck) return limitCheck;
 *
 * 4. After successful creation, track usage:
 *    await trackLeadCreation(orgId, resource.id, metadata);
 *    // or trackPropertyCreation, trackAutomationExecution, etc.
 *
 * 5. For DELETE operations, track deletion:
 *    await trackLeadDeletion(orgId, resourceId);
 *
 * 6. No changes needed for GET/read operations
 */
