import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'MEETING' | 'OFFER' | 'DEAL' | 'WON' | 'LOST';

// This would normally come from a database, but using mock data for now
const mockLeads = [
  // This would be loaded from the same data store as the main leads route
];

export const PUT = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);
    const body = await request.json();
    const { status } = body;

    if (!status || !['NEW', 'CONTACTED', 'QUALIFIED', 'MEETING', 'OFFER', 'DEAL', 'WON', 'LOST'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    // In a real app, this would update the database
    console.log(`Updating lead ${id} status to ${status} for owner ${ownerUid}`);

    return NextResponse.json({
      success: true,
      leadId: id,
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update lead status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
