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
    // 1. Find the original campaign
    // 2. Create a duplicate with modified name
    // 3. Reset status to DRAFT
    console.log(`Duplicating campaign ${id} for owner ${ownerUid}`);

    const now = new Date().toISOString();
    const newCampaignId = `${id}-copy-${Date.now()}`;

    return NextResponse.json({
      success: true,
      originalCampaignId: id,
      newCampaignId,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now
    });
  } catch (error) {
    console.error('Campaign duplicate API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}