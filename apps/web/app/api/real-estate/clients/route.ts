import { NextResponse } from 'next/server';
import { withRealEstateAuth } from '@/lib/realEstateApiAuth';
import { getClientsWhere, enforceAgentOrManager } from '@/lib/realEstateAuth';


export const GET = withRealEstateAuth(async (request, { auth }) => {
  try {
    enforceAgentOrManager(auth);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause with role-based filtering
    const where: any = getClientsWhere(auth);

    // Add search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    // Add status filter
    if (status) {
      where.status = status;
    }

    const [clients, totalClients] = await Promise.all([
      prisma.realEstateClient.findMany({
        where,
        include: {
          assignedAgent: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true
            }
          },
          convertedFromLead: {
            select: {
              id: true,
              source: true,
              createdAt: true
            }
          },
          properties: {
            include: {
              property: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  status: true
                }
              }
            }
          },
          meetingParticipations: {
            select: {
              meetingId: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.realEstateClient.count({ where })
    ]);

    const totalPages = Math.ceil(totalClients / limit);

    return NextResponse.json({
      clients,
      totalPages,
      currentPage: page,
      totalClients
    });
  } catch (error: any) {
    console.error('Get clients API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Access denied') ? 403 : 500 }
    );
  }
});

export const POST = withRealEstateAuth(async (request, { auth }) => {
  try {
    enforceAgentOrManager(auth);

    const body = await request.json();
    const { fullName, email, phone, notes, assignedAgentId, source } = body;

    if (!fullName) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }

    // Only managers can assign to other agents
    let finalAssignedAgentId = assignedAgentId;
    if (!auth.isManager && assignedAgentId && assignedAgentId !== auth.uid) {
      finalAssignedAgentId = auth.uid;
    }

    const client = await prisma.realEstateClient.create({
      data: {
        tenantId: auth.tenantId,
        fullName,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        source: source || null,
        assignedAgentId: finalAssignedAgentId || auth.uid,
        status: 'ACTIVE'
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      client
    });
  } catch (error: any) {
    console.error('Create client API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: 500 }
    );
  }
});

export const PATCH = withRealEstateAuth(async (request, { auth }) => {
  try {
    enforceAgentOrManager(auth);

    const body = await request.json();
    const { id, fullName, email, phone, notes, assignedAgentId, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Check access
    const existingClient = await prisma.realEstateClient.findFirst({
      where: getClientsWhere(auth)
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    // Only managers can reassign
    if (assignedAgentId !== undefined && auth.isManager) {
      updateData.assignedAgentId = assignedAgentId;
    }

    const client = await prisma.realEstateClient.update({
      where: { id },
      data: updateData,
      include: {
        assignedAgent: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      client
    });
  } catch (error: any) {
    console.error('Update client API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update client' },
      { status: 500 }
    );
  }
});

export const DELETE = withRealEstateAuth(async (request, { auth }) => {
  try {
    enforceAgentOrManager(auth);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Check access
    const existingClient = await prisma.realEstateClient.findFirst({
      where: {
        id,
        ...getClientsWhere(auth)
      }
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 });
    }

    // Only managers can delete, or agents can archive their own
    if (!auth.isManager) {
      // Agents can only archive
      await prisma.realEstateClient.update({
        where: { id },
        data: { status: 'ARCHIVED' }
      });

      return NextResponse.json({
        success: true,
        message: 'Client archived'
      });
    }

    // Managers can delete
    await prisma.realEstateClient.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted'
    });
  } catch (error: any) {
    console.error('Delete client API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
});
