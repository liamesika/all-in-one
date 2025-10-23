import { NextRequest, NextResponse } from 'next/server';
import type { Task, UpdateTaskInput } from '@/lib/types/law/task';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /api/law/tasks/[id] - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(400);

  const { id } = await params;

  // Mock task data
  const mockTask: Task = {
    id,
    title: 'Sample Task',
    description: 'Sample task description',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-02-15',
    case: {
      id: 'case-1',
      caseNumber: 'CASE-2024-001',
      title: 'Sample Case',
    },
    assignee: {
      id: 'attorney-1',
      name: 'Attorney Name',
      email: 'attorney@lawfirm.com',
    },
    createdBy: {
      id: 'attorney-1',
      name: 'Attorney Name',
    },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ task: mockTask });
}

// PATCH /api/law/tasks/[id] - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(600);

  const { id } = await params;

  try {
    const input: UpdateTaskInput = await request.json();

    const updatedTask: Task = {
      id,
      title: input.title || 'Updated Task',
      description: input.description,
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      dueDate: input.dueDate,
      completedAt: input.completedAt,
      caseId: input.caseId,
      assignee: {
        id: input.assigneeId || 'attorney-1',
        name: 'Assignee Name',
        email: 'assignee@lawfirm.com',
      },
      createdBy: {
        id: 'current-user',
        name: 'Current User',
      },
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/law/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(500);

  const { id } = await params;

  return NextResponse.json({
    success: true,
    message: 'Task deleted successfully',
    id,
  });
}
