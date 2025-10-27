import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';
import { runPageSpeedInsights } from '@/lib/psi.server';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit.server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - global for PSI (Google quota shared)
    const rateLimitResult = await rateLimit({
      ...RATE_LIMITS.PSI_AUDIT,
      identifier: 'psi-global',
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded for performance checks. Please try again later.',
          resetAt: rateLimitResult.resetAt,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Ensure domain has protocol
    let auditUrl = domain;
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      auditUrl = `https://${domain}`;
    }

    // Run performance audit using real PSI or simulation
    const auditResults = await runPageSpeedInsights(auditUrl);

    // Save to database
    const report = await prisma.ecomPerfReport.create({
      data: {
        ownerUid: currentUser.uid,
        storeDomain: domain,
        performanceScore: auditResults.performanceScore,
        seoScore: auditResults.seoScore,
        ttfb: auditResults.ttfb,
        lcp: auditResults.lcp,
        cls: auditResults.cls,
        fid: auditResults.fid,
        recommendations: auditResults.recommendations,
        status: 'COMPLETED',
      },
    });

    // Update stats
    await prisma.ecomStats.upsert({
      where: { ownerUid: currentUser.uid },
      create: {
        ownerUid: currentUser.uid,
        lastPerformanceScore: auditResults.performanceScore,
        perfReportsGenerated: 1,
      },
      update: {
        lastPerformanceScore: auditResults.performanceScore,
        perfReportsGenerated: { increment: 1 },
      },
    });

    console.log('[Performance Check] Generated report:', report.id);

    return NextResponse.json({
      report: {
        id: report.id,
        storeDomain: report.storeDomain,
        performanceScore: report.performanceScore,
        seoScore: report.seoScore,
        ttfb: report.ttfb,
        lcp: report.lcp,
        cls: report.cls,
        fid: report.fid,
        recommendations: report.recommendations,
        createdAt: report.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[POST /api/ecommerce/performance/run] Error:', error);
    return NextResponse.json(
      { error: 'Failed to run performance check' },
      { status: 500 }
    );
  }
}
