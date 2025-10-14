import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/real-estate/automations/[id]/toggle
 * Toggle automation status between ACTIVE and PAUSED
 */
export const POST = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

    // Verify ownership
    const existing = await prisma.automation.findFirst({
      where: {
        id,
        ownerUid,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    // Toggle status
    const newStatus = existing.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    const automation = await prisma.automation.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      automation,
      message: `Automation ${newStatus === 'ACTIVE' ? 'activated' : 'paused'}`,
    });
  } catch (error: any) {
    console.error('Error toggling automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
