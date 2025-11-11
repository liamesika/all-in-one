export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { MeetingStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { withRealEstateAuth } from '@/lib/realEstateApiAuth';
import { getMeetingsWhere, enforceAgentOrManager } from '@/lib/realEstateAuth';


export const GET = withRealEstateAuth(async (request, { auth }) => {
  try {
    enforceAgentOrManager(auth);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const clientId = searchParams.get('clientId') || '';
    const propertyId = searchParams.get('propertyId') || '';

    // Build where clause with role-based filtering
    const where: any = getMeetingsWhere(auth);

    // Add status filter
    if (status) {
      where.status = status as MeetingStatus;
    }

    // Add date range filter
    if (startDate && endDate) {
      where.start = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.start = { gte: new Date(startDate) };
    } else if (endDate) {
      where.start = { lte: new Date(endDate) };
    }

    // Add client filter
    if (clientId) {
      where.clientParticipants = {
        some: {
          clientId
        }
      };
    }

    // Add property filter
    if (propertyId) {
      where.propertyParticipants = {
        some: {
          propertyId
        }
      };
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        agentParticipants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        clientParticipants: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        propertyParticipants: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        }
      },
      orderBy: {
        start: 'asc'
      }
    });

    return NextResponse.json({ meetings });
  } catch (error: any) {
    console.error('Get meetings API error:', error);
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
    const {
      title,
      description,
      location,
      start,
      end,
      agentIds = [],
      clientIds = [],
      propertyIds = [],
      status = 'SCHEDULED'
    } = body;

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: 'Title, start time, and end time are required' },
        { status: 400 }
      );
    }

    // Ensure creator is included in agent participants
    const finalAgentIds = new Set([auth.uid, ...agentIds]);

    // Create meeting with participants
    const meeting = await prisma.meeting.create({
      data: {
        tenantId: auth.tenantId,
        title,
        description: description || null,
        location: location || null,
        start: new Date(start),
        end: new Date(end),
        status: status as MeetingStatus,
        createdById: auth.uid,
        agentParticipants: {
          create: Array.from(finalAgentIds).map(userId => ({
            userId
          }))
        },
        clientParticipants: {
          create: clientIds.map((clientId: string) => ({
            clientId
          }))
        },
        propertyParticipants: {
          create: propertyIds.map((propertyId: string) => ({
            propertyId
          }))
        }
      },
      include: {
        agentParticipants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        clientParticipants: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        },
        propertyParticipants: {
          include: {
            property: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      meeting
    });
  } catch (error: any) {
    console.error('Create meeting API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create meeting' },
      { status: 500 }
    );
  }
});

export const PATCH = withRealEstateAuth(async (request, { auth }) => {
  try {
    enforceAgentOrManager(auth);

    const body = await request.json();
    const { id, title, description, location, start, end, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // Check access
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id,
        ...getMeetingsWhere(auth)
      }
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (start !== undefined) updateData.start = new Date(start);
    if (end !== undefined) updateData.end = new Date(end);
    if (status !== undefined) updateData.status = status;

    const meeting = await prisma.meeting.update({
      where: { id },
      data: updateData,
      include: {
        agentParticipants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        clientParticipants: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      meeting
    });
  } catch (error: any) {
    console.error('Update meeting API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update meeting' },
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
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // Check access
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id,
        ...getMeetingsWhere(auth)
      }
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found or access denied' },
        { status: 404 }
      );
    }

    // Only creator or manager can delete
    if (existingMeeting.createdById !== auth.uid && !auth.isManager) {
      return NextResponse.json(
        { error: 'Only meeting creator or manager can delete' },
        { status: 403 }
      );
    }

    await prisma.meeting.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Meeting deleted'
    });
  } catch (error: any) {
    console.error('Delete meeting API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete meeting' },
      { status: 500 }
    );
  }
});
