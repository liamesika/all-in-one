export const dynamic = 'force-dynamic';
/**
 * Creative Productions - Stats API
 * GET: Dashboard statistics
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';


/**
 * GET /api/productions/stats
 * Get dashboard statistics for productions
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      activeProjects,
      totalAssets,
      pendingReviews,
      dueThisWeek,
      projectsByStatus,
      recentActivity,
    ] = await Promise.all([
      // Active projects count
      prisma.creativeProject.count({
        where: {
          orgId,
          status: { in: ['IN_PROGRESS', 'REVIEW'] },
        },
      }),

      // Total assets count
      prisma.creativeAsset.count({
        where: { orgId },
      }),

      // Pending reviews count
      prisma.creativeReview.count({
        where: {
          project: { orgId },
          status: 'PENDING',
        },
      }),

      // Projects due this week
      prisma.creativeProject.count({
        where: {
          orgId,
          dueDate: {
            gte: now,
            lte: oneWeekFromNow,
          },
          status: { notIn: ['DELIVERED', 'APPROVED'] },
        },
      }),

      // Projects grouped by status
      prisma.creativeProject.groupBy({
        by: ['status'],
        where: { orgId },
        _count: true,
      }),

      // Recent activity (last 10 projects)
      prisma.creativeProject.findMany({
        where: { orgId },
        select: {
          id: true,
          name: true,
          status: true,
          updatedAt: true,
          ownerUid: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      stats: {
        activeProjects,
        totalAssets,
        pendingReviews,
        dueThisWeek,
      },
      projectsByStatus: projectsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentActivity,
    });
  } catch (error: any) {
    console.error('[Productions API] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
});
