/**
 * Creative Productions - Projects API
 * GET: List projects
 * POST: Create new project
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { PrismaClient, CreativeProjectStatus } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  objective: z.string().optional(),
  targetAudience: z.string().optional(),
  channels: z.array(z.string()).default([]),
  status: z.nativeEnum(CreativeProjectStatus).default('DRAFT'),
  dueDate: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/productions/projects
 * List all creative projects for the organization
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as CreativeProjectStatus | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { orgId };
    if (status) {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.creativeProject.findMany({
        where,
        include: {
          tasks: {
            select: {
              id: true,
              status: true,
              type: true,
            },
          },
          assets: {
            select: {
              id: true,
              type: true,
            },
          },
          reviews: {
            where: {
              status: 'PENDING',
            },
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              assets: true,
              reviews: true,
              renders: true,
            },
          },
        },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.creativeProject.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('[Productions API] Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/productions/projects
 * Create a new creative project
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.creativeProject.create({
      data: {
        ...validated,
        orgId,
        ownerUid: user.uid,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      },
      include: {
        tasks: true,
        assets: true,
        reviews: true,
        renders: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    );
  }
});
