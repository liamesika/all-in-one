export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

const attachSchema = z.object({
  campaignId: z.string().uuid(),
});

export const POST = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };
    const body = await request.json();
    const { campaignId } = attachSchema.parse(body);

    // Verify export pack exists and belongs to org
    const exportPack = await prisma.creativeExportPack.findFirst({
      where: {
        id,
        project: { orgId },
      },
    });

    if (!exportPack) {
      return NextResponse.json({ error: 'Export pack not found' }, { status: 404 });
    }

    // Verify campaign belongs to org
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        orgId,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Attach export pack to campaign
    const updated = await prisma.creativeExportPack.update({
      where: { id },
      data: { campaignId },
      include: {
        project: true,
        campaign: true,
      },
    });

    return NextResponse.json({
      exportPack: updated,
      message: 'Export pack attached to campaign successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to attach export pack', message: error.message },
      { status: 500 }
    );
  }
});

export const DELETE = withAuthAndOrg(async (request, { user, orgId, params }) => {
  const { id } = params as { id: string };

  const exportPack = await prisma.creativeExportPack.findFirst({
    where: {
      id,
      project: { orgId },
    },
  });

  if (!exportPack) {
    return NextResponse.json({ error: 'Export pack not found' }, { status: 404 });
  }

  const updated = await prisma.creativeExportPack.update({
    where: { id },
    data: { campaignId: null },
  });

  return NextResponse.json({
    exportPack: updated,
    message: 'Export pack detached from campaign successfully',
  });
});
