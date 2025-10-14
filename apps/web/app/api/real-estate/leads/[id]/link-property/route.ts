import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';


// Validation schema
const linkPropertySchema = z.object({
  propertyId: z.string().nullable(),
});

// PATCH /api/real-estate/leads/[id]/link-property - Link/unlink property
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    // Validate input
    const result = linkPropertySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    const { propertyId } = result.data;

    // Check if lead exists and belongs to user
    const lead = await prisma.realEstateLead.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerUid },
          { orgId: { not: null } }, // TODO: Check org membership
        ]
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // If propertyId is provided, verify it exists and belongs to user
    let propertyName: string | undefined;
    if (propertyId) {
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          OR: [
            { ownerUid },
            { orgId: { not: null } }, // TODO: Check org membership
          ]
        }
      });

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      propertyName = property.name;
    }

    // Update lead with new propertyId (or null to unlink)
    const updatedLead = await prisma.realEstateLead.update({
      where: { id: params.id },
      data: { propertyId },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          }
        }
      }
    });

    // Create event
    await prisma.realEstateLeadEvent.create({
      data: {
        leadId: params.id,
        type: propertyId ? 'PROPERTY_LINKED' : 'PROPERTY_UNLINKED',
        payload: propertyId
          ? {
              propertyId,
              propertyName,
            }
          : null,
      }
    });

    console.log('[Link Property API] Updated lead:', params.id, 'propertyId:', propertyId);

    return NextResponse.json(updatedLead);

  } catch (error: any) {
    console.error('[Link Property API] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to link property' },
      { status: 500 }
    );
  }
});
