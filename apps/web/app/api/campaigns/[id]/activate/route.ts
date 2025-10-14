import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    // In a real app, this would:
    // 1. Validate campaign can be activated
    // 2. Create campaign on the actual platform (Meta, Google, etc.)
    // 3. Update campaign status in database
    console.log(`Activating campaign ${id} for owner ${ownerUid}`);

    const activatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      campaignId: id,
      status: 'ACTIVE',
      activatedAt,
      platformCampaignId: `platform-${id}-${Date.now()}`, // Mock platform ID
      updatedAt: activatedAt
    });
  } catch (error) {
    console.error('Campaign activation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});