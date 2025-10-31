import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/billing/[id] - Get single invoice
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const invoice = await prisma.lawInvoice.findFirst({
      where: { id, ownerUid: currentUser.uid },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        client: { select: { id: true, name: true, email: true, company: true, address: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('[GET /api/law/billing/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

// PUT /api/law/billing/[id] - Update invoice
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { description, amount, currency, status, dueDate, paidDate, items } = body;

    const existingInvoice = await prisma.lawInvoice.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const updatedInvoice = await prisma.lawInvoice.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(currency && { currency }),
        ...(status && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(paidDate !== undefined && { paidDate: paidDate ? new Date(paidDate) : null }),
        ...(items !== undefined && { items }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        client: { select: { id: true, name: true, email: true } },
      },
    });

    console.log('[PUT /api/law/billing/[id]] Updated:', id);
    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error) {
    console.error('[PUT /api/law/billing/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

// DELETE /api/law/billing/[id] - Delete invoice
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingInvoice = await prisma.lawInvoice.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Prevent deletion of paid invoices
    if (existingInvoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete paid invoices' },
        { status: 400 }
      );
    }

    await prisma.lawInvoice.delete({ where: { id } });

    console.log('[DELETE /api/law/billing/[id]] Deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/law/billing/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
