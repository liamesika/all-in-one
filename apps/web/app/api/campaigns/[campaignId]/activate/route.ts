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

    if (campaign.status !== 'READY') {
      return NextResponse.json(
        { error: 'Campaign must be in READY status to activate' },
        { status: 400 }
      );
    }

    // Update campaign status to ACTIVE
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        startDate: campaign.startDate || new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: updatedCampaign.id,
        status: updatedCampaign.status,
        startDate: updatedCampaign.startDate,
        updatedAt: updatedCampaign.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Activate campaign error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to activate campaign' },
      { status: 500 }
    );
  }
}