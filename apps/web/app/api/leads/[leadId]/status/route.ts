import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { leadId: string } }) {
  try {
    const { status, notes } = await req.json();
    const { leadId } = params;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Update the lead status
    const updatedLead = await prisma.ecommerceLead.update({
      where: { id: leadId },
      data: {
        status,
        ...(notes && { notes }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: updatedLead.id,
        status: updatedLead.status,
        notes: updatedLead.notes,
        updatedAt: updatedLead.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update lead status error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to update lead status' },
      { status: 500 }
    );
  }
}