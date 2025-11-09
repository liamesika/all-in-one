export const dynamic = 'force-dynamic';
/**
 * Creative Productions - Tasks API
 * GET: List tasks
 * POST: Create new task
 * PATCH: Update task (bulk or single)
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { CreativeTaskType, CreativeTaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


// Validation schema for creating a task
const createTaskSchema = z.object({
  projectId: z.string().cuid(),
  type: z.nativeEnum(CreativeTaskType),
  title: z.string().min(1).max(200),
  status: z.nativeEnum(CreativeTaskStatus).default('TODO'),
  assigneeUid: z.string().optional().nullable(),
  priority: z.number().int().min(0).max(2).default(0),
  startAt: z.string().datetime().optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
  checklist: z.array(z.object({
    id: z.string(),
    text: z.string(),
    done: z.boolean(),
  })).optional(),
  notes: z.string().optional().nullable(),
});

// Validation schema for updating a task
const updateTaskSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200).optional(),
  type: z.nativeEnum(CreativeTaskType).optional(),
  status: z.nativeEnum(CreativeTaskStatus).optional(),
  assigneeUid: z.string().optional().nullable(),
  priority: z.number().int().min(0).max(2).optional(),
  startAt: z.string().datetime().optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
  checklist: z.any().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/productions/tasks
 * List tasks (optionally filtered by projectId, assignee, status)
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assigneeUid = searchParams.get('assigneeUid');
    const status = searchParams.get('status') as CreativeTaskStatus | null;
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};

    // Filter by project (and verify org access)
    if (projectId) {
      const project = await prisma.creativeProject.findFirst({
        where: { id: projectId, orgId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      where.projectId = projectId;
    } else {
      // If no projectId, filter by org through project relation
      where.project = { orgId };
    }

    if (assigneeUid) {
      where.assigneeUid = assigneeUid;
    }

    if (status) {
      where.status = status;
    }

    const tasks = await prisma.creativeTask.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueAt: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('[Productions API] Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/productions/tasks
 * Create a new task
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = createTaskSchema.parse(body);

    // Verify project exists and belongs to org
    const project = await prisma.creativeProject.findFirst({
      where: { id: validated.projectId, orgId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const task = await prisma.creativeTask.create({
      data: {
        ...validated,
        startAt: validated.startAt ? new Date(validated.startAt) : null,
        dueAt: validated.dueAt ? new Date(validated.dueAt) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/productions/tasks
 * Update task(s) - supports bulk update
 */
export const PATCH = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();

    // Support both single task update and bulk updates
    const updates = Array.isArray(body) ? body : [body];
    const validated = updates.map(u => updateTaskSchema.parse(u));

    // Verify all tasks belong to org
    const taskIds = validated.map(t => t.id);
    const tasks = await prisma.creativeTask.findMany({
      where: {
        id: { in: taskIds },
        project: { orgId },
      },
      select: { id: true },
    });

    if (tasks.length !== taskIds.length) {
      return NextResponse.json(
        { error: 'One or more tasks not found' },
        { status: 404 }
      );
    }

    // Perform updates
    const updated = await Promise.all(
      validated.map(taskData => {
        const { id, ...data } = taskData;
        return prisma.creativeTask.update({
          where: { id },
          data: {
            ...data,
            startAt: data.startAt ? new Date(data.startAt) : undefined,
            dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        });
      })
    );

    return NextResponse.json({
      tasks: Array.isArray(body) ? updated : updated[0],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error updating tasks:', error);
    return NextResponse.json(
      { error: 'Failed to update tasks', details: error.message },
      { status: 500 }
    );
  }
});
