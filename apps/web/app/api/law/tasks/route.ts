import { NextRequest, NextResponse } from 'next/server';
import type { Task, CreateTaskInput } from '@/lib/types/law/task';

// Mock database - in-memory storage for demo
let mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review contract documents for Acme Corp',
    description: 'Complete review of merger agreement and supporting documents',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-02-15',
    caseId: 'case-1',
    case: {
      id: 'case-1',
      caseNumber: 'CASE-2024-001',
      title: 'Acme Corp Merger',
    },
    assignee: {
      id: 'attorney-1',
      name: 'Sarah Williams',
      email: 'sarah.williams@lawfirm.com',
    },
    createdBy: {
      id: 'attorney-1',
      name: 'Sarah Williams',
    },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    title: 'Prepare motion for summary judgment',
    description: 'Draft and file motion in Anderson case',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2024-02-10',
    caseId: 'case-3',
    case: {
      id: 'case-3',
      caseNumber: 'CASE-2024-003',
      title: 'Anderson Employment Discrimination',
    },
    assignee: {
      id: 'attorney-1',
      name: 'Sarah Williams',
      email: 'sarah.williams@lawfirm.com',
    },
    createdBy: {
      id: 'attorney-2',
      name: 'Robert Chen',
    },
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '3',
    title: 'Client meeting - Estate planning discussion',
    description: 'Initial consultation for Davis family trust',
    status: 'review',
    priority: 'medium',
    dueDate: '2024-02-05',
    caseId: 'case-2',
    case: {
      id: 'case-2',
      caseNumber: 'CASE-2024-002',
      title: 'Davis Family Trust Formation',
    },
    assignee: {
      id: 'attorney-2',
      name: 'Robert Chen',
      email: 'robert.chen@lawfirm.com',
    },
    createdBy: {
      id: 'attorney-2',
      name: 'Robert Chen',
    },
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-25T16:45:00Z',
  },
  {
    id: '4',
    title: 'File quarterly compliance report',
    status: 'done',
    priority: 'low',
    completedAt: '2024-01-24T12:00:00Z',
    assignee: {
      id: 'attorney-2',
      name: 'Robert Chen',
      email: 'robert.chen@lawfirm.com',
    },
    createdBy: {
      id: 'attorney-2',
      name: 'Robert Chen',
    },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-24T12:00:00Z',
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /api/law/tasks - List tasks with filters
export async function GET(request: NextRequest) {
  await delay(500);

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const assigneeId = searchParams.get('assigneeId');
  const caseId = searchParams.get('caseId');
  const search = searchParams.get('search');

  let filtered = [...mockTasks];

  // Apply filters
  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (priority) {
    filtered = filtered.filter((t) => t.priority === priority);
  }
  if (assigneeId) {
    filtered = filtered.filter((t) => t.assignee.id === assigneeId);
  }
  if (caseId) {
    filtered = filtered.filter((t) => t.caseId === caseId);
  }
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.case?.title.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    tasks: filtered,
    total: filtered.length,
  });
}

// POST /api/law/tasks - Create new task
export async function POST(request: NextRequest) {
  await delay(700);

  try {
    const input: CreateTaskInput = await request.json();

    if (!input.title || !input.assigneeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: input.title,
      description: input.description,
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      dueDate: input.dueDate,
      caseId: input.caseId,
      assignee: {
        id: input.assigneeId,
        name: 'Assignee Name', // In real app, fetch from database
        email: 'assignee@lawfirm.com',
      },
      createdBy: {
        id: 'current-user',
        name: 'Current User',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTasks.push(newTask);

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
