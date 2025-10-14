import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/real-estate/automations/[id]
 * Fetch a specific automation with execution history
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

    const automation = await prisma.automation.findFirst({
      where: {
        id,
        ownerUid,
      },
      include: {
        executions: {
          take: 50,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    return NextResponse.json(automation);
  } catch (error: any) {
    console.error('Error fetching automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

/**
 * PATCH /api/real-estate/automations/[id]
 * Update an automation
 */
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

    // Verify ownership
    const existing = await prisma.automation.findFirst({
      where: {
        id,
        ownerUid,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, trigger, actions, conditions, status } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (trigger !== undefined) updateData.trigger = trigger;
    if (actions !== undefined) updateData.actions = actions;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (status !== undefined) updateData.status = status;

    const automation = await prisma.automation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(automation);
  } catch (error: any) {
    console.error('Error updating automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

/**
 * DELETE /api/real-estate/automations/[id]
 * Delete an automation
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

    // Verify ownership
    const existing = await prisma.automation.findFirst({
      where: {
        id,
        ownerUid,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    await prisma.automation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
