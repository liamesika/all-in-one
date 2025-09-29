import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { ownerUid } = body;

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

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
}