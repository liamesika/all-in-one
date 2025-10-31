import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/clients - List all clients
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
    const clientType = searchParams.get('clientType');
    const skip = (page - 1) * limit;

    const where: any = { ownerUid: currentUser.uid };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (clientType) where.clientType = clientType;

    const [clients, total] = await Promise.all([
      prisma.lawClient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { cases: { select: { id: true, caseNumber: true, title: true, status: true }, take: 5 } },
      }),
      prisma.lawClient.count({ where }),
    ]);

    return NextResponse.json({
      clients,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/law/clients] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// POST /api/law/clients - Create client
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, company, address, city, country, clientType, tags, notes } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const existingClient = await prisma.lawClient.findFirst({
      where: { ownerUid: currentUser.uid, email },
    });

    if (existingClient) {
      return NextResponse.json({ error: 'Client with this email already exists' }, { status: 409 });
    }

    const client = await prisma.lawClient.create({
      data: {
        name, email, phone, company, address, city, country,
        clientType: clientType || 'individual',
        tags: tags || [],
        notes,
        ownerUid: currentUser.uid,
        organizationId: currentUser.uid,
      },
      include: { cases: true },
    });

    console.log('[POST /api/law/clients] Created:', client.id);
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/law/clients] Error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
