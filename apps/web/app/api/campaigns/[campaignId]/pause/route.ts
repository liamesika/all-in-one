import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { campaignId: string } }) {
  try {
    const { campaignId } = params;

    // Get the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign must be ACTIVE to pause' },
        { status: 400 }
      );
    }

    // Update campaign status to PAUSED
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'PAUSED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: updatedCampaign.id,
        status: updatedCampaign.status,
        updatedAt: updatedCampaign.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Pause campaign error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to pause campaign' },
      { status: 500 }
    );
  }
}