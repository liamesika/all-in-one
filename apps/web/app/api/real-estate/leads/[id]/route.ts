import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

const prisma = new PrismaClient();

// Validation schema
const updateLeadSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/).optional(),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().max(500).optional(),
  source: z.string().optional(),
});

// GET /api/real-estate/leads/[id] - Get lead details
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const ownerUid = getOwnerUid(user);

    const lead = await prisma.realEstateLead.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerUid },
          { orgId: { not: null } }, // TODO: Check org membership
        ]
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            neighborhood: true,
          }
        },
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
});

// PATCH /api/real-estate/leads/[id] - Update lead (partial)
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    // Validate input
    const result = updateLeadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    // Check if lead exists and belongs to user
    const existingLead = await prisma.realEstateLead.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerUid },
          { orgId: { not: null } }, // TODO: Check org membership
        ]
      }
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Update lead
    const lead = await prisma.realEstateLead.update({
      where: { id: params.id },
      data: result.data,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          }
        },
      }
    });

    console.log('[Leads API] Updated lead:', lead.id);

    return NextResponse.json(lead);

  } catch (error: any) {
    console.error('[Leads API] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
});

// PUT /api/real-estate/leads/[id] - Update lead (legacy support)
export const PUT = withAuth(async (request, context) => {
  // Redirect to PATCH for consistency - need to call PATCH handler directly
  return PATCH.call(null, request, context);
});

// DELETE /api/real-estate/leads/[id] - Delete lead
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const ownerUid = getOwnerUid(user);

    // Check if lead exists and belongs to user
    const existingLead = await prisma.realEstateLead.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerUid },
          { orgId: { not: null } }, // TODO: Check org membership
        ]
      }
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

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
});
