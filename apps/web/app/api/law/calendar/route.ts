import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/calendar - List events
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const caseId = searchParams.get('caseId');
    const clientId = searchParams.get('clientId');
    const eventType = searchParams.get('eventType');

    const where: any = { ownerUid: currentUser.uid };

    if (startDate && endDate) {
      where.eventDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (caseId) where.caseId = caseId;
    if (clientId) where.clientId = clientId;
    if (eventType) where.eventType = eventType;

    const events = await prisma.lawEvent.findMany({
      where,
      orderBy: { eventDate: 'asc' },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        client: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('[GET /api/law/calendar] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/law/calendar - Create event
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, eventDate, eventType, location, caseId, clientId, reminderMinutes } = body;

    if (!title || !eventDate || !eventType) {
      return NextResponse.json(
        { error: 'Title, event date, and event type are required' },
        { status: 400 }
      );
    }

    // Verify case belongs to user if caseId provided
    if (caseId) {
      const caseExists = await prisma.lawCase.findFirst({
        where: { id: caseId, ownerUid: currentUser.uid },
      });
      if (!caseExists) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }
    }

    // Verify client belongs to user if clientId provided
    if (clientId) {
      const clientExists = await prisma.lawClient.findFirst({
        where: { id: clientId, ownerUid: currentUser.uid },
      });
      if (!clientExists) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
    }

    const event = await prisma.lawEvent.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        eventType,
        location,
        caseId,
        clientId,
        reminderMinutes,
        ownerUid: currentUser.uid,
        organizationId: currentUser.uid,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        client: { select: { id: true, name: true, email: true } },
      },
    });

    console.log('[POST /api/law/calendar] Created:', event.id);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/law/calendar] Error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
