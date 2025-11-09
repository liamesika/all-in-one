export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';


// GET /api/real-estate/campaigns/[id] - Fetch single campaign
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { id } = await params;
    const ownerUid = getOwnerUid(user);

    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        ownerUid,
      },
      include: {
        connection: {
          select: {
            displayName: true,
            accountEmail: true,
          },
        },
        leads: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
});

// PATCH /api/real-estate/campaigns/[id] - Update campaign
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    const { id } = await params;
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    // Verify ownership
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        ownerUid,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.goal !== undefined) updateData.goal = body.goal;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.dailyBudget !== undefined) updateData.dailyBudget = body.dailyBudget;
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    // Update creative data if provided
    if (body.headline !== undefined || body.description !== undefined || body.imageUrl !== undefined) {
      updateData.creative = {
        ...(existingCampaign.creative as any || {}),
        ...(body.headline !== undefined && { headline: body.headline }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      };
    }

    // Update audience if provided
    if (body.audience !== undefined) {
      updateData.audience = body.audience;
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        connection: {
          select: {
            displayName: true,
            accountEmail: true,
          },
        },
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
});

// DELETE /api/real-estate/campaigns/[id] - Delete campaign
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const { id } = await params;
    const ownerUid = getOwnerUid(user);

    // Verify ownership
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        ownerUid,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Delete campaign
    await prisma.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
});