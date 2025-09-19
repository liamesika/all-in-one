import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerUid = searchParams.get('ownerUid');
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 20)));

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

    // Get recent imports grouped by date and source
    const recentImports = await prisma.ecommerceLead.findMany({
      where: {
        ownerUid,
        source: {
          in: ['CSV_UPLOAD', 'GOOGLE_SHEETS', 'FACEBOOK', 'INSTAGRAM'],
        },
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      select: {
        id: true,
        source: true,
        sourceName: true,
        createdAt: true,
        status: true,
        score: true,
        isDuplicate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit * 5, // Get more data to group by import batches
    });

    // Group leads by import batches (same day + same source)
    const importBatches = new Map<string, any>();

    recentImports.forEach((lead: any) => {
      const dateKey = lead.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      const batchKey = `${dateKey}_${lead.source}_${lead.sourceName || 'unknown'}`;

      if (!importBatches.has(batchKey)) {
        importBatches.set(batchKey, {
          id: batchKey,
          date: dateKey,
          source: lead.source,
          sourceName: lead.sourceName,
          leads: [],
          totalCount: 0,
          duplicateCount: 0,
          successCount: 0,
          errorCount: 0,
        });
      }

      const batch = importBatches.get(batchKey);
      batch.leads.push(lead);
      batch.totalCount++;

      if (lead.isDuplicate) {
        batch.duplicateCount++;
      } else {
        batch.successCount++;
      }

      // Count errors based on status or other criteria
      if (lead.status === 'LOST' || !lead.source) {
        batch.errorCount++;
      }
    });

    // Convert to array and sort by date
    const sortedBatches = Array.from(importBatches.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
      .map((batch) => ({
        id: batch.id,
        date: batch.date,
        source: batch.source,
        sourceName: batch.sourceName,
        summary: {
          totalCount: batch.totalCount,
          successCount: batch.successCount,
          duplicateCount: batch.duplicateCount,
          errorCount: batch.errorCount,
          successRate: batch.totalCount > 0 ?
            Math.round((batch.successCount / batch.totalCount) * 100) : 0,
        },
        // Only include first few leads for preview
        leads: batch.leads.slice(0, 5).map((lead: any) => ({
          id: lead.id,
          createdAt: lead.createdAt,
          status: lead.status,
          score: lead.score,
          isDuplicate: lead.isDuplicate,
        })),
        hasMoreLeads: batch.leads.length > 5,
      }));

    // Calculate overall statistics
    const totalImports = sortedBatches.reduce((sum, batch) => sum + batch.summary.totalCount, 0);
    const totalSuccess = sortedBatches.reduce((sum, batch) => sum + batch.summary.successCount, 0);
    const totalDuplicates = sortedBatches.reduce((sum, batch) => sum + batch.summary.duplicateCount, 0);
    const totalErrors = sortedBatches.reduce((sum, batch) => sum + batch.summary.errorCount, 0);

    const response = {
      summary: {
        totalImports,
        totalSuccess,
        totalDuplicates,
        totalErrors,
        overallSuccessRate: totalImports > 0 ?
          Math.round((totalSuccess / totalImports) * 100) : 0,
        batchCount: sortedBatches.length,
      },
      imports: sortedBatches,
      period: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days: 90,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching import history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import history' },
      { status: 500 }
    );
  }
}