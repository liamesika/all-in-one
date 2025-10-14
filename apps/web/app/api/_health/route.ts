import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';

/**
 * Health check endpoint
 * Verifies database connectivity and Prisma client initialization
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1 as health`;

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'healthy',
          prisma: 'initialized',
        },
        responseTime: `${responseTime}ms`,
      },
      { status: 200 }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error('[Health Check] Database connection failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: {
          database: 'unhealthy',
          prisma: error instanceof Error ? error.message : 'unknown error',
        },
        responseTime: `${responseTime}ms`,
      },
      { status: 503 }
    );
  }
}
