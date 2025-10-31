import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// PUT /api/law/tasks/[id] - Update task
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, priority, status, boardColumn, dueDate, completedDate, assignedToId } = body;

    const existingTask = await prisma.lawTask.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updatedTask = await prisma.lawTask.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(boardColumn && { boardColumn }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completedDate !== undefined && { completedDate: completedDate ? new Date(completedDate) : null }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
      },
    });

    console.log('[PUT /api/law/tasks/[id]] Updated:', id);
    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('[PUT /api/law/tasks/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/law/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingTask = await prisma.lawTask.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.lawTask.delete({ where: { id } });

    console.log('[DELETE /api/law/tasks/[id]] Deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/law/tasks/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
