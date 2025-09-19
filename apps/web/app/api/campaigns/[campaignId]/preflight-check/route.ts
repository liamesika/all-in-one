import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { campaignId: string } }) {
  try {
    const { campaignId } = params;

    // Get the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        connection: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Simple preflight checks (can be expanded later)
    const checks = {
      hasName: !!campaign.name,
      hasBudget: !!campaign.budget && campaign.budget > 0,
      hasConnection: !!campaign.connection && campaign.connection.status === 'CONNECTED',
      hasAudience: !!campaign.audience,
      hasCreative: !!campaign.creative,
    };

    const passed = Object.values(checks).every(Boolean);

    // Update the campaign with preflight check results
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        preflightChecks: checks,
        lastCheckAt: new Date(),
        status: passed ? 'READY' : 'DRAFT',
      },
    });

    return NextResponse.json({
      success: true,
      passed,
      checks,
      campaign: {
        id: updatedCampaign.id,
        status: updatedCampaign.status,
        preflightChecks: updatedCampaign.preflightChecks,
        lastCheckAt: updatedCampaign.lastCheckAt,
      },
    });
  } catch (error: any) {
    console.error('Preflight check error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to run preflight check' },
      { status: 500 }
    );
  }
}