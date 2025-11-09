export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';


export const GET = withAuth(async (request, { user }) => {
  try {
    const tenantId = getOwnerUid(user);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    const agents = await prisma.agent.findMany({
      where,
      include: {
        _count: {
          select: {
            assignedTasks: true,
            createdTasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const tenantId = getOwnerUid(user);
    const body = await request.json();
    const { name, email, phone, role, status, userId } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const agent = await prisma.agent.create({
      data: {
        tenantId,
        name,
        email,
        phone: phone || null,
        role: role || 'AGENT',
        status: status || 'ACTIVE',
        userId: userId || null,
      },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error('Create agent error:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
});

export const PATCH = withAuth(async (request, { user }) => {
  try {
    const tenantId = getOwnerUid(user);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const agent = await prisma.agent.findFirst({
      where: { id, tenantId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (error) {
    console.error('Update agent error:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, { user }) => {
  try {
    const tenantId = getOwnerUid(user);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const agent = await prisma.agent.findFirst({
      where: { id, tenantId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    await prisma.agent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
});
