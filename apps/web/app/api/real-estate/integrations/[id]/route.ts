export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


const updateIntegrationSchema = z.object({
  status: z.enum(['CONNECTED', 'DISCONNECTED', 'ERROR', 'SYNCING']).optional(),
  credentials: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  errorMessage: z.string().nullable().optional(),
});

// GET /api/real-estate/integrations/[id] - Get integration details
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

    const integration = await prisma.integration.findFirst({
      where: {
        id,
        ownerUid,
      },
      include: {
        syncLogs: {
          take: 20,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(integration);
  } catch (error: any) {
    console.error('[Integrations API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration' },
      { status: 500 }
    );
  }
});

// PATCH /api/real-estate/integrations/[id] - Update integration settings
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    // Validate input
    const result = updateIntegrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    // Check if integration exists and belongs to user
    const existing = await prisma.integration.findFirst({
      where: {
        id,
        ownerUid,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Update integration
    const integration = await prisma.integration.update({
      where: { id },
      data: {
        ...result.data,
        updatedAt: new Date(),
      },
    });

    console.log('[Integrations API] Updated integration:', integration.id);

    return NextResponse.json(integration);
  } catch (error: any) {
    console.error('[Integrations API] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update integration', details: error.message },
      { status: 500 }
    );
  }
});

// DELETE /api/real-estate/integrations/[id] - Disconnect/delete integration
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

    // Check if integration exists and belongs to user
    const existing = await prisma.integration.findFirst({
      where: {
        id,
        ownerUid,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Delete integration (cascade will delete sync logs)
    await prisma.integration.delete({
      where: { id },
    });

    console.log('[Integrations API] Deleted integration:', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Integrations API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete integration', details: error.message },
      { status: 500 }
    );
  }
});
