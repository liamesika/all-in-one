import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

// GET /api/law/clients/[id] - Get single client
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const client = await prisma.lawClient.findFirst({
      where: {
        id,
        ownerUid: currentUser.uid,
      },
      include: {
        cases: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            nextHearingDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('[GET /api/law/clients/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

// PUT /api/law/clients/[id] - Update client
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, company, address, city, country, clientType, tags, notes } = body;

    // Check if client exists and belongs to user
    const existingClient = await prisma.lawClient.findFirst({
      where: { id, ownerUid: currentUser.uid },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check email uniqueness if changed
    if (email && email !== existingClient.email) {
      const emailTaken = await prisma.lawClient.findFirst({
        where: {
          ownerUid: currentUser.uid,
          email,
          id: { not: id },
        },
      });

      if (emailTaken) {
        return NextResponse.json({ error: 'Email already in use by another client' }, { status: 409 });
      }
    }

    const updatedClient = await prisma.lawClient.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(clientType && { clientType }),
        ...(tags !== undefined && { tags }),
        ...(notes !== undefined && { notes }),
      },
      include: { cases: true },
    });

    console.log('[PUT /api/law/clients/[id]] Updated:', id);
    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error('[PUT /api/law/clients/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE /api/law/clients/[id] - Delete client
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if client exists and belongs to user
    const existingClient = await prisma.lawClient.findFirst({
      where: { id, ownerUid: currentUser.uid },
      include: { cases: { select: { id: true } } },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if client has active cases
    if (existingClient.cases && existingClient.cases.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with active cases. Please close or reassign cases first.' },
        { status: 400 }
      );
    }

    await prisma.lawClient.delete({ where: { id } });

    console.log('[DELETE /api/law/clients/[id]] Deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/law/clients/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
