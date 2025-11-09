export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';

export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();
    const { action, leadIds, status } = body;

    if (!action || !leadIds || !Array.isArray(leadIds)) {
      return NextResponse.json(
        { error: 'Action and leadIds array are required' },
        { status: 400 }
      );
    }

    // Verify all leads belong to the owner
    const leads = await prisma.realEstateLead.findMany({
      where: {
        id: { in: leadIds },
        ownerUid,
      },
    });

    if (leads.length !== leadIds.length) {
      return NextResponse.json(
        { error: 'Some leads not found or unauthorized' },
        { status: 403 }
      );
    }

    let result;

    switch (action) {
      case 'updateStatus':
        if (!status) {
          return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }
        result = await prisma.realEstateLead.updateMany({
          where: {
            id: { in: leadIds },
            ownerUid,
          },
          data: {
            qualificationStatus: status,
          },
        });
        return NextResponse.json({
          success: true,
          message: `Updated ${result.count} leads`,
          count: result.count,
        });

      case 'delete':
        result = await prisma.realEstateLead.deleteMany({
          where: {
            id: { in: leadIds },
            ownerUid,
          },
        });
        return NextResponse.json({
          success: true,
          message: `Deleted ${result.count} leads`,
          count: result.count,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Bulk leads API error:', error);
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
});
