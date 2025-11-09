export const dynamic = 'force-dynamic';
/**
 * Creative Productions - Single Project API
 * GET: Fetch project by ID
 * PATCH: Update project
 * DELETE: Delete project
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { CreativeProjectStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


// Validation schema for updating a project
const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  objective: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  channels: z.array(z.string()).optional(),
  status: z.nativeEnum(CreativeProjectStatus).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/productions/projects/[id]
 * Fetch a single project with full details
 */
export const GET = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };

    const project = await prisma.creativeProject.findFirst({
      where: { id, orgId },
      include: {
        tasks: {
          orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueAt: 'asc' }],
        },
        assets: {
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          orderBy: { requestedAt: 'desc' },
        },
        renders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('[Productions API] Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/productions/projects/[id]
 * Update a project
 */
export const PATCH = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };
    const body = await request.json();
    const validated = updateProjectSchema.parse(body);

    // Check project exists and belongs to org
    const existing = await prisma.creativeProject.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = await prisma.creativeProject.update({
      where: { id },
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      },
      include: {
        tasks: true,
        assets: true,
        reviews: true,
        renders: true,
      },
    });

    return NextResponse.json({ project });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/productions/projects/[id]
 * Delete a project (cascades to tasks, reviews, renders)
 */
export const DELETE = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };

    // Check project exists and belongs to org
    const existing = await prisma.creativeProject.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await prisma.creativeProject.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('[Productions API] Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project', details: error.message },
      { status: 500 }
    );
  }
});
