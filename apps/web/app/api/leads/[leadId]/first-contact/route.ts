import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { leadId: string } }) {
  try {
    const { leadId } = params;

    // Update the first contact timestamp
    const updatedLead = await prisma.ecommerceLead.update({
      where: { id: leadId },
      data: {
        firstContactAt: new Date(),
        lastContactAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: updatedLead.id,
        firstContactAt: updatedLead.firstContactAt,
        lastContactAt: updatedLead.lastContactAt,
        updatedAt: updatedLead.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update first contact error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to update first contact' },
      { status: 500 }
    );
  }
}