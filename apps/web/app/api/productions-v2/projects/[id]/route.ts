export const dynamic = 'force-dynamic';
/**
 * Productions Vertical - Project Detail API (v2)
 * GET: Get single project
 * PATCH: Update project
 * DELETE: Delete project
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { ProjectType, ProjectStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';

// Validation schema for updating a project
const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(ProjectType).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/productions-v2/projects/[id]
 * Get a single production project by ID
 */
export const GET = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params;

    const project = await prisma.productionProject.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        budgetItems: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        files: true,
        suppliers: {
          include: {
            supplier: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            budgetItems: true,
            files: true,
            suppliers: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/productions-v2/projects/[id]
 * Update a production project
 */
export const PATCH = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = updateProjectSchema.parse(body);

    // Verify project exists and belongs to org
    const existingProject = await prisma.productionProject.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = await prisma.productionProject.update({
      where: { id },
      data: {
        ...validated,
        startDate: validated.startDate !== undefined
          ? (validated.startDate ? new Date(validated.startDate) : null)
          : undefined,
        endDate: validated.endDate !== undefined
          ? (validated.endDate ? new Date(validated.endDate) : null)
          : undefined,
      },
      include: {
        tasks: true,
        budgetItems: true,
        files: true,
        suppliers: true,
        _count: {
          select: {
            tasks: true,
            budgetItems: true,
            files: true,
            suppliers: true,
          },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions V2 API] Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/productions-v2/projects/[id]
 * Delete a production project
 */
export const DELETE = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params;

    // Verify project exists and belongs to org
    const existingProject = await prisma.productionProject.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete project (cascade will delete related tasks, budget items, files, suppliers)
    await prisma.productionProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Productions V2 API] Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project', details: error.message },
      { status: 500 }
    );
  }
});
