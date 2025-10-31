import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/calendar/[id] - Get single event
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.lawEvent.findFirst({
      where: { id, ownerUid: currentUser.uid },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        client: { select: { id: true, name: true, email: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('[GET /api/law/calendar/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT /api/law/calendar/[id] - Update event
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, eventDate, eventType, location, caseId, clientId, reminderMinutes } = body;

    const existingEvent = await prisma.lawEvent.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedEvent = await prisma.lawEvent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(eventDate && { eventDate: new Date(eventDate) }),
        ...(eventType && { eventType }),
        ...(location !== undefined && { location }),
        ...(caseId !== undefined && { caseId }),
        ...(clientId !== undefined && { clientId }),
        ...(reminderMinutes !== undefined && { reminderMinutes }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        client: { select: { id: true, name: true, email: true } },
      },
    });

    console.log('[PUT /api/law/calendar/[id]] Updated:', id);
    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('[PUT /api/law/calendar/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/law/calendar/[id] - Delete event
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingEvent = await prisma.lawEvent.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await prisma.lawEvent.delete({ where: { id } });

    console.log('[DELETE /api/law/calendar/[id]] Deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/law/calendar/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
