export const dynamic = 'force-dynamic';
/**
 * Productions Vertical - Tasks API (v2)
 * Uses ProductionTask schema with organizationId field
 * GET: List tasks
 * POST: Create new task
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { TaskDomain, ProductionTaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';

// Validation schema for creating a task
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().optional().nullable(),
  domain: z.nativeEnum(TaskDomain).default('LOGISTICS'),
  status: z.nativeEnum(ProductionTaskStatus).default('OPEN'),
  dueDate: z.string().datetime().optional().nullable(),
  predecessorId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  projectId: z.string().cuid('Invalid project ID'),
});

/**
 * GET /api/productions-v2/tasks
 * List production tasks (optionally filtered by project, assignee, status)
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status') as ProductionTaskStatus | null;

    const where: any = { organizationId: orgId };

    // Filter by project (and verify org access)
    if (projectId) {
      const project = await prisma.productionProject.findFirst({
        where: { id: projectId, organizationId: orgId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      where.projectId = projectId;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (status) {
      where.status = status;
    }

    const tasks = await prisma.productionTask.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/productions-v2/tasks
 * Create a new production task
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = createTaskSchema.parse(body);

    // Verify project exists and belongs to org
    const project = await prisma.productionProject.findFirst({
      where: { id: validated.projectId, organizationId: orgId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify assignee exists if provided
    if (validated.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: validated.assigneeId },
        select: { id: true },
      });

      if (!assignee) {
        return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
      }
    }

    const task = await prisma.productionTask.create({
      data: {
        ...validated,
        organizationId: orgId,
        ownerUid: user.uid,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions V2 API] Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: error.message },
      { status: 500 }
    );
  }
});
