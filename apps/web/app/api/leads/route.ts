export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';


export const GET = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const source = searchParams.get('source');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {
      ownerUid,
    };

    if (source) {
      where.source = source;
    }

    if (status) {
      where.qualificationStatus = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, totalLeads] = await Promise.all([
      prisma.realEstateLead.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.realEstateLead.count({ where }),
    ]);

    const totalPages = Math.ceil(totalLeads / limit);

    return NextResponse.json({
      leads,
      totalPages,
      currentPage: page,
      totalLeads,
    });
  } catch (error) {
    console.error('Get leads API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    const { fullName, phone, email, source, message, propertyId, assignedToId, notes } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: 'Full name and phone are required' },
        { status: 400 }
      );
    }

    const lead = await prisma.realEstateLead.create({
      data: {
        ownerUid,
        fullName,
        phone,
        email: email || null,
        source: source || 'MANUAL',
        message: message || null,
        notes: notes || null,
        propertyId: propertyId || null,
        assignedToId: assignedToId || null,
        qualificationStatus: 'NEW',
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: lead.id,
      createdAt: lead.createdAt,
      success: true,
      lead,
    });
  } catch (error: any) {
    console.error('Create lead API error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to create lead' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const lead = await prisma.realEstateLead.findUnique({
      where: { id },
    });

    if (!lead || lead.ownerUid !== ownerUid) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updatedLead = await prisma.realEstateLead.update({
      where: { id },
      data: updates,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Update lead API error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const lead = await prisma.realEstateLead.findUnique({
      where: { id },
    });

    if (!lead || lead.ownerUid !== ownerUid) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await prisma.realEstateLead.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Delete lead API error:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
});
