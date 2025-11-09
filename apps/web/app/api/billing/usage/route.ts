export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
/**
 * Usage statistics API
 * GET: Fetch usage stats for current billing period
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsageStats } from '@/lib/usage-tracker';

/**
 * GET /api/billing/usage
 * Get usage statistics for current billing period
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const orgId = request.headers.get('x-org-id');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 401 });
    }

    const stats = await getUsageStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Billing Usage API] Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
