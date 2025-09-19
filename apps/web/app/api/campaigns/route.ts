import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { resolveTenantContext, logTenantOperation } from '../../../lib/auth/tenant-guard';
import { CreateCampaignSchema } from '../../../lib/validation/campaigns';

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

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let campaignId: string | undefined;

  try {
    // Resolve tenant context with proper authentication
    const guardResult = resolveTenantContext(req);

    if (!guardResult.success) {
      logTenantOperation({
        module: 'campaigns',
        action: 'create',
        status: 'error',
        errorCode: guardResult.error?.code,
        duration: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          code: guardResult.error?.code || 'UNAUTHORIZED',
          message: guardResult.error?.message || 'Authentication required',
        },
        { status: guardResult.error?.status || 401 }
      );
    }

    const { ownerUid, isDevFallback } = guardResult.context!;

    // Parse and validate request body
    const body = await req.json();
    const validationResult = CreateCampaignSchema.safeParse(body);

    if (!validationResult.success) {
      logTenantOperation({
        module: 'campaigns',
        action: 'create',
        ownerUid,
        status: 'error',
        errorCode: 'VALIDATION_ERROR',
        duration: Date.now() - startTime,
        metadata: {
          validationErrors: validationResult.error.issues,
          isDevFallback,
        },
      });

      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Validate connection if provided
    let connectionId = validData.connectionId;
    if (connectionId) {
      const connection = await prisma.oAuthConnection.findFirst({
        where: {
          id: connectionId,
          ownerUid,
          platform: validData.platform,
          status: 'CONNECTED',
        },
      });

      if (!connection) {
        logTenantOperation({
          module: 'campaigns',
          action: 'create',
          ownerUid,
          status: 'error',
          errorCode: 'CONNECTION_NOT_FOUND',
          duration: Date.now() - startTime,
          metadata: {
            connectionId,
            platform: validData.platform,
            isDevFallback,
          },
        });

        return NextResponse.json(
          {
            code: 'CONNECTION_NOT_FOUND',
            message: 'Invalid or disconnected OAuth connection',
          },
          { status: 400 }
        );
      }
    }

    // Create the campaign data with validated input
    const campaignData = {
      ownerUid,
      name: validData.name,
      platform: validData.platform,
      goal: validData.goal,
      budget: validData.budget || null,
      dailyBudget: validData.dailyBudget || null,
      audience: validData.audience || null,
      creative: validData.creative || null,
      startDate: validData.startDate ? new Date(validData.startDate) : null,
      endDate: validData.endDate ? new Date(validData.endDate) : null,
      connectionId: connectionId || null,
      status: 'DRAFT' as const,
      spend: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
    };

    // Create the campaign in the database
    const newCampaign = await prisma.campaign.create({
      data: campaignData,
    });

    campaignId = newCampaign.id;

    logTenantOperation({
      module: 'campaigns',
      action: 'create',
      ownerUid,
      status: 'success',
      id: campaignId,
      duration: Date.now() - startTime,
      metadata: {
        platform: validData.platform,
        goal: validData.goal,
        hasConnection: Boolean(connectionId),
        isDevFallback,
      },
    });

    return NextResponse.json(
      {
        id: newCampaign.id,
        createdAt: newCampaign.createdAt.toISOString(),
        success: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logTenantOperation({
      module: 'campaigns',
      action: 'create',
      status: 'error',
      errorCode: 'DATABASE_ERROR',
      id: campaignId,
      duration: Date.now() - startTime,
      metadata: {
        error: error?.message,
      },
    });

    console.error('[CampaignsAPI] Create error:', error);

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create campaign',
      },
      { status: 500 }
    );
  }
}