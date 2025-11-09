export const dynamic = 'force-dynamic';
/**
 * Productions Vertical - Task Metrics Analytics API (v2)
 * GET: Get task metrics by status
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { ProductionTaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';

/**
 * GET /api/productions-v2/analytics/tasks/metrics
 * Get task metrics by status
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const tasks = await prisma.productionTask.findMany({
      where: { organizationId: orgId },
      select: {
        status: true,
      },
    });

    // Count by status
    const metrics = new Map<ProductionTaskStatus, number>();

    tasks.forEach(task => {
      const currentCount = metrics.get(task.status) || 0;
      metrics.set(task.status, currentCount + 1);
    });

    // Convert to array format
    const result = Array.from(metrics.entries()).map(([status, value]) => ({
      label: status,
      value,
    }));

    // Ensure all statuses are represented
    const allStatuses: ProductionTaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE', 'BLOCKED'];
    allStatuses.forEach(status => {
      if (!result.find(r => r.label === status)) {
        result.push({ label: status, value: 0 });
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching task metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task metrics', details: error.message },
      { status: 500 }
    );
  }
});
