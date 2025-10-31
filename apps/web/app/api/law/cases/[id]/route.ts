import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/cases/[id] - Get single case
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const caseData = await prisma.lawCase.findFirst({
      where: { id, ownerUid: currentUser.uid },
      include: {
        client: true,
        assignedTo: { select: { id: true, fullName: true, email: true } },
        documents: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { createdAt: 'desc' } },
        events: { orderBy: { eventDate: 'asc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json({ case: caseData });
  } catch (error) {
    console.error('[GET /api/law/cases/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch case' }, { status: 500 });
  }
}

// PUT /api/law/cases/[id] - Update case
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      caseType,
      status,
      priority,
      assignedToId,
      filingDate,
      closingDate,
      nextHearingDate,
    } = body;

    const existingCase = await prisma.lawCase.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const updatedCase = await prisma.lawCase.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(caseType && { caseType }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(filingDate && { filingDate: new Date(filingDate) }),
        ...(closingDate && { closingDate: new Date(closingDate) }),
        ...(nextHearingDate !== undefined && { nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null }),
      },
      include: { client: true, assignedTo: true },
    });

    console.log('[PUT /api/law/cases/[id]] Updated:', id);
    return NextResponse.json({ case: updatedCase });
  } catch (error) {
    console.error('[PUT /api/law/cases/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
  }
}

// DELETE /api/law/cases/[id] - Delete case
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingCase = await prisma.lawCase.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    await prisma.lawCase.delete({ where: { id } });

    console.log('[DELETE /api/law/cases/[id]] Deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/law/cases/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 });
  }
}
