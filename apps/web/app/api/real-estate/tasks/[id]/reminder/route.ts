export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';


export const POST = withAuth(async (request, { user, params }) => {
  try {
    const tenantId = getOwnerUid(user);
    const userId = user.uid;
    const taskId = params.id;
    const body = await request.json();
    const { agentId, message, scheduledAt } = body;

    const task = await prisma.agentTask.findFirst({
      where: { id: taskId, tenantId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

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

    const reminder = await prisma.agentTaskReminder.create({
      data: {
        taskId,
        agentId: agentId || null,
        message: message || `Reminder for task: ${task.title}`,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      },
    });

    await prisma.agentTaskActivity.create({
      data: {
        taskId,
        actorId: actor.id,
        type: 'REMINDER_SENT',
        message: `Sent reminder${agentId ? ' to agent' : ''}`,
      },
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error) {
    console.error('Create reminder error:', error);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
});
