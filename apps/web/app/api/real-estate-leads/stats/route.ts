import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../packages/server/db/client';
import statsCache from '@/lib/stats-cache';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerUid = searchParams.get('ownerUid');
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!ownerUid) {
      return NextResponse.json(
        { error: 'ownerUid is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheParams = { timeframe };
    const cachedData = statsCache.get(ownerUid, 'realestate-leads-stats', cacheParams);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        stats: cachedData,
        cached: true,
      });
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get total real estate leads count
    const totalLeads = await prisma.realEstateLead.count({
      where: { ownerUid }
    });

    // Get leads in timeframe
    const leadsInTimeframe = await prisma.realEstateLead.count({
      where: {
        ownerUid,
        createdAt: {
          gte: startDate,
          lte: now,
        }
      }
    });

    // Get leads by source (only field available for grouping)
    const leadsBySource = await prisma.realEstateLead.groupBy({
      by: ['source'],
      where: { ownerUid },
      _count: {
        source: true,
      },
    });

    // Get total properties count
    const totalProperties = await prisma.property.count({
      where: { ownerUid }
    });

    // Get properties by status
    const propertiesByStatus = await prisma.property.groupBy({
      by: ['status'],
      where: { ownerUid },
      _count: {
        status: true,
      },
    });

    // Calculate average property price (since leads don't have budget)
    const avgPropertyPrice = await prisma.property.aggregate({
      where: { ownerUid },
      _avg: {
        price: true,
      },
    });

    // Calculate daily stats for the timeframe
    const dailyStatsRaw = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "RealEstateLead"
      WHERE "ownerUid" = ${ownerUid}
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${now}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    ` as Array<{ date: string; count: bigint }>;

    const dailyStats = dailyStatsRaw.map(stat => ({
      date: stat.date,
      count: Number(stat.count),
    }));

    // Response data structured for Real Estate dashboard
    const stats = {
      summary: {
        totalLeads,
        newLeads: leadsInTimeframe,
        totalProperties,
        avgPropertyPrice: Math.round(avgPropertyPrice._avg.price || 0),
      },
      bySource: Object.fromEntries(
        leadsBySource.map((item: any) => [item.source, item._count.source])
      ),
      propertiesByStatus: Object.fromEntries(
        propertiesByStatus.map((item: any) => [item.status, item._count.status])
      ),
      timeline: dailyStats,
      timeframe,
      generatedAt: now.toISOString(),
    };

    // Cache the result
    statsCache.set(ownerUid, 'realestate-leads-stats', stats, cacheParams);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Real estate leads stats API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch real estate leads stats' },
      { status: 500 }
    );
  }
}