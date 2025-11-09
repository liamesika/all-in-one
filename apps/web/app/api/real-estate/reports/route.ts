export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';


export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get filter parameters
    const dateRange = searchParams.get('dateRange') || 'last30';
    const agentId = searchParams.get('agentId');
    const propertyType = searchParams.get('propertyType');
    const transactionType = searchParams.get('transactionType');
    const source = searchParams.get('source');

    const ownerUid = getOwnerUid(user);

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'last7':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last30':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last90':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        // For custom date range, expect startDate and endDate params
        const customStart = searchParams.get('startDate');
        if (customStart) {
          startDate = new Date(customStart);
        } else {
          startDate.setDate(now.getDate() - 30);
        }
    }

    // Build where clause for leads
    const leadWhere: any = {
      ownerUid,
      createdAt: { gte: startDate },
    };

    if (source) {
      leadWhere.source = source;
    }

    // Build where clause for properties (for linking to leads)
    const propertyWhere: any = { ownerUid };

    if (propertyType) {
      propertyWhere.type = propertyType;
    }

    if (transactionType) {
      propertyWhere.transactionType = transactionType;
    }

    // Previous period for trend calculation
    const prevStartDate = new Date(startDate);
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff);

    const prevLeadWhere = { ...leadWhere, createdAt: { gte: prevStartDate, lt: startDate } };

    // Fetch all required data in parallel
    const [
      currentLeads,
      previousLeads,
      allLeads,
      properties,
      leadsByDate,
    ] = await Promise.all([
      // Current period leads
      prisma.realEstateLead.findMany({
        where: leadWhere,
        select: {
          id: true,
          source: true,
          createdAt: true,
          propertyId: true,
        },
      }),

      // Previous period leads for trends
      prisma.realEstateLead.count({ where: prevLeadWhere }),

      // All leads for status distribution (no date filter)
      prisma.realEstateLead.findMany({
        where: { ownerUid },
        select: {
          id: true,
          source: true,
        },
      }),

      // Properties with lead counts
      prisma.property.findMany({
        where: propertyWhere,
        select: {
          id: true,
          name: true,
          leads: {
            where: { createdAt: { gte: startDate } },
          },
        },
        take: 10,
        orderBy: {
          leads: {
            _count: 'desc',
          },
        },
      }),

      // Leads grouped by date
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "RealEstateLead"
        WHERE "ownerUid" = ${ownerUid}
        AND "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      ` as Array<{ date: Date; count: number }>,
    ]);

    // Calculate KPIs
    const totalLeads = currentLeads.length;
    const totalLeadsTrend = previousLeads > 0
      ? ((totalLeads - previousLeads) / previousLeads) * 100
      : 0;

    // Conversion rate calculation (example: leads with linked properties are "converted")
    const convertedLeads = currentLeads.filter(l => l.propertyId).length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const conversionRateTrend = 0; // Would need historical data

    // Response time calculation (mock for now - would need actual response tracking)
    const avgResponseTime = "2.4h";
    const avgResponseTimeTrend = -8.5; // Negative = improvement

    // Revenue calculation (mock - would come from actual sales/deals)
    const totalRevenue = 0; // Would aggregate from deals/sales table
    const totalRevenueTrend = 0;

    // Leads by source distribution
    const sourceCounts: Record<string, number> = {};
    allLeads.forEach(lead => {
      const src = lead.source || 'Other';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const leadsBySource = Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count,
      percentage: (count / allLeads.length) * 100,
    }));

    // Lead status distribution (using fixed statuses for now)
    const leadsByStatus = [
      { status: 'NEW', count: Math.floor(totalLeads * 0.4) },
      { status: 'CONTACTED', count: Math.floor(totalLeads * 0.25) },
      { status: 'QUALIFIED', count: Math.floor(totalLeads * 0.15) },
      { status: 'WON', count: Math.floor(totalLeads * 0.1) },
      { status: 'LOST', count: Math.floor(totalLeads * 0.1) },
    ];

    // Top properties performance
    const topProperties = properties.slice(0, 10).map(prop => ({
      name: prop.name,
      views: 0, // Would come from analytics/tracking
      leads: prop.leads.length,
    }));

    // Response time trend (mock data)
    const responseTimeTrend = leadsByDate.map((item, index) => ({
      date: item.date.toISOString().split('T')[0],
      avgHours: 2.4 + (Math.random() * 2 - 1), // Mock fluctuation around 2.4h
    }));

    // Revenue by transaction type (mock data)
    const revenueByType = [
      { type: 'SALE' as const, amount: 0 },
      { type: 'RENT' as const, amount: 0 },
    ];

    // Format leads over time
    const leadsOverTime = leadsByDate.map(item => ({
      date: item.date.toISOString().split('T')[0],
      count: item.count,
    }));

    return NextResponse.json({
      kpis: {
        totalLeads,
        totalLeadsTrend,
        conversionRate,
        conversionRateTrend,
        avgResponseTime,
        avgResponseTimeTrend,
        totalRevenue,
        totalRevenueTrend,
      },
      leadsOverTime,
      leadsBySource,
      leadsByStatus,
      topProperties,
      responseTimeTrend,
      revenueByType,
    });

  } catch (error: any) {
    console.error('[Reports API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data', details: error.message },
      { status: 500 }
    );
  }
});
