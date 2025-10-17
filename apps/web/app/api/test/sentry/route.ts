import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * Test endpoint to verify Sentry error tracking
 *
 * Usage:
 * - GET /api/test/sentry?type=error (default) - Triggers a captured error
 * - GET /api/test/sentry?type=exception - Triggers an uncaught exception
 * - GET /api/test/sentry?type=message - Sends a test message
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'error';

  try {
    switch (type) {
      case 'error':
        // Captured error with context
        const testError = new Error('Sentry test error from API endpoint');
        Sentry.captureException(testError, {
          tags: {
            test: true,
            endpoint: '/api/test/sentry',
          },
          extra: {
            timestamp: new Date().toISOString(),
            testType: 'error',
            environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Test error captured by Sentry',
          type: 'error',
          sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'not configured',
        });

      case 'exception':
        // Uncaught exception (will be caught by Next.js error boundary)
        throw new Error('Sentry test uncaught exception');

      case 'message':
        // Test message
        Sentry.captureMessage('Sentry test message from API', {
          level: 'info',
          tags: {
            test: true,
            endpoint: '/api/test/sentry',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Test message sent to Sentry',
          type: 'message',
        });

      case 'breadcrumbs':
        // Test with breadcrumbs
        Sentry.addBreadcrumb({
          category: 'test',
          message: 'Starting breadcrumb test',
          level: 'info',
        });

        Sentry.addBreadcrumb({
          category: 'test',
          message: 'Processing test data',
          level: 'info',
          data: { step: 2 },
        });

        const breadcrumbError = new Error('Sentry test error with breadcrumbs');
        Sentry.captureException(breadcrumbError, {
          tags: { test: true },
        });

        return NextResponse.json({
          success: true,
          message: 'Test error with breadcrumbs captured',
          type: 'breadcrumbs',
        });

      default:
        return NextResponse.json({
          error: 'Invalid test type',
          validTypes: ['error', 'exception', 'message', 'breadcrumbs'],
        }, { status: 400 });
    }
  } catch (error) {
    // This catch will handle the 'exception' type
    Sentry.captureException(error, {
      tags: {
        test: true,
        endpoint: '/api/test/sentry',
        caught: 'error-boundary',
      },
    });

    throw error; // Re-throw to let Next.js handle it
  }
}
