import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, InviteMemberDto, OrganizationStatsDto } from './dto/organization.dto';
import { MembershipRole } from '../auth/guards/role.guard';
import { AuditService, AuditAction } from '../audit/audit.service';
import * as crypto from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  // Get all organizations user has access to
  async getUserOrganizations(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            planTier: true,
            seatLimit: true,
            usedSeats: true,
            domainAllowlist: true,
            ownerUserId: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return memberships.map(membership => ({
      ...membership.organization,
      memberRole: membership.role,
      isOwner: membership.organization.ownerUserId === userId
    }));
  }

  // Create new organization
  async createOrganization(createOrgDto: CreateOrganizationDto, userId: string) {
    const { name, slug, seatLimit, planTier, domainAllowlist } = createOrgDto;

    // Generate unique slug if not provided
    const orgSlug = slug || this.generateSlug(name);

    // Check if slug is available
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: orgSlug }
    });

    if (existingOrg) {
      throw new ConflictException('Organization slug already exists');
    }

    // Create organization and owner membership in transaction
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name,
          slug: orgSlug,
          seatLimit,
          usedSeats: 1, // Owner takes one seat
          planTier: planTier || 'STARTER',
          ownerUserId: userId,
          ownerUid: userId, // Backward compatibility
          domainAllowlist: domainAllowlist || []
        }
      });

      // Create owner membership
      await tx.membership.create({
        data: {
          userId,
          orgId: organization.id,
          ownerUid: userId, // Backward compatibility
          role: 'OWNER',
          status: 'ACTIVE',
          acceptedAt: new Date()
        }
      });

      // Audit log
      await this.auditService.logOrganizationChange(
        AuditAction.ORG_CREATE,
        userId,
        organization.id,
        { organizationName: organization.name, planTier: organization.planTier }
      );

      return organization;
    });
  }

  // Update organization
  async updateOrganization(orgId: string, updateOrgDto: UpdateOrganizationDto, userId: string) {
    // Verify user has permission to update
    const membership = await this.verifyOrgAccess(orgId, userId, ['OWNER', 'ADMIN']);

    const { name, slug, seatLimit, planTier, domainAllowlist } = updateOrgDto;

    // If slug is being updated, check availability
    if (slug) {
      const existingOrg = await this.prisma.organization.findUnique({
        where: { slug }
      });

      if (existingOrg && existingOrg.id !== orgId) {
        throw new ConflictException('Organization slug already exists');
      }
    }

    // If reducing seat limit, verify it doesn't exceed current usage
    if (seatLimit) {
      const currentOrg = await this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { usedSeats: true }
      });

      if (seatLimit < currentOrg.usedSeats) {
        throw new BadRequestException(`Cannot reduce seat limit below current usage (${currentOrg.usedSeats})`);
      }
    }

    return this.prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(seatLimit && { seatLimit }),
        ...(planTier && { planTier }),
        ...(domainAllowlist && { domainAllowlist })
      }
    });
  }

  // Delete organization (owner only)
  async deleteOrganization(orgId: string, userId: string) {
    // Verify user is owner
    const membership = await this.verifyOrgAccess(orgId, userId, ['OWNER']);

    // Check if it's the user's personal organization
    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId }
    });

    if (organization.id === `org_${userId}`) {
      throw new ForbiddenException('Cannot delete personal organization');
    }

    // Delete in transaction (cascade will handle memberships and invitations)
    return this.prisma.$transaction(async (tx) => {
      // First delete all business data associated with this org
      await tx.property.deleteMany({ where: { orgId } });
      await tx.realEstateLead.deleteMany({ where: { orgId } });
      await tx.ecommerceLead.deleteMany({ where: { orgId } });
      await tx.campaign.deleteMany({ where: { orgId } });
      await tx.autoFollowupTemplate.deleteMany({ where: { orgId } });

      // Delete organization (cascades to memberships and invitations)
      await tx.organization.delete({ where: { id: orgId } });

      return { success: true, message: 'Organization deleted successfully' };
    });
  }

  // Get organization members
  async getOrganizationMembers(orgId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.prisma.membership.findMany({
        where: { orgId, status: 'ACTIVE' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: [
          { role: 'asc' }, // Owners first, then admins, etc.
          { acceptedAt: 'asc' }
        ]
      }),
      this.prisma.membership.count({
        where: { orgId, status: 'ACTIVE' }
      })
    ]);

    return {
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Invite member
  async inviteMember(orgId: string, inviteDto: InviteMemberDto, inviterUserId: string) {
    const { email, role, message } = inviteDto;

    // Verify inviter has permission
    await this.verifyOrgAccess(orgId, inviterUserId, ['OWNER', 'ADMIN']);

    // Check seat availability
    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { seatLimit: true, usedSeats: true }
    });

    if (organization.usedSeats >= organization.seatLimit) {
      throw new BadRequestException('Organization has reached seat limit');
    }

    // Check if user already exists and has membership
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { orgId }
        }
      }
    });

    if (existingUser?.memberships.length > 0) {
      throw new ConflictException('User is already a member of this organization');
    }

    // Check for existing pending invitation
    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        orgId,
        email,
        status: 'SENT'
      }
    });

    if (existingInvite) {
      throw new ConflictException('Invitation already sent to this email');
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invitation = await this.prisma.invite.create({
      data: {
        orgId,
        email,
        role,
        token,
        status: 'SENT',
        expiresAt,
        invitedByUserId: inviterUserId,
        message
      },
      include: {
        invitedByUser: {
          select: { email: true, fullName: true }
        },
        organization: {
          select: { name: true }
        }
      }
    });

    // TODO: Send invitation email here
    console.log(`[EMAIL] Invitation sent to ${email} for org ${invitation.organization.name}`);

    return invitation;
  }

  // Update member role
  async updateMemberRole(orgId: string, memberId: string, newRole: MembershipRole, updaterUserId: string) {
    // Verify updater has permission
    const updaterMembership = await this.verifyOrgAccess(orgId, updaterUserId, ['OWNER', 'ADMIN']);

    // Get target membership
    const targetMembership = await this.prisma.membership.findUnique({
      where: { id: memberId },
      include: { user: true }
    });

    if (!targetMembership || targetMembership.orgId !== orgId) {
      throw new NotFoundException('Membership not found');
    }

    // Prevent changing owner role (only one owner allowed)
    if (targetMembership.role === 'OWNER' || newRole === 'OWNER') {
      throw new ForbiddenException('Owner role cannot be changed');
    }

    // Admin can't change other admin roles unless they're the owner
    if (targetMembership.role === 'ADMIN' && updaterMembership.role !== 'OWNER') {
      throw new ForbiddenException('Only owners can change admin roles');
    }

    return this.prisma.membership.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        user: {
          select: { id: true, email: true, fullName: true }
        }
      }
    });
  }

  // Remove member
  async removeMember(orgId: string, memberId: string, removerUserId: string) {
    // Verify remover has permission
    const removerMembership = await this.verifyOrgAccess(orgId, removerUserId, ['OWNER', 'ADMIN']);

    // Get target membership
    const targetMembership = await this.prisma.membership.findUnique({
      where: { id: memberId }
    });

    if (!targetMembership || targetMembership.orgId !== orgId) {
      throw new NotFoundException('Membership not found');
    }

    // Can't remove owner
    if (targetMembership.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove organization owner');
    }

    // Admin can't remove other admins unless they're the owner
    if (targetMembership.role === 'ADMIN' && removerMembership.role !== 'OWNER') {
      throw new ForbiddenException('Only owners can remove admins');
    }

    // Remove membership and decrease used seats
    await this.prisma.$transaction(async (tx) => {
      await tx.membership.delete({ where: { id: memberId } });
      await tx.organization.update({
        where: { id: orgId },
        data: { usedSeats: { decrement: 1 } }
      });
    });

    return { success: true, message: 'Member removed successfully' };
  }

  // Get organization invitations
  async getInvitations(orgId: string, status?: string) {
    const where: any = { orgId };
    if (status) {
      where.status = status;
    }

    return this.prisma.invite.findMany({
      where,
      include: {
        invitedByUser: {
          select: { email: true, fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Resend invitation
  async resendInvitation(inviteId: string, resenderUserId: string) {
    const invitation = await this.prisma.invite.findUnique({
      where: { id: inviteId },
      include: { organization: true }
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify permission
    await this.verifyOrgAccess(invitation.orgId, resenderUserId, ['OWNER', 'ADMIN']);

    // Update expiration and token
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const updatedInvite = await this.prisma.invite.update({
      where: { id: inviteId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
        status: 'SENT'
      }
    });

    // TODO: Send new invitation email
    console.log(`[EMAIL] Invitation resent to ${invitation.email}`);

    return updatedInvite;
  }

  // Cancel invitation
  async cancelInvitation(inviteId: string, cancellerUserId: string) {
    const invitation = await this.prisma.invite.findUnique({
      where: { id: inviteId }
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify permission
    await this.verifyOrgAccess(invitation.orgId, cancellerUserId, ['OWNER', 'ADMIN']);

    await this.prisma.invite.update({
      where: { id: inviteId },
      data: { status: 'REVOKED' }
    });

    return { success: true, message: 'Invitation cancelled' };
  }

  // Accept invitation
  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.invite.findUnique({
      where: { token },
      include: { organization: true }
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invitation.status !== 'SENT') {
      throw new BadRequestException('Invitation is no longer valid');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Get user to verify email matches
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.email !== invitation.email) {
      throw new ForbiddenException('Email does not match invitation');
    }

    // Check seat availability
    if (invitation.organization.usedSeats >= invitation.organization.seatLimit) {
      throw new BadRequestException('Organization has reached seat limit');
    }

    // Create membership and update invitation
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.membership.create({
        data: {
          userId,
          orgId: invitation.orgId,
          ownerUid: userId, // Backward compatibility
          role: invitation.role,
          status: 'ACTIVE',
          acceptedAt: new Date()
        }
      });

      await tx.invite.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' }
      });

      await tx.organization.update({
        where: { id: invitation.orgId },
        data: { usedSeats: { increment: 1 } }
      });

      return { membership, organization: invitation.organization };
    });
  }

  // Get organization statistics
  async getOrganizationStats(orgId: string): Promise<OrganizationStatsDto> {
    const [org, memberships, invitations, businessData] = await Promise.all([
      this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { seatLimit: true, usedSeats: true }
      }),
      this.prisma.membership.groupBy({
        by: ['status'],
        where: { orgId },
        _count: true
      }),
      this.prisma.invite.groupBy({
        by: ['status'],
        where: { orgId },
        _count: true
      }),
      Promise.all([
        this.prisma.property.count({ where: { orgId } }),
        this.prisma.realEstateLead.count({ where: { orgId } }),
        this.prisma.ecommerceLead.count({ where: { orgId } }),
        this.prisma.campaign.count({ where: { orgId } }),
        this.prisma.autoFollowupTemplate.count({ where: { orgId } })
      ])
    ]);

    const activeMembers = memberships.find(m => m.status === 'ACTIVE')?._count || 0;
    const totalMembers = memberships.reduce((sum, m) => sum + m._count, 0);
    const pendingInvitations = invitations.find(i => i.status === 'SENT')?._count || 0;

    return {
      totalMembers,
      activeMembers,
      pendingInvitations,
      seatUtilization: Math.round((org.usedSeats / org.seatLimit) * 100),
      planLimits: {
        maxSeats: org.seatLimit,
        currentSeats: org.usedSeats,
        remainingSeats: org.seatLimit - org.usedSeats
      },
      businessData: {
        properties: businessData[0],
        realEstateLeads: businessData[1],
        ecommerceLeads: businessData[2],
        campaigns: businessData[3],
        templates: businessData[4]
      }
    };
  }

  // Helper method to verify organization access
  private async verifyOrgAccess(orgId: string, userId: string, requiredRoles: string[]) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        orgId,
        userId,
        status: 'ACTIVE'
      }
    });

    if (!membership) {
      throw new ForbiddenException('Access denied to organization');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(`Insufficient role. Required: ${requiredRoles.join(', ')}`);
    }

    return membership;
  }

  // Helper method to generate URL-friendly slug
  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return base + '-' + Math.random().toString(36).substring(2, 8);
  }
}