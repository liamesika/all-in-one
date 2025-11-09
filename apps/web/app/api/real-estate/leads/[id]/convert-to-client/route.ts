import { NextResponse } from 'next/server';
import { PrismaClient, RealEstateLeadStatus } from '@prisma/client';
import { withRealEstateAuth } from '@/lib/realEstateApiAuth';
import { canAccessLead } from '@/lib/realEstateAuth';

const prisma = new PrismaClient();

export const POST = withRealEstateAuth(async (request, { auth, params }) => {
  try {
    const leadId = params?.params?.id;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // Check access
    const hasAccess = await canAccessLead(auth, leadId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get lead
    const lead = await prisma.realEstateLead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if already converted
    const existingClient = await prisma.realEstateClient.findUnique({
      where: { convertedFromLeadId: leadId }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Lead already converted to client', client: existingClient },
        { status: 400 }
      );
    }

    // Parse request body for additional data
    const body = await request.json().catch(() => ({}));
    const { assignedAgentId, notes } = body;

    // Create client from lead
    const client = await prisma.realEstateClient.create({
      data: {
        tenantId: auth.tenantId,
        fullName: lead.fullName || 'Unknown',
        email: lead.email,
        phone: lead.phone,
        notes: notes || lead.notes || null,
        convertedFromLeadId: leadId,
        source: lead.source,
        assignedAgentId: assignedAgentId || lead.assignedToId || null,
        status: 'ACTIVE'
      }
    });

    // Update lead status to CONVERTED
    await prisma.realEstateLead.update({
      where: { id: leadId },
      data: {
        qualificationStatus: RealEstateLeadStatus.CONVERTED
      }
    });

    return NextResponse.json({
      success: true,
      client,
      message: 'Lead successfully converted to client'
    });
  } catch (error: any) {
    console.error('Convert lead to client error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert lead to client' },
      { status: 500 }
    );
  }
});
