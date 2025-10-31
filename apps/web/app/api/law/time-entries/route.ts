import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/time-entries - List time entries
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const billable = searchParams.get('billable');

    const where: any = { ownerUid: currentUser.uid };

    if (caseId) where.caseId = caseId;
    if (billable !== null && billable !== undefined) {
      where.billable = billable === 'true';
    }
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const timeEntries = await prisma.lawTimeEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    });

    // Calculate totals
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalAmount = timeEntries.reduce((sum, entry) => sum + (entry.hours * entry.ratePerHour), 0);
    const billableHours = timeEntries.filter(e => e.billable).reduce((sum, entry) => sum + entry.hours, 0);

    return NextResponse.json({
      timeEntries,
      summary: { totalHours, totalAmount, billableHours },
    });
  } catch (error) {
    console.error('[GET /api/law/time-entries] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
}

// POST /api/law/time-entries - Create time entry
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { caseId, description, hours, ratePerHour, date, billable } = body;

    if (!caseId || !description || !hours || !ratePerHour || !date) {
      return NextResponse.json(
        { error: 'Case, description, hours, rate, and date are required' },
        { status: 400 }
      );
    }

    // Verify case belongs to user
    const caseExists = await prisma.lawCase.findFirst({
      where: { id: caseId, ownerUid: currentUser.uid },
    });

    if (!caseExists) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const timeEntry = await prisma.lawTimeEntry.create({
      data: {
        caseId,
        description,
        hours: parseFloat(hours),
        ratePerHour: parseFloat(ratePerHour),
        date: new Date(date),
        billable: billable !== false,
        ownerUid: currentUser.uid,
        organizationId: currentUser.uid,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    });

    console.log('[POST /api/law/time-entries] Created:', timeEntry.id);
    return NextResponse.json({ timeEntry }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/law/time-entries] Error:', error);
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
  }
}
