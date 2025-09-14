import { NextResponse } from 'next/server';
import { prisma } from '../../../../../packages/server/db/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerUid = searchParams.get('ownerUid');
    const status = searchParams.get('status') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 100)));

    if (!ownerUid) {
      return NextResponse.json({ error: 'ownerUid is required' }, { status: 400 });
    }

    // Build WHERE clause for campaigns
    const where: any = {
      ownerUid,
      ...(status ? { status } : {}),
      ...(platform ? { platform } : {}),
    };

    // Fetch campaigns from database
    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        connection: {
          select: {
            id: true,
            platform: true,
            status: true,
            accountName: true,
          },
        },
        _count: {
          select: {
            leads: true,
          },
        },
      },
    });

    return NextResponse.json({
      campaigns: campaigns.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        platform: campaign.platform,
        status: campaign.status,
        goal: campaign.goal,
        budget: campaign.budget,
        dailyBudget: campaign.dailyBudget,
        audience: campaign.audience,
        creative: campaign.creative,
        platformCampaignId: campaign.platformCampaignId,
        platformAdSetId: campaign.platformAdSetId,
        spend: campaign.spend || 0,
        clicks: campaign.clicks || 0,
        impressions: campaign.impressions || 0,
        conversions: campaign.conversions || 0,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        preflightChecks: campaign.preflightChecks,
        lastCheckAt: campaign.lastCheckAt,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        connection: campaign.connection,
        _count: campaign._count,
      })),
    });
  } catch (error: any) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}