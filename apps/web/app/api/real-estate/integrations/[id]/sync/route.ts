import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/real-estate/integrations/[id]/sync - Trigger manual sync
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ownerUid = request.headers.get('x-owner-uid') || 'demo-user';
    const { id } = params;

    // Check if integration exists and belongs to user
    const integration = await prisma.integration.findFirst({
      where: {
        id,
        ownerUid,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    if (integration.status !== 'CONNECTED') {
      return NextResponse.json(
        { error: 'Integration is not connected' },
        { status: 400 }
      );
    }

    // Update status to SYNCING
    await prisma.integration.update({
      where: { id },
      data: {
        status: 'SYNCING',
      },
    });

    // Create sync log
    const syncLog = await prisma.integrationSyncLog.create({
      data: {
        integrationId: id,
        syncType: 'MANUAL',
        status: 'SUCCESS',
        itemsSynced: 0,
        itemsFailed: 0,
        startedAt: new Date(),
      },
    });

    // TODO: Implement actual sync logic based on integration type
    // For now, just simulate a successful sync
    setTimeout(async () => {
      try {
        await prisma.integrationSyncLog.update({
          where: { id: syncLog.id },
          data: {
            completedAt: new Date(),
            status: 'SUCCESS',
          },
        });

        await prisma.integration.update({
          where: { id },
          data: {
            status: 'CONNECTED',
            lastSyncAt: new Date(),
            syncCount: integration.syncCount + 1,
          },
        });
      } catch (error) {
        console.error('[Sync] Failed to update after sync:', error);
      }
    }, 2000);

    console.log('[Integrations API] Sync triggered for:', id);

    return NextResponse.json({
      message: 'Sync started',
      syncLogId: syncLog.id,
    });
  } catch (error: any) {
    console.error('[Integrations API] Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger sync', details: error.message },
      { status: 500 }
    );
  }
}
