import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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
    const cachedData = statsCache.get(ownerUid, 'ecommerce-leads-stats', cacheParams);

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

    // Get total leads count
    const totalLeads = await prisma.ecommerceLead.count({
      where: { ownerUid }
    });

    // Get leads in timeframe
    const leadsInTimeframe = await prisma.ecommerceLead.count({
      where: {
        ownerUid,
        createdAt: {
          gte: startDate,
          lte: now,
        }
      }
    });

    // Get leads by status
    const leadsByStatus = await prisma.ecommerceLead.groupBy({
      by: ['status'],
      where: { ownerUid },
      _count: {
        status: true,
      },
    });

    // Get leads by score
    const leadsByScore = await prisma.ecommerceLead.groupBy({
      by: ['score'],
      where: { ownerUid },
      _count: {
        score: true,
      },
    });

    // Get leads by source
    const leadsBySource = await prisma.ecommerceLead.groupBy({
      by: ['source'],
      where: { ownerUid },
      _count: {
        source: true,
      },
    });

    // Get conversion stats
    const conversionStats = await prisma.ecommerceLead.aggregate({
      where: { ownerUid },
      _count: {
        firstContactAt: true, // Leads with first contact
      },
    });

    const wonLeads = await prisma.ecommerceLead.count({
      where: {
        ownerUid,
        status: 'WON'
      }
    });

    // Calculate daily stats for the timeframe (simplified)
    const dailyStatsRaw = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "EcommerceLead"
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

    // Response data
    const stats = {
      summary: {
        total: totalLeads,
        new: leadsInTimeframe,
        contacted: conversionStats._count.firstContactAt || 0,
        won: wonLeads,
        conversionRate: totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0',
      },
      byStatus: Object.fromEntries(
        leadsByStatus.map((item: any) => [item.status, item._count.status])
      ),
      byScore: Object.fromEntries(
        leadsByScore.map((item: any) => [item.score, item._count.score])
      ),
      bySource: Object.fromEntries(
        leadsBySource.map((item: any) => [item.source, item._count.source])
      ),
      timeline: dailyStats,
      timeframe,
      generatedAt: now.toISOString(),
    };

    // Cache the result
    statsCache.set(ownerUid, 'ecommerce-leads-stats', stats, cacheParams);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Leads stats API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch leads stats' },
      { status: 500 }
    );
  }
}