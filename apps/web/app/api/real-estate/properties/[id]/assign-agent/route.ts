import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized (skip during build)
if (getApps().length === 0 && process.env.FIREBASE_PROJECT_ID) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
      }),
    });
  } catch (error) {
    console.warn('[Firebase Admin] Initialization failed:', error);
  }
}

const prisma = new PrismaClient();

/**
 * PATCH /api/real-estate/properties/[id]/assign-agent
 *
 * Assign or unassign an agent to a property (Company accounts only)
 *
 * @permissions - Company users only (accountType = COMPANY)
 * @body { agentId: string | null }
 * @returns Updated property with agent assignment
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const ownerUid = decodedToken.uid;

    // 2. Get user profile to check account type
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: ownerUid },
    });

    if (!userProfile || userProfile.accountType !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Forbidden: Only Company accounts can assign agents' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const { agentId } = body;

    // agentId can be null (to unassign) or a string (to assign)
    if (agentId !== null && typeof agentId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid agentId: must be a string or null' },
        { status: 400 }
      );
    }

    // 4. Verify property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          include: {
            memberships: {
              where: { userId: ownerUid, status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if user owns the property or is member of the organization
    const isMember = property.organization?.memberships.length > 0;
    const isOwner = property.ownerUid === ownerUid;

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this property' },
        { status: 403 }
      );
    }

    // 5. If assigning an agent, verify the agent is a member of the organization
    if (agentId) {
      // Check if agent is a member of the organization
      const agentMembership = await prisma.membership.findFirst({
        where: {
          userId: agentId,
          orgId: property.orgId || undefined,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      });

      if (!agentMembership) {
        return NextResponse.json(
          { error: 'Invalid agentId: User is not an active member of the organization' },
          { status: 400 }
        );
      }
    }

    // 6. Update property with assigned agent
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        assignedAgentId: agentId,
        updatedAt: new Date(),
      },
      include: {
        organization: {
          include: {
            memberships: {
              where: { status: 'ACTIVE' },
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 7. Find assigned agent details if agentId is set
    let assignedAgent = null;
    if (updatedProperty.assignedAgentId) {
      const agentMembership = updatedProperty.organization?.memberships.find(
        (m) => m.userId === updatedProperty.assignedAgentId
      );
      if (agentMembership) {
        assignedAgent = {
          id: agentMembership.user.id,
          email: agentMembership.user.email,
          displayName: agentMembership.user.displayName,
          role: agentMembership.role,
        };
      }
    }

    return NextResponse.json({
      success: true,
      property: {
        id: updatedProperty.id,
        assignedAgentId: updatedProperty.assignedAgentId,
        assignedAgent,
      },
      message: agentId
        ? 'Agent assigned successfully'
        : 'Agent unassigned successfully',
    });
  } catch (error) {
    console.error('[Assign Agent API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
