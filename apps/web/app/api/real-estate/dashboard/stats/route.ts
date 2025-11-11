export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { withRealEstateAuth } from '@/lib/realEstateApiAuth';
import { enforceAgentOrManager } from '@/lib/realEstateAuth';

export const GET = withRealEstateAuth(async (request, { auth }) => {
  try {
    enforceAgentOrManager(auth);

    const tenantId = auth.tenantId;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Parallel fetch all stats
    const [
      totalLeads,
      activeClients,
      activeProperties,
      tasksDueThisWeek,
      todaysMeetings,
      totalConverted,
      topAgents
    ] = await Promise.all([
      // Total Leads
      prisma.realEstateLead.count({
        where: { ownerUid: tenantId }
      }),

      // Active Clients
      prisma.realEstateClient.count({
        where: {
          tenantId,
          status: 'ACTIVE'
        }
      }),

      // Active Properties
      prisma.property.count({
        where: {
          ownerUid: tenantId,
          status: { not: 'ARCHIVED' }
        }
      }),

      // Tasks Due This Week
      prisma.agentTask.count({
        where: {
          tenantId,
          dueDate: {
            gte: startOfWeek,
            lte: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
          },
          status: { notIn: ['DONE', 'BLOCKED'] }
        }
      }),

      // Today's Meetings
      prisma.meeting.count({
        where: {
          tenantId,
          start: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: { not: 'CANCELED' }
        }
      }),

      // Total Converted Leads
      prisma.realEstateLead.count({
        where: {
          ownerUid: tenantId,
          qualificationStatus: 'CONVERTED'
        }
      }),

      // Top 3 Agents by Converted Leads
      prisma.realEstateLead.groupBy({
        by: ['assignedToId'],
        where: {
          ownerUid: tenantId,
          qualificationStatus: 'CONVERTED',
          assignedToId: { not: null }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 3
      })
    ]);

    // Fetch agent details for top agents
    const topAgentIds = topAgents.map(a => a.assignedToId).filter(Boolean) as string[];
    const agentDetails = await prisma.user.findMany({
      where: {
        id: { in: topAgentIds }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true
      }
    });

    const topAgentsWithDetails = topAgents.map(agent => {
      const details = agentDetails.find(d => d.id === agent.assignedToId);
      return {
        agentId: agent.assignedToId,
        agentName: details?.fullName || 'Unknown',
        agentEmail: details?.email || '',
        agentAvatar: details?.avatarUrl || null,
        convertedLeads: agent._count.id
      };
    });

    // Calculate conversion rate
    const conversionRate = totalLeads > 0
      ? Math.round((totalConverted / totalLeads) * 100)
      : 0;

    return NextResponse.json({
      stats: {
        totalLeads,
        activeClients,
        activeProperties,
        tasksDueThisWeek,
        todaysMeetings,
        conversionRate,
        topAgents: topAgentsWithDetails
      }
    });

  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
});
