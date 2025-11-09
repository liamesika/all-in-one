export const dynamic = 'force-dynamic';
/**
 * Productions Vertical - Files API (v2)
 * Uses ProductionFileAsset schema with organizationId field
 * GET: List files for a project
 * DELETE: Delete a file
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { FileFolder } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { getStorage } from 'firebase-admin/storage';

/**
 * GET /api/productions-v2/files
 * List files for a project
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to org
    const project = await prisma.productionProject.findFirst({
      where: { id: projectId, organizationId: orgId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const files = await prisma.productionFileAsset.findMany({
      where: {
        projectId,
        organizationId: orgId,
      },
      orderBy: [
        { folder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(files);
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files', details: error.message },
      { status: 500 }
    );
  }
});
