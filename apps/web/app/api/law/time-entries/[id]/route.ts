import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// PUT /api/law/time-entries/[id] - Update time entry
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { description, hours, ratePerHour, date, billable } = body;

    const existingEntry = await prisma.lawTimeEntry.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    const updatedEntry = await prisma.lawTimeEntry.update({
      where: { id },
      data: {
        ...(description && { description }),
        ...(hours && { hours: parseFloat(hours) }),
        ...(ratePerHour && { ratePerHour: parseFloat(ratePerHour) }),
        ...(date && { date: new Date(date) }),
        ...(billable !== undefined && { billable }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    });

    console.log('[PUT /api/law/time-entries/[id]] Updated:', id);
    return NextResponse.json({ timeEntry: updatedEntry });
  } catch (error) {
    console.error('[PUT /api/law/time-entries/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update time entry' }, { status: 500 });
  }
}

// DELETE /api/law/time-entries/[id] - Delete time entry
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingEntry = await prisma.lawTimeEntry.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    await prisma.lawTimeEntry.delete({ where: { id } });

    console.log('[DELETE /api/law/time-entries/[id]] Deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/law/time-entries/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete time entry' }, { status: 500 });
  }
}
