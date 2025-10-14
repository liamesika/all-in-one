import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

const prisma = new PrismaClient();

// GET /api/real-estate/campaigns - List all campaigns
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerUid = getOwnerUid(user);
    const orgId = request.headers.get('x-org-id');

    // Build filters
    const where: any = {
      ownerUid,
    };

    // If orgId is provided, filter by organization
    if (orgId && orgId !== 'demo') {
      where.orgId = orgId;
    }

    // Status filter
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      where.status = status;
    }

    // Platform filter
    const platform = searchParams.get('platform');
    if (platform && platform !== 'all') {
      where.platform = platform;
    }

    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        connection: {
          select: {
            displayName: true,
            accountEmail: true,
          },
        },
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
});

// POST /api/real-estate/campaigns - Create new campaign
export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const orgId = request.headers.get('x-org-id');

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.platform || !body.goal) {
      return NextResponse.json(
        { error: 'Missing required fields: name, platform, goal' },
        { status: 400 }
      );
    }

    // For MVP, create a dummy connection if none exists
    let connection = await prisma.oAuthConnection.findFirst({
      where: {
        ownerUid,
        platform: body.platform,
      },
    });

    // If no connection exists, create a placeholder
    if (!connection) {
      connection = await prisma.oAuthConnection.create({
        data: {
          ownerUid,
          platform: body.platform,
          status: 'DISCONNECTED',
        },
      });
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        ownerUid,
        orgId: orgId && orgId !== 'demo' ? orgId : null,
        name: body.name,
        platform: body.platform,
        status: body.status || 'DRAFT',
        goal: body.goal,
        budget: body.budget,
        dailyBudget: body.dailyBudget,
        audience: body.audience || null,
        creative: body.creative ? {
          headline: body.headline,
          description: body.description,
          imageUrl: body.imageUrl,
        } : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        connectionId: connection.id,
      },
      include: {
        connection: {
          select: {
            displayName: true,
            accountEmail: true,
          },
        },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
});
