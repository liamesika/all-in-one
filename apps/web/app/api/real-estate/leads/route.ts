import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/real-estate/leads - List leads with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Get ownerUid from authenticated user (Firebase session)
    const ownerUid = request.headers.get('x-owner-uid') || 'demo-user';

    const where: any = { ownerUid };

    if (status) {
      where.qualificationStatus = status;
    }

    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.realEstateLead.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              price: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.realEstateLead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      limit,
      offset,
    });

  } catch (error: any) {
    console.error('[Leads API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/real-estate/leads - Create new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, message, source, propertyId } = body;

    // TODO: Get ownerUid from authenticated user
    const ownerUid = request.headers.get('x-owner-uid') || 'demo-user';

    // Validation
    if (!fullName) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      );
    }

    const lead = await prisma.realEstateLead.create({
      data: {
        fullName,
        email,
        phone,
        message,
        source: source || 'MANUAL',
        propertyId,
        ownerUid,
        // Default to WARM until qualified
        qualificationStatus: 'WARM',
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        }
      }
    });

    console.log('[Leads API] Created lead:', lead.id);

    return NextResponse.json(lead, { status: 201 });

  } catch (error: any) {
    console.error('[Leads API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
