export const dynamic = 'force-dynamic';
/**
 * Productions Vertical - Project Statistics API (v2)
 * GET: Get project statistics for dashboard
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { ProjectType, ProjectStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';

/**
 * GET /api/productions-v2/projects/stats
 * Get aggregated statistics for production projects
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    // Get all projects for the organization
    const projects = await prisma.productionProject.findMany({
      where: { organizationId: orgId },
      select: {
        status: true,
        type: true,
      },
    });

    const total = projects.length;
    const active = projects.filter(p => p.status === 'ACTIVE').length;
    const planning = projects.filter(p => p.status === 'PLANNING').length;
    const done = projects.filter(p => p.status === 'DONE').length;

    // Count by type
    const byType: Record<ProjectType, number> = {
      CONFERENCE: 0,
      SHOW: 0,
      FILMING: 0,
      OTHER: 0,
    };

    projects.forEach(project => {
      byType[project.type] = (byType[project.type] || 0) + 1;
    });

    return NextResponse.json({
      total,
      active,
      planning,
      done,
      byType,
    });
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching project stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project statistics', details: error.message },
      { status: 500 }
    );
  }
});
