/**
 * Productions Vertical - Project Distribution Analytics API (v2)
 * GET: Get project distribution by type
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { ProjectType } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';

// Color mapping for project types
const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  CONFERENCE: '#3b82f6', // blue
  SHOW: '#8b5cf6', // purple
  FILMING: '#10b981', // green
  OTHER: '#6b7280', // gray
};

/**
 * GET /api/productions-v2/analytics/projects/distribution
 * Get project distribution by type
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const projects = await prisma.productionProject.findMany({
      where: { organizationId: orgId },
      select: {
        type: true,
      },
    });

    // Count by type
    const distribution = new Map<ProjectType, number>();

    projects.forEach(project => {
      const currentCount = distribution.get(project.type) || 0;
      distribution.set(project.type, currentCount + 1);
    });

    // Convert to array format with colors
    const result = Array.from(distribution.entries())
      .filter(([_, value]) => value > 0) // Only include types with projects
      .map(([type, value]) => ({
        label: type,
        value,
        color: PROJECT_TYPE_COLORS[type],
      }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching project distribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project distribution', details: error.message },
      { status: 500 }
    );
  }
});
