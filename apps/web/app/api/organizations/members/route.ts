import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { withPermissions, withRole } from '@/middleware/permissions';


/**
 * GET /api/organizations/members
 * List all members of the current organization
 * Requires: ORG_MEMBERS_READ permission
 */
export const GET = withAuth(async (request, { user }) => {
  return withPermissions(
    request,
    ['ORG_MEMBERS_READ'],
    async (req, context) => {
      const { orgId } = context;

      const members = await prisma.membership.findMany({
        where: {
          orgId,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' },
          { joinedAt: 'desc' },
        ],
      });

      return NextResponse.json({ members });
    }
  );
});

/**
 * POST /api/organizations/members
 * Invite a new member to the organization
 * Requires: ORG_INVITE_MEMBERS permission
 */
export const POST = withAuth(async (request, { user }) => {
  return withPermissions(
    request,
    ['ORG_INVITE_MEMBERS'],
    async (req, context) => {
      const { userId, orgId } = context;
      const body = await req.json();

      const { email, role = 'MEMBER' } = body;

      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingMembership = await prisma.membership.findFirst({
        where: {
          orgId,
          user: { email },
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        );
      }

      // Create invite
      const invite = await prisma.invite.create({
        data: {
          orgId,
          email,
          role,
          token: generateInviteToken(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // TODO: Send invitation email

      return NextResponse.json({
        invite,
        message: 'Invitation sent successfully',
      });
    }
  );
});

/**
 * PATCH /api/organizations/members/[id]
 * Update member role or permissions
 * Requires: ORG_MEMBERS_WRITE permission
 */
export const PATCH = withAuth(async (request, { user }) => {
  return withPermissions(
    request,
    ['ORG_MEMBERS_WRITE'],
    async (req, context) => {
      const { userId, orgId } = context;
      const body = await req.json();

      const { memberId, role, customPermissions } = body;

      if (!memberId) {
        return NextResponse.json(
          { error: 'Member ID is required' },
          { status: 400 }
        );
      }

      // Check if membership exists and belongs to same org
      const membership = await prisma.membership.findFirst({
        where: {
          id: memberId,
          orgId,
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        );
      }

      // Prevent changing owner role
      if (membership.role === 'OWNER' && role !== 'OWNER') {
        return NextResponse.json(
          { error: 'Cannot change owner role' },
          { status: 400 }
        );
      }

      // Update membership
      const updated = await prisma.membership.update({
        where: { id: memberId },
        data: {
          ...(role && { role }),
          ...(customPermissions && { customPermissions }),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({ member: updated });
    }
  );
});

/**
 * DELETE /api/organizations/members/[id]
 * Remove a member from the organization
 * Requires: ORG_MEMBERS_DELETE permission
 * Requires: OWNER or ADMIN role
 */
export const DELETE = withAuth(async (request, { user }) => {
  return withRole(
    request,
    ['OWNER', 'ADMIN'],
    async (req, context) => {
      const { userId, orgId } = context;
      const searchParams = req.nextUrl.searchParams;
      const memberId = searchParams.get('id');

      if (!memberId) {
        return NextResponse.json(
          { error: 'Member ID is required' },
          { status: 400 }
        );
      }

      // Check if membership exists
      const membership = await prisma.membership.findFirst({
        where: {
          id: memberId,
          orgId,
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        );
      }

      // Prevent removing owner
      if (membership.role === 'OWNER') {
        return NextResponse.json(
          { error: 'Cannot remove organization owner' },
          { status: 400 }
        );
      }

      // Prevent self-removal
      if (membership.userId === userId) {
        return NextResponse.json(
          { error: 'Cannot remove yourself' },
          { status: 400 }
        );
      }

      // Remove membership
      await prisma.membership.delete({
        where: { id: memberId },
      });

      return NextResponse.json({
        success: true,
        message: 'Member removed successfully',
      });
    }
  );
});

// Helper function to generate invite tokens
function generateInviteToken(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}
