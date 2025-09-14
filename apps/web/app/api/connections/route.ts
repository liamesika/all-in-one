import { NextResponse } from 'next/server';
import { prisma } from '../../../../../packages/server/db/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerUid = searchParams.get('ownerUid');

    if (!ownerUid) {
      return NextResponse.json(
        { error: 'ownerUid is required' },
        { status: 400 }
      );
    }

    // Get OAuth connections for the user
    const connections = await prisma.oAuthConnection.findMany({
      where: {
        ownerUid,
      },
      select: {
        id: true,
        platform: true,
        status: true,
        accountName: true,
        accountId: true,
        lastChecked: true,
        lastError: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      connections,
      total: connections.length,
    });
  } catch (error: any) {
    console.error('Connections API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ownerUid, platform, accessToken, refreshToken, accountId, accountName } = body;

    if (!ownerUid || !platform || !accessToken) {
      return NextResponse.json(
        { error: 'ownerUid, platform, and accessToken are required' },
        { status: 400 }
      );
    }

    // Create new connection
    const connection = await prisma.oAuthConnection.create({
      data: {
        ownerUid,
        platform,
        status: 'CONNECTED',
        accountId: accountId || null,
        accountName: accountName || null,
        accessToken,
        refreshToken: refreshToken || null,
        lastChecked: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        platform: connection.platform,
        status: connection.status,
        accountName: connection.accountName,
        accountId: connection.accountId,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Create connection error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create connection' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { ownerUid, connectionId, status, lastError } = body;

    if (!ownerUid || !connectionId) {
      return NextResponse.json(
        { error: 'ownerUid and connectionId are required' },
        { status: 400 }
      );
    }

    // Update connection status
    const connection = await prisma.oAuthConnection.update({
      where: {
        id: connectionId,
        ownerUid, // Ensure user can only update their own connections
      },
      data: {
        status: status || undefined,
        lastError: lastError || null,
        lastChecked: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        platform: connection.platform,
        status: connection.status,
        accountName: connection.accountName,
        lastError: connection.lastError,
        updatedAt: connection.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update connection error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update connection' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerUid = searchParams.get('ownerUid');
    const connectionId = searchParams.get('connectionId');

    if (!ownerUid || !connectionId) {
      return NextResponse.json(
        { error: 'ownerUid and connectionId are required' },
        { status: 400 }
      );
    }

    // Delete connection
    await prisma.oAuthConnection.delete({
      where: {
        id: connectionId,
        ownerUid, // Ensure user can only delete their own connections
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Connection deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete connection error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete connection' },
      { status: 500 }
    );
  }
}