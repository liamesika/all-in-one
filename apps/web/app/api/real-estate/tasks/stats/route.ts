import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET = withAuth(async (request, { user }) => {
  try {
    const tenantId = getOwnerUid(user);

    const [
      totalTasks,
      openTasks,
      urgentTasks,
      completedThisWeek,
      tasksByStatus,
      tasksByAgent,
    ] = await Promise.all([
      prisma.agentTask.count({
        where: { tenantId },
      }),
      prisma.agentTask.count({
        where: {
          tenantId,
          status: { not: 'DONE' },
        },
      }),
      prisma.agentTask.count({
        where: {
          tenantId,
          status: { not: 'DONE' },
          dueDate: {
            lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.agentTask.count({
        where: {
          tenantId,
          status: 'DONE',
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.agentTask.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.$queryRaw`
        SELECT a.id, a.name, a.email, COUNT(ata.taskId)::int as taskCount
        FROM "Agent" a
        LEFT JOIN "AgentTaskAssignee" ata ON a.id = ata.agentId
        LEFT JOIN "AgentTask" at ON ata.taskId = at.id
        WHERE a.tenantId = ${tenantId}
        AND (at.status IS NULL OR at.status != 'DONE')
        GROUP BY a.id, a.name, a.email
        ORDER BY taskCount DESC
        LIMIT 10
      `,
    ]);

    const completionRate =
      totalTasks > 0
        ? ((tasksByStatus.find((s: any) => s.status === 'DONE')?._count || 0) / totalTasks) *
          100
        : 0;

    return NextResponse.json({
      totalTasks,
      openTasks,
      urgentTasks,
      completedThisWeek,
      completionRate: Math.round(completionRate),
      tasksByStatus,
      tasksByAgent,
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
});
