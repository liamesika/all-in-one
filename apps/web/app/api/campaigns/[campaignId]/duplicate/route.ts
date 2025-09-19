import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { campaignId: string } }) {
  try {
    const { campaignId } = params;

    // Get the original campaign
    const originalCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!originalCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Create a duplicate campaign
    const duplicatedCampaign = await prisma.campaign.create({
      data: {
        ownerUid: originalCampaign.ownerUid,
        name: `${originalCampaign.name} (Copy)`,
        platform: originalCampaign.platform,
        status: 'DRAFT', // Start as draft
        goal: originalCampaign.goal,
        budget: originalCampaign.budget,
        dailyBudget: originalCampaign.dailyBudget,
        audience: originalCampaign.audience,
        creative: originalCampaign.creative,
        connectionId: originalCampaign.connectionId,
        // Don't copy platform IDs or dates
        platformCampaignId: null,
        platformAdSetId: null,
        startDate: null,
        endDate: null,
        // Reset metrics
        spend: 0,
        clicks: 0,
        impressions: 0,
        conversions: 0,
        preflightChecks: null,
        lastCheckAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: duplicatedCampaign.id,
        name: duplicatedCampaign.name,
        platform: duplicatedCampaign.platform,
        status: duplicatedCampaign.status,
        goal: duplicatedCampaign.goal,
        budget: duplicatedCampaign.budget,
        dailyBudget: duplicatedCampaign.dailyBudget,
        createdAt: duplicatedCampaign.createdAt,
        updatedAt: duplicatedCampaign.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Duplicate campaign error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to duplicate campaign' },
      { status: 500 }
    );
  }
}