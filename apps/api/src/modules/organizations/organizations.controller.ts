import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, MembershipRole } from '../auth/guards/role.guard';
import {
  Roles,
  RequireOwner,
  OwnerOrAdmin,
  AdminOrManager,
  ViewerAccess,
  CanManageMembers
} from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/middleware/organization-scope.middleware';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, InviteMemberDto, UpdateMemberRoleDto } from './dto/organization.dto';

@Controller('organizations')
@UseGuards(AuthGuard('firebase'), RoleGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  // Get current organization details
  @Get('current')
  @ViewerAccess()
  async getCurrentOrganization(@Req() req: AuthenticatedRequest) {
    return {
      organization: req.organization,
      membership: req.membership
    };
  }

  // List user's organizations
  @Get('my-organizations')
  async getMyOrganizations(@Req() req: AuthenticatedRequest) {
    return this.organizationsService.getUserOrganizations(req.user.uid);
  }

  // Create new organization
  @Post()
  async createOrganization(
    @Body() createOrgDto: CreateOrganizationDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.organizationsService.createOrganization(createOrgDto, req.user.uid);
  }

  // Update organization details (Owner/Admin only)
  @Put(':id')
  @OwnerOrAdmin()
  async updateOrganization(
    @Param('id') id: string,
    @Body() updateOrgDto: UpdateOrganizationDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.organizationsService.updateOrganization(id, updateOrgDto, req.user.uid);
  }

  // Delete organization (Owner only)
  @Delete(':id')
  @RequireOwner()
  async deleteOrganization(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.organizationsService.deleteOrganization(id, req.user.uid);
  }

  // Get organization members
  @Get(':id/members')
  @ViewerAccess()
  async getOrganizationMembers(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 50;
    return this.organizationsService.getOrganizationMembers(id, pageNum, limitNum);
  }

  // Invite member
  @Post(':id/members/invite')
  @CanManageMembers()
  async inviteMember(
    @Param('id') id: string,
    @Body() inviteDto: InviteMemberDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.organizationsService.inviteMember(id, inviteDto, req.user.uid);
  }

  // Update member role
  @Put(':id/members/:memberId/role')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async updateMemberRole(
    @Param('id') orgId: string,
    @Param('memberId') memberId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.organizationsService.updateMemberRole(
      orgId,
      memberId,
      updateRoleDto.role,
      req.user.uid
    );
  }

  // Remove member
  @Delete(':id/members/:memberId')
  @CanManageMembers()
  async removeMember(
    @Param('id') orgId: string,
    @Param('memberId') memberId: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.organizationsService.removeMember(orgId, memberId, req.user.uid);
  }

  // Get organization invitations
  @Get(':id/invitations')
  @AdminOrManager()
  async getInvitations(
    @Param('id') id: string,
    @Query('status') status?: string
  ) {
    return this.organizationsService.getInvitations(id, status);
  }

  // Resend invitation
  @Post(':id/invitations/:inviteId/resend')
  @CanManageMembers()
  async resendInvitation(
    @Param('id') orgId: string,
    @Param('inviteId') inviteId: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.organizationsService.resendInvitation(inviteId, req.user.uid);
  }

  // Cancel invitation
  @Delete(':id/invitations/:inviteId')
  @CanManageMembers()
  async cancelInvitation(
    @Param('id') orgId: string,
    @Param('inviteId') inviteId: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.organizationsService.cancelInvitation(inviteId, req.user.uid);
  }

  // Accept invitation (public endpoint)
  @Post('invitations/:token/accept')
  async acceptInvitation(
    @Param('token') token: string,
    @Req() req: AuthenticatedRequest
  ) {
    if (!req.user) {
      throw new BadRequestException('Authentication required to accept invitation');
    }
    return this.organizationsService.acceptInvitation(token, req.user.uid);
  }

  // Get organization statistics (Owner/Admin/Manager only)
  @Get(':id/stats')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MANAGER)
  async getOrganizationStats(@Param('id') id: string) {
    return this.organizationsService.getOrganizationStats(id);
  }
}