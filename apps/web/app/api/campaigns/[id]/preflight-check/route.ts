import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

    // Mock preflight check logic
    console.log(`Running preflight check for campaign ${id} for owner ${ownerUid}`);

    // Simulate checks
    const checks = {
      audience: 'passed',
      creative: 'passed',
      budget: 'passed',
      connection: 'passed'
    };

    const canActivate = Object.values(checks).every(status => status === 'passed');
    const issues: string[] = [];

    if (!canActivate) {
      Object.entries(checks).forEach(([check, status]) => {
        if (status !== 'passed') {
          issues.push(`${check} check failed`);
        }
      });
    }

    return NextResponse.json({
      success: true,
      canActivate,
      checks,
      issues,
      campaignId: id,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Campaign preflight check API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
