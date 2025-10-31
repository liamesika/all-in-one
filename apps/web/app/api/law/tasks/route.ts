import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedToId = searchParams.get('assignedToId');
    const caseId = searchParams.get('caseId');
    const search = searchParams.get('search');

    const where: any = { ownerUid: currentUser.uid };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (caseId) where.caseId = caseId;

    const tasks = await prisma.lawTask.findMany({
      where,
      orderBy: [{ boardColumn: 'asc' }, { boardOrder: 'asc' }],
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('[GET /api/law/tasks] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/law/tasks - Create task
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, status, dueDate, caseId, assignedToId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Verify case belongs to user if caseId provided
    if (caseId) {
      const caseExists = await prisma.lawCase.findFirst({
        where: { id: caseId, ownerUid: currentUser.uid },
      });
      if (!caseExists) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }
    }

    const task = await prisma.lawTask.create({
      data: {
        title,
        description,
        priority: priority || 'medium',
        status: status || 'todo',
        boardColumn: status || 'todo',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        caseId,
        assignedToId,
        ownerUid: currentUser.uid,
        organizationId: currentUser.uid,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
      },
    });

    console.log('[POST /api/law/tasks] Created:', task.id);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/law/tasks] Error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
