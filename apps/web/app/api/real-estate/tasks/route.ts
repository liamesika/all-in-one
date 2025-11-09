export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';


export const GET = withAuth(async (request, { user }) => {
  try {
    const tenantId = getOwnerUid(user);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const agentId = searchParams.get('agentId');
    const propertyId = searchParams.get('propertyId');
    const search = searchParams.get('search');
    const urgent = searchParams.get('urgent');

    const where: any = { tenantId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (agentId) {
      where.assignees = {
        some: {
          agentId,
        },
      };
    }

    if (propertyId) {
      where.properties = {
        some: {
          propertyId,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (urgent === 'true') {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      where.dueDate = {
        lte: threeDaysFromNow,
      };
      where.status = {
        not: 'DONE',
      };
    }

    const tasks = await prisma.agentTask.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignees: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        properties: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
              },
            },
          },
        },
        _count: {
          select: {
            activities: true,
            attachments: true,
            reminders: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const tenantId = getOwnerUid(user);
    const userId = user.uid;
    const body = await request.json();
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      startDate,
      agentIds,
      propertyIds,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Find or create creator as agent
    let creator = await prisma.agent.findFirst({
      where: { tenantId, userId },
    });

    if (!creator) {
      creator = await prisma.agent.create({
        data: {
          tenantId,
          userId,
          name: user.email || 'Unknown',
          email: user.email || 'unknown@effinity.com',
          role: 'MANAGER',
        },
      });
    }

    const task = await prisma.agentTask.create({
      data: {
        tenantId,
        title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        createdById: creator.id,
        assignees: agentIds?.length
          ? {
              create: agentIds.map((agentId: string) => ({
                agentId,
              })),
            }
          : undefined,
        properties: propertyIds?.length
          ? {
              create: propertyIds.map((propertyId: string) => ({
                propertyId,
              })),
            }
          : undefined,
        activities: {
          create: {
            actorId: creator.id,
            type: 'CREATED',
            message: `Created task: ${title}`,
          },
        },
      },
      include: {
        assignees: {
          include: {
            agent: true,
          },
        },
        properties: {
          include: {
            property: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
});

export const PATCH = withAuth(async (request, { user }) => {
  try {
    const tenantId = getOwnerUid(user);
    const userId = user.uid;
    const body = await request.json();
    const { id, agentIds, propertyIds, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await prisma.agentTask.findFirst({
      where: { id, tenantId },
      include: { creator: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Find actor
    let actor = await prisma.agent.findFirst({
      where: { tenantId, userId },
    });

    if (!actor) {
      actor = await prisma.agent.create({
        data: {
          tenantId,
          userId,
          name: user.email || 'Unknown',
          email: user.email || 'unknown@effinity.com',
          role: 'MANAGER',
        },
      });
    }

    // Track status changes
    const statusChanged = updates.status && updates.status !== task.status;

    // Update assignees if provided
    if (agentIds) {
      await prisma.agentTaskAssignee.deleteMany({
        where: { taskId: id },
      });
      await prisma.agentTaskAssignee.createMany({
        data: agentIds.map((agentId: string) => ({
          taskId: id,
          agentId,
        })),
      });
    }

    // Update properties if provided
    if (propertyIds) {
      await prisma.agentTaskProperty.deleteMany({
        where: { taskId: id },
      });
      await prisma.agentTaskProperty.createMany({
        data: propertyIds.map((propertyId: string) => ({
          taskId: id,
          propertyId,
        })),
      });
    }

    const updatedTask = await prisma.agentTask.update({
      where: { id },
      data: {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        activities: statusChanged
          ? {
              create: {
                actorId: actor.id,
                type: 'STATUS_CHANGED',
                message: `Changed status from ${task.status} to ${updates.status}`,
              },
            }
          : undefined,
      },
      include: {
        assignees: {
          include: {
            agent: true,
          },
        },
        properties: {
          include: {
            property: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, { user }) => {
  try {
    const tenantId = getOwnerUid(user);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await prisma.agentTask.findFirst({
      where: { id, tenantId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.agentTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
});
