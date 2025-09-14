// API endpoint for collecting performance metrics
import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
    saveData: boolean;
  };
  // Additional context data
  [key: string]: any;
}

// In-memory storage for demo - in production, use a database or analytics service
const metricsStorage: PerformanceMetric[] = [];
const MAX_METRICS = 10000; // Keep last 10k metrics

export async function POST(request: NextRequest) {
  try {
    const metric: PerformanceMetric = await request.json();
    
    // Validate required fields
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json({ error: 'Invalid metric data' }, { status: 400 });
    }

    // Add timestamp if not provided
    if (!metric.timestamp) {
      metric.timestamp = Date.now();
    }

    // Store metric (in production, send to analytics service)
    metricsStorage.push(metric);
    
    // Keep storage size manageable
    if (metricsStorage.length > MAX_METRICS) {
      metricsStorage.splice(0, metricsStorage.length - MAX_METRICS);
    }

    // Log important metrics to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }

    // In production, you might want to:
    // 1. Send to Google Analytics 4
    // 2. Send to custom analytics service
    // 3. Store in database for dashboard
    // 4. Alert on poor performance

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing performance metric:', error);
    return NextResponse.json({ error: 'Failed to store metric' }, { status: 500 });
  }
}

// GET endpoint for performance dashboard
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const metricName = url.searchParams.get('metric');
    const timeRange = url.searchParams.get('timeRange') || '1h';
    const limit = parseInt(url.searchParams.get('limit') || '100');

    // Calculate time filter
    const now = Date.now();
    const timeRangeMs = {
      '5m': 5 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    }[timeRange] || 60 * 60 * 1000;

    const cutoffTime = now - timeRangeMs;

    // Filter metrics
    let filteredMetrics = metricsStorage
      .filter(m => m.timestamp >= cutoffTime)
      .filter(m => !metricName || m.name === metricName)
      .slice(-limit);

    // Calculate aggregations
    const aggregations = calculateAggregations(filteredMetrics);

    return NextResponse.json({
      metrics: filteredMetrics,
      aggregations,
      total: filteredMetrics.length,
      timeRange,
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

function calculateAggregations(metrics: PerformanceMetric[]) {
  if (metrics.length === 0) {
    return {
      average: 0,
      median: 0,
      p95: 0,
      min: 0,
      max: 0,
      ratings: { good: 0, 'needs-improvement': 0, poor: 0 },
    };
  }

  // Group by metric name
  const groups: Record<string, PerformanceMetric[]> = {};
  metrics.forEach(metric => {
    if (!groups[metric.name]) groups[metric.name] = [];
    groups[metric.name].push(metric);
  });

  const aggregations: Record<string, any> = {};

  Object.entries(groups).forEach(([name, groupMetrics]) => {
    const values = groupMetrics.map(m => m.value).sort((a, b) => a - b);
    const ratings = groupMetrics.reduce((acc, m) => {
      acc[m.rating] = (acc[m.rating] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    aggregations[name] = {
      count: values.length,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: values[Math.floor(values.length / 2)],
      p95: values[Math.floor(values.length * 0.95)],
      min: values[0],
      max: values[values.length - 1],
      ratings: {
        good: ratings.good || 0,
        'needs-improvement': ratings['needs-improvement'] || 0,
        poor: ratings.poor || 0,
      },
    };
  });

  return aggregations;
}