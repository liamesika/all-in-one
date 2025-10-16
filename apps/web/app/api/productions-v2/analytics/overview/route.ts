/**
 * Productions Vertical - Analytics Overview API (v2)
 * GET: Get overview analytics for dashboard
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';

/**
 * GET /api/productions-v2/analytics/overview
 * Get aggregated overview metrics for productions vertical
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    // Get all projects for calculations
    const projects = await prisma.productionProject.findMany({
      where: { organizationId: orgId },
      select: {
        status: true,
        budgetItems: {
          select: {
            planned: true,
            actual: true,
          },
        },
      },
    });

    // Get all tasks for calculations
    const tasks = await prisma.productionTask.findMany({
      where: { organizationId: orgId },
      select: {
        status: true,
      },
    });

    // Calculate total revenue from budget items
    const totalRevenue = projects.reduce((sum, project) => {
      const projectRevenue = project.budgetItems.reduce((pSum, item) => pSum + item.actual, 0);
      return sum + projectRevenue;
    }, 0);

    // Calculate active projects
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;

    // Calculate completed tasks
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;

    // For growth metrics, we'd need historical data
    // For now, returning placeholder values
    const revenueGrowth = 0; // Would need to compare with previous period
    const projectGrowth = 0; // Would need to compare with previous period

    // Task completion rate
    const taskCompletionRate = tasks.length > 0
      ? (completedTasks / tasks.length) * 100
      : 0;

    return NextResponse.json({
      totalRevenue,
      activeProjects,
      completedTasks,
      totalClients: 0, // Would need ProductionClient model data
      revenueGrowth,
      projectGrowth,
      taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
      clientGrowth: 0,
    });
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview', details: error.message },
      { status: 500 }
    );
  }
});
