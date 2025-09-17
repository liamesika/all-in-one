import { NextResponse, NextRequest } from 'next/server';

interface ErrorEvent {
  error: string;
  message: string;
  stack?: string;
  page?: string;
  userAgent?: string;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  ownerUid?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export async function POST(req: NextRequest) {
  try {
    const errorEvent: ErrorEvent = await req.json();

    // Validate required fields
    if (!errorEvent.error || !errorEvent.message || !errorEvent.severity) {
      return NextResponse.json(
        { error: 'Missing required fields: error, message, severity' },
        { status: 400 }
      );
    }

    // Log error for monitoring
    const logLevel = errorEvent.severity === 'critical' || errorEvent.severity === 'high' ? 'error' : 'warn';
    const logEntry = {
      timestamp: errorEvent.timestamp || new Date().toISOString(),
      level: logLevel,
      error: errorEvent.error,
      message: errorEvent.message,
      stack: errorEvent.stack,
      page: errorEvent.page,
      sessionId: errorEvent.sessionId,
      userId: errorEvent.userId,
      ownerUid: errorEvent.ownerUid,
      severity: errorEvent.severity,
      userAgent: errorEvent.userAgent || req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    };

    if (logLevel === 'error') {
      console.error('[Error Tracking]', JSON.stringify(logEntry));
    } else {
      console.warn('[Error Tracking]', JSON.stringify(logEntry));
    }

    // TODO: Integrate with error tracking services like:
    // - Sentry
    // - Bugsnag
    // - Rollbar
    // - LogRocket
    // - Custom error database

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Error Tracking] Error processing error event:', error);
    return NextResponse.json(
      { error: 'Failed to process error event' },
      { status: 500 }
    );
  }
}