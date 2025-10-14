import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';


// Validation schema for creating leads
const createLeadSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  message: z.string().max(500, 'Message too long').optional(),
  source: z.string().min(1, 'Source is required'),
  propertyId: z.string().optional(),
});

// GET /api/real-estate/leads - List leads with filters
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const ownerUid = getOwnerUid(user);

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
});

// POST /api/real-estate/leads - Create new lead with deduplication
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json();

    // Get ownerUid from authenticated user
    const ownerUid = getOwnerUid(user);

    // Validate input with Zod
    const result = createLeadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    const { fullName, email, phone, message, source, propertyId } = result.data;

    // Check for duplicate by phone number (primary deduplication key)
    const existingLead = await prisma.realEstateLead.findFirst({
      where: {
        ownerUid,
        phone,
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

    if (existingLead) {
      // Return 409 Conflict with existing lead data
      return NextResponse.json(
        {
          error: 'Duplicate lead',
          message: 'A lead with this phone number already exists',
          existingLead,
        },
        { status: 409 }
      );
    }

    // Create new lead
    const lead = await prisma.realEstateLead.create({
      data: {
        fullName,
        email: email || null,
        phone,
        message: message || null,
        source,
        propertyId: propertyId || null,
        ownerUid,
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

    // Create initial event
    await prisma.realEstateLeadEvent.create({
      data: {
        leadId: lead.id,
        type: 'CREATED',
        payload: {
          source,
          createdVia: 'manual',
        },
      },
    });

    console.log('[Leads API] Created lead:', lead.id);

    return NextResponse.json(lead, { status: 201 });

  } catch (error: any) {
    console.error('[Leads API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead', details: error.message },
      { status: 500 }
    );
  }
});
