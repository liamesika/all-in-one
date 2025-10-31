import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/billing - List invoices
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const caseId = searchParams.get('caseId');
    const clientId = searchParams.get('clientId');
    const skip = (page - 1) * limit;

    const where: any = { ownerUid: currentUser.uid };

    if (status) where.status = status;
    if (caseId) where.caseId = caseId;
    if (clientId) where.clientId = clientId;

    const [invoices, total] = await Promise.all([
      prisma.lawInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          case: { select: { id: true, caseNumber: true, title: true } },
          client: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.lawInvoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/law/billing] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// POST /api/law/billing - Create invoice
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, caseId, description, amount, currency, status, dueDate, items } = body;

    if (!clientId || !amount) {
      return NextResponse.json(
        { error: 'Client and amount are required' },
        { status: 400 }
      );
    }

    // Verify client belongs to user
    const client = await prisma.lawClient.findFirst({
      where: { id: clientId, ownerUid: currentUser.uid },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
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

    // Generate invoice number
    const invoiceCount = await prisma.lawInvoice.count({
      where: { ownerUid: currentUser.uid },
    });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await prisma.lawInvoice.create({
      data: {
        invoiceNumber,
        clientId,
        caseId,
        description,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        status: status || 'draft',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        items,
        ownerUid: currentUser.uid,
        organizationId: currentUser.uid,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        client: { select: { id: true, name: true, email: true } },
      },
    });

    console.log('[POST /api/law/billing] Created:', invoice.id);
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/law/billing] Error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
