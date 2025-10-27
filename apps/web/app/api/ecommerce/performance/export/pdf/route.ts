import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';
import { generatePerformancePDF } from '@/lib/pdf.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const report = await prisma.ecomPerfReport.findFirst({
      where: {
        id: reportId,
        ownerUid: currentUser.uid,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Generate PDF using pdfkit
    const pdfBuffer = await generatePerformancePDF({
      storeDomain: report.storeDomain,
      performanceScore: report.performanceScore || 0,
      seoScore: report.seoScore || 0,
      ttfb: report.ttfb || 0,
      lcp: report.lcp || 0,
      cls: report.cls || 0,
      fid: report.fid || 0,
      recommendations: (report.recommendations as any[]) || [],
      createdAt: report.createdAt.toISOString(),
    });

    console.log('[PDF Export] Generated PDF for report:', reportId);

    // Return as downloadable PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="performance-report-${report.storeDomain}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/ecommerce/performance/export/pdf] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
