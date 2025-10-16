/**
 * Productions Vertical - Task Detail API (v2)
 * GET: Get single task
 * PATCH: Update task
 * DELETE: Delete task
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { TaskDomain, ProductionTaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';

// Validation schema for updating a task
const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  domain: z.nativeEnum(TaskDomain).optional(),
  status: z.nativeEnum(ProductionTaskStatus).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  predecessorId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

/**
 * GET /api/productions-v2/tasks/[id]
 * Get a single production task by ID
 */
export const GET = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params;

    const task = await prisma.productionTask.findFirst({
      where: {
        id,
        organizationId: orgId,
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

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/productions-v2/tasks/[id]
 * Update a production task
 */
export const PATCH = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = updateTaskSchema.parse(body);

    // Verify task exists and belongs to org
    const existingTask = await prisma.productionTask.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify assignee exists if provided
    if (validated.assigneeId !== undefined && validated.assigneeId !== null) {
      const assignee = await prisma.user.findUnique({
        where: { id: validated.assigneeId },
        select: { id: true },
      });

      if (!assignee) {
        return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
      }
    }

    const task = await prisma.productionTask.update({
      where: { id },
      data: {
        ...validated,
        dueDate: validated.dueDate !== undefined
          ? (validated.dueDate ? new Date(validated.dueDate) : null)
          : undefined,
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

    return NextResponse.json(task);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions V2 API] Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/productions-v2/tasks/[id]
 * Delete a production task
 */
export const DELETE = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params;

    // Verify task exists and belongs to org
    const existingTask = await prisma.productionTask.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete task
    await prisma.productionTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Productions V2 API] Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task', details: error.message },
      { status: 500 }
    );
  }
});
