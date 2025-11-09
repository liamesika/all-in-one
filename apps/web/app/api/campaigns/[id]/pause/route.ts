export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

    // In a real app, this would pause the campaign on the platform
    console.log(`Pausing campaign ${id} for owner ${ownerUid}`);

    const pausedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      campaignId: id,
      status: 'PAUSED',
      pausedAt,
      updatedAt: pausedAt
    });
  } catch (error) {
    console.error('Campaign pause API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
