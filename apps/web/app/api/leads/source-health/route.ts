import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../packages/server/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerUid = searchParams.get('ownerUid');

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

    // Get lead source statistics
    const sourceStats = await prisma.ecommerceLead.groupBy({
      by: ['source'],
      where: {
        ownerUid,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _count: {
        _all: true,
      },
      _avg: {
        budget: true,
      },
    });

    // Get conversion rates by source
    const conversionStats = await prisma.ecommerceLead.groupBy({
      by: ['source', 'status'],
      where: {
        ownerUid,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      _count: {
        _all: true,
      },
    });

    // Calculate health metrics
    const sourceHealth = sourceStats.map((stat: any) => {
      const totalLeads = stat._count._all;
      const wonLeads = conversionStats
        .filter((conv: any) => conv.source === stat.source && conv.status === 'WON')
        .reduce((sum: number, conv: any) => sum + conv._count._all, 0);

      const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
      const avgBudget = stat._avg.budget || 0;

      // Determine health status
      let status = 'healthy';
      if (conversionRate < 5) status = 'critical';
      else if (conversionRate < 15) status = 'warning';

      return {
        source: stat.source,
        totalLeads,
        wonLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgBudget: Math.round((avgBudget || 0) * 100) / 100,
        status,
        issues: conversionRate < 5 ? ['Low conversion rate'] :
                conversionRate < 15 ? ['Below average conversion'] : [],
      };
    });

    // Overall health summary
    const totalLeads = sourceHealth.reduce((sum: number, source: any) => sum + source.totalLeads, 0);
    const totalWonLeads = sourceHealth.reduce((sum: number, source: any) => sum + source.wonLeads, 0);
    const overallConversionRate = totalLeads > 0 ? (totalWonLeads / totalLeads) * 100 : 0;

    const response = {
      summary: {
        totalLeads,
        totalWonLeads,
        overallConversionRate: Math.round(overallConversionRate * 100) / 100,
        activeSources: sourceHealth.length,
        healthySources: sourceHealth.filter((s: any) => s.status === 'healthy').length,
        criticalSources: sourceHealth.filter((s: any) => s.status === 'critical').length,
      },
      sources: sourceHealth.sort((a: any, b: any) => b.totalLeads - a.totalLeads),
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days: 30,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching source health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch source health data' },
      { status: 500 }
    );
  }
}