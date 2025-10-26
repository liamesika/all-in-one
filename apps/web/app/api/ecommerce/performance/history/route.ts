import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.ecomPerfReport.findMany({
      where: { ownerUid: currentUser.uid },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Get last used domain for auto-fill
    const lastDomain = reports.length > 0 ? reports[0].storeDomain : null;

    return NextResponse.json({
      reports: reports.map(r => ({
        id: r.id,
        storeDomain: r.storeDomain,
        performanceScore: r.performanceScore,
        seoScore: r.seoScore,
        ttfb: r.ttfb,
        lcp: r.lcp,
        cls: r.cls,
        fid: r.fid,
        recommendations: r.recommendations,
        createdAt: r.createdAt.toISOString(),
      })),
      lastDomain,
    });
  } catch (error) {
    console.error('[GET /api/ecommerce/performance/history] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance history' },
      { status: 500 }
    );
  }
}
