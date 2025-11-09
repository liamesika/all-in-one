export const dynamic = 'force-dynamic';
/**
 * Productions Vertical - Projects API (v2)
 * Uses ProductionProject schema with organizationId field
 * GET: List projects
 * POST: Create new project
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { ProjectType, ProjectStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';

// Validation schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(ProjectType).default('OTHER'),
  status: z.nativeEnum(ProjectStatus).default('PLANNING'),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/productions-v2/projects
 * List all production projects for the organization
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ProjectStatus | null;
    const type = searchParams.get('type') as ProjectType | null;
    const search = searchParams.get('search');

    const where: any = { organizationId: orgId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const projects = await prisma.productionProject.findMany({
      where,
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            domain: true,
          },
        },
        budgetItems: {
          select: {
            id: true,
            category: true,
            planned: true,
            actual: true,
          },
        },
        files: {
          select: {
            id: true,
            name: true,
            folder: true,
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
      orderBy: [
        { status: 'asc' },
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/productions-v2/projects
 * Create a new production project
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.productionProject.create({
      data: {
        ...validated,
        organizationId: orgId,
        ownerUid: user.uid,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
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

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions V2 API] Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    );
  }
});
