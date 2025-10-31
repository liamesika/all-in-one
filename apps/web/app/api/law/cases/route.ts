import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/cases - List all cases
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const assignedToId = searchParams.get('assignedToId');
    const skip = (page - 1) * limit;

    const where: any = { ownerUid: currentUser.uid };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (assignedToId) where.assignedToId = assignedToId;

    const [cases, total] = await Promise.all([
      prisma.lawCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, fullName: true, email: true } },
          documents: { select: { id: true }, take: 1 },
          tasks: { select: { id: true, status: true }, take: 10 },
        },
      }),
      prisma.lawCase.count({ where }),
    ]);

    return NextResponse.json({
      cases,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/law/cases] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}

// POST /api/law/cases - Create case
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      clientId,
      caseType,
      status,
      priority,
      assignedToId,
      filingDate,
      nextHearingDate,
    } = body;

    if (!title || !clientId || !caseType) {
      return NextResponse.json(
        { error: 'Title, client, and case type are required' },
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

    // Generate case number
    const caseCount = await prisma.lawCase.count({
      where: { ownerUid: currentUser.uid },
    });
    const caseNumber = `LAW-${new Date().getFullYear()}-${String(caseCount + 1).padStart(3, '0')}`;

    const newCase = await prisma.lawCase.create({
      data: {
        caseNumber,
        title,
        description,
        clientId,
        caseType,
        status: status || 'active',
        priority: priority || 'medium',
        assignedToId,
        filingDate: filingDate ? new Date(filingDate) : undefined,
        nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : undefined,
        ownerUid: currentUser.uid,
        organizationId: currentUser.uid,
      },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    console.log('[POST /api/law/cases] Created:', newCase.id);
    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/law/cases] Error:', error);
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
  }
}
