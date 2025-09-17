import { NextResponse, NextRequest } from 'next/server';

interface PerformanceMetric {
  metric: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'ratio';
  page?: string;
  timestamp?: string;
  sessionId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const metric: PerformanceMetric = await req.json();

    // Validate required fields
    if (!metric.metric || typeof metric.value !== 'number' || !metric.unit) {
      return NextResponse.json(
        { error: 'Missing required fields: metric, value, unit' },
        { status: 400 }
      );
    }

    // Log performance metric for monitoring
    console.log('[Performance Tracking]', JSON.stringify({
      timestamp: metric.timestamp || new Date().toISOString(),
      metric: metric.metric,
      value: metric.value,
      unit: metric.unit,
      page: metric.page,
      sessionId: metric.sessionId,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    }));

    // TODO: Integrate with performance monitoring services like:
    // - New Relic
    // - DataDog
    // - Grafana
    // - Google Analytics 4 (Core Web Vitals)
    // - Custom metrics database

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Performance Tracking] Error processing metric:', error);
    return NextResponse.json(
      { error: 'Failed to process performance metric' },
      { status: 500 }
    );
  }
}