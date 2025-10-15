import { Suspense } from 'react';
import ReportsClient from './ReportsClient';
import { prisma } from '@/lib/prisma.server';

// Force dynamic rendering - this page needs database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Loading component
function ReportsLoading() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-gray-200 dark:bg-[#1A2F4B] rounded"></div>
            <div className="h-4 w-96 bg-gray-200 dark:bg-[#1A2F4B] rounded"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-[#1A2F4B] rounded-lg"></div>
        </div>

        {/* Filters skeleton */}
        <div className="h-32 bg-white dark:bg-[#1A2F4B] rounded-xl border border-gray-200 dark:border-[#2979FF]/20"></div>

        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1A2F4B] rounded-xl p-6 border border-gray-200 dark:border-[#2979FF]/20">
              <div className="space-y-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-[#0E1A2B] rounded"></div>
                <div className="h-8 w-24 bg-gray-200 dark:bg-[#0E1A2B] rounded"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-[#0E1A2B] rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1A2F4B] rounded-xl p-6 border border-gray-200 dark:border-[#2979FF]/20">
              <div className="h-4 w-48 bg-gray-200 dark:bg-[#0E1A2B] rounded mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-[#0E1A2B] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

async function fetchReportData(ownerUid: string) {
  // Calculate date range (last 30 days by default)
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - 30);

  const leadWhere = {
    ownerUid,
    createdAt: { gte: startDate },
  };

  // Calculate previous period
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - 30);
  const prevLeadWhere = { ownerUid, createdAt: { gte: prevStartDate, lt: startDate } };

  try {
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

      // Previous period count
      prisma.realEstateLead.count({ where: prevLeadWhere }),

      // All leads for distribution
      prisma.realEstateLead.findMany({
        where: { ownerUid },
        select: {
          id: true,
          source: true,
        },
      }),

      // Top properties
      prisma.property.findMany({
        where: { ownerUid },
        select: {
          id: true,
          name: true,
          leads: {
            where: { createdAt: { gte: startDate } },
          },
        },
        take: 10,
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

    const convertedLeads = currentLeads.filter(l => l.propertyId).length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Leads by source
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

    // Mock status distribution
    const leadsByStatus = [
      { status: 'NEW', count: Math.floor(totalLeads * 0.4) },
      { status: 'CONTACTED', count: Math.floor(totalLeads * 0.25) },
      { status: 'QUALIFIED', count: Math.floor(totalLeads * 0.15) },
      { status: 'WON', count: Math.floor(totalLeads * 0.1) },
      { status: 'LOST', count: Math.floor(totalLeads * 0.1) },
    ];

    // Top properties
    const topProperties = properties
      .map(prop => ({
        name: prop.name,
        views: 0,
        leads: prop.leads.length,
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 10);

    // Response time trend (mock)
    const responseTimeTrend = leadsByDate.map(item => ({
      date: item.date.toISOString().split('T')[0],
      avgHours: 2.4 + (Math.random() * 2 - 1),
    }));

    // Format leads over time
    const leadsOverTime = leadsByDate.map(item => ({
      date: item.date.toISOString().split('T')[0],
      count: item.count,
    }));

    return {
      kpis: {
        totalLeads,
        totalLeadsTrend,
        conversionRate,
        conversionRateTrend: 0,
        avgResponseTime: '2.4h',
        avgResponseTimeTrend: -8.5,
        totalRevenue: 0,
        totalRevenueTrend: 0,
      },
      leadsOverTime,
      leadsBySource,
      leadsByStatus,
      topProperties,
      responseTimeTrend,
      revenueByType: [
        { type: 'SALE' as const, amount: 0 },
        { type: 'RENT' as const, amount: 0 },
      ],
    };
  } catch (error) {
    console.error('Failed to fetch report data:', error);
    // Return empty data structure
    return {
      kpis: {
        totalLeads: 0,
        totalLeadsTrend: 0,
        conversionRate: 0,
        conversionRateTrend: 0,
        avgResponseTime: '0h',
        avgResponseTimeTrend: 0,
        totalRevenue: 0,
        totalRevenueTrend: 0,
      },
      leadsOverTime: [],
      leadsBySource: [],
      leadsByStatus: [],
      topProperties: [],
      responseTimeTrend: [],
      revenueByType: [
        { type: 'SALE' as const, amount: 0 },
        { type: 'RENT' as const, amount: 0 },
      ],
    };
  }
}

export default async function ReportsPage() {
  // TODO: Get actual ownerUid from session
  const ownerUid = 'demo-user';

  const reportData = await fetchReportData(ownerUid);

  return (
    <Suspense fallback={<ReportsLoading />}>
      <ReportsClient initialData={reportData} />
    </Suspense>
  );
}
