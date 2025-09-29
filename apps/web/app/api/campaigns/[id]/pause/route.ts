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
}