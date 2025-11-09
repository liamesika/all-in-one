import { NextResponse } from 'next/server';
import { withRealEstateAuth } from '@/lib/realEstateApiAuth';
import { getLeadsWhere, enforceAgentOrManager } from '@/lib/realEstateAuth';
import { z } from 'zod';


const createLeadSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().max(500).optional(),
  source: z.string().min(1),
  propertyId: z.string().optional(),
  qualificationStatus: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'MEETING', 'OFFER', 'DEAL', 'CONVERTED', 'DISQUALIFIED']).optional(),
  assignedToId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const GET = withRealEstateAuth(async (request, { auth }) => {
  try {
    enforceAgentOrManager(auth);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause with role-based filtering
    const where: any = getLeadsWhere(auth);

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
        { phone: { contains: search } },
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
          },
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true
            }
          },
          convertedToClient: {
            select: {
              id: true,
              fullName: true
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
    console.error('GET leads error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leads' },
      { status: error.message?.includes('Access denied') ? 403 : 500 }
    );
  }
});

export const POST = withRealEstateAuth(async (request, { auth }) => {
  try {
    enforceAgentOrManager(auth);

    const body = await request.json();
    const result = createLeadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    const { fullName, email, phone, message, source, propertyId, qualificationStatus, assignedToId, notes } = result.data;

    // Check for duplicate
    const existingLead = await prisma.realEstateLead.findFirst({
      where: {
        ownerUid: auth.tenantId,
        phone,
      }
    });

    if (existingLead) {
      return NextResponse.json(
        {
          error: 'Duplicate lead',
          message: 'A lead with this phone number already exists',
          existingLead,
        },
        { status: 409 }
      );
    }

    // Only managers can assign to other agents
    let finalAssignedToId = assignedToId;
    if (!auth.isManager && assignedToId && assignedToId !== auth.uid) {
      finalAssignedToId = auth.uid;
    }

    // Create lead
    const lead = await prisma.realEstateLead.create({
      data: {
        fullName,
        email: email || null,
        phone,
        message: message || null,
        source,
        propertyId: propertyId || null,
        qualificationStatus: (qualificationStatus as any) || 'NEW',
        assignedToId: finalAssignedToId || auth.uid,
        notes: notes || null,
        ownerUid: auth.tenantId,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    // Create event
    await prisma.realEstateLeadEvent.create({
      data: {
        leadId: lead.id,
        type: 'CREATED',
        payload: {
          source,
          createdBy: auth.uid
        },
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error('POST lead error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    );
  }
});
