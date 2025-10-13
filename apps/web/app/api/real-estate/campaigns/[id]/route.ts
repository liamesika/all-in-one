import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/real-estate/campaigns/[id] - Fetch single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerUid = request.headers.get('x-owner-uid') || 'demo-user';

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
}

// PATCH /api/real-estate/campaigns/[id] - Update campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerUid = request.headers.get('x-owner-uid') || 'demo-user';
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
}

// DELETE /api/real-estate/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerUid = request.headers.get('x-owner-uid') || 'demo-user';

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
}
