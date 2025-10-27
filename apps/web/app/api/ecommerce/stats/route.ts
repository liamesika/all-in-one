import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { getCurrentUser } from '@/lib/auth.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create EcomStats for user
    let stats = await prisma.ecomStats.findUnique({
      where: { ownerUid: currentUser.uid },
    });

    if (!stats) {
      stats = await prisma.ecomStats.create({
        data: {
          ownerUid: currentUser.uid,
        },
      });
    }

    return NextResponse.json({
      stats: {
        tutorialsCompleted: stats.tutorialsCompleted,
        totalTutorials: stats.totalTutorials,
        productsUploaded: stats.productsUploaded,
        aiImagesGenerated: stats.aiImagesGenerated,
        lastPerformanceScore: stats.lastPerformanceScore,
        csvSessionsCompleted: stats.csvSessionsCompleted,
        campaignBriefsCreated: stats.campaignBriefsCreated,
        shopifyConnected: stats.shopifyConnected,
        shopifyStoreUrl: stats.shopifyStoreUrl,
        tutorialTasks: stats.tutorialTasks || null,
      },
    });
  } catch (error) {
    console.error('[GET /api/ecommerce/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
