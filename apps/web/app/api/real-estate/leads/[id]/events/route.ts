export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';


// GET /api/real-estate/leads/[id]/events - Get lead event timeline
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const ownerUid = getOwnerUid(user);

    // First verify the lead belongs to the user
    const lead = await prisma.realEstateLead.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerUid },
          { orgId: { not: null } }, // TODO: Check org membership
        ]
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Fetch events
    const events = await prisma.realEstateLeadEvent.findMany({
      where: { leadId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(events);

  } catch (error: any) {
    console.error('[Lead Events API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead events' },
      { status: 500 }
    );
  }
});
