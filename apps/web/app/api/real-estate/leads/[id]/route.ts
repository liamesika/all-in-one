import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/real-estate/leads/[id] - Get lead details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.realEstateLead.findUnique({
      where: { id: params.id },
      include: {
        property: true,
        RealEstateLeadEvent: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);

  } catch (error: any) {
    console.error('[Leads API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

// PUT /api/real-estate/leads/[id] - Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { fullName, email, phone, message, source, propertyId, qualificationStatus } = body;

    const lead = await prisma.realEstateLead.update({
      where: { id: params.id },
      data: {
        fullName,
        email,
        phone,
        message,
        source,
        propertyId,
        qualificationStatus,
      },
      include: {
        property: true,
      }
    });

    console.log('[Leads API] Updated lead:', lead.id);

    return NextResponse.json(lead);

  } catch (error: any) {
    console.error('[Leads API] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE /api/real-estate/leads/[id] - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.realEstateLead.delete({
      where: { id: params.id },
    });

    console.log('[Leads API] Deleted lead:', params.id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Leads API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
