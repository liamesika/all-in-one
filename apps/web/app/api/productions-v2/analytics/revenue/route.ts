export const dynamic = 'force-dynamic';
/**
 * Productions Vertical - Revenue Analytics API (v2)
 * GET: Get revenue data over time
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';

/**
 * GET /api/productions-v2/analytics/revenue
 * Get revenue data for specified period
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get budget items created within the period
    const budgetItems = await prisma.productionBudgetItem.findMany({
      where: {
        organizationId: orgId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        actual: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date and sum revenue
    const revenueByDate = new Map<string, number>();

    budgetItems.forEach(item => {
      const dateKey = item.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentRevenue = revenueByDate.get(dateKey) || 0;
      revenueByDate.set(dateKey, currentRevenue + item.actual);
    });

    // Convert to array format
    const revenueData = Array.from(revenueByDate.entries()).map(([date, value]) => ({
      label: date,
      value,
    }));

    // Fill in missing dates with zero values for better visualization
    const result: { label: string; value: number }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const existingData = revenueData.find(d => d.label === dateKey);

      result.push({
        label: dateKey,
        value: existingData?.value || 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data', details: error.message },
      { status: 500 }
    );
  }
});
