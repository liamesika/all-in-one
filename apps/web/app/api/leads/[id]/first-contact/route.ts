export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

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
});
