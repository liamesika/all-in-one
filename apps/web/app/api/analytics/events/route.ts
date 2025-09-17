import { NextResponse, NextRequest } from 'next/server';

interface UserEvent {
  event: string;
  category: 'navigation' | 'interaction' | 'error' | 'performance' | 'conversion';
  properties?: Record<string, any>;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  ownerUid?: string;
}

export async function POST(req: NextRequest) {
  try {
    const event: UserEvent = await req.json();

    // Validate required fields
    if (!event.event || !event.category) {
      return NextResponse.json(
        { error: 'Missing required fields: event, category' },
        { status: 400 }
      );
    }

    // In a production environment, you would send this to your analytics service
    // For now, we'll log it structured for observability
    console.log('[Analytics Event]', JSON.stringify({
      timestamp: event.timestamp || new Date().toISOString(),
      event: event.event,
      category: event.category,
      sessionId: event.sessionId,
      userId: event.userId,
      ownerUid: event.ownerUid,
      properties: event.properties,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    }));

    // TODO: Integrate with analytics services like:
    // - Google Analytics 4
    // - Mixpanel
    // - Segment
    // - PostHog
    // - Custom analytics database

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Error processing event:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}