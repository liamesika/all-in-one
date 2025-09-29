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

    // In a real app, this would update the database
    console.log(`Recording first contact for lead ${id} for owner ${ownerUid}`);

    const firstContactAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      leadId: id,
      firstContactAt,
      updatedAt: firstContactAt
    });
  } catch (error) {
    console.error('Record first contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}