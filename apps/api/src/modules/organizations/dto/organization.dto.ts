import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean, MinLength, MaxLength, Min, Max } from 'class-validator';
import { MembershipRole } from '../../auth/guards/role.guard';

export enum OrganizationTier {
  PERSONAL = 'PERSONAL',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE'
}

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  slug?: string;

  @IsNumber()
  @Min(1)
  @Max(1000)
  seatLimit: number;

  @IsEnum(OrganizationTier)
  @IsOptional()
  planTier?: OrganizationTier = OrganizationTier.STARTER;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  domainAllowlist?: string[] = [];
}

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  slug?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000)
  seatLimit?: number;

  @IsEnum(OrganizationTier)
  @IsOptional()
  planTier?: OrganizationTier;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  domainAllowlist?: string[];
}

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(MembershipRole)
  role: MembershipRole;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;
}

export class UpdateMemberRoleDto {
  @IsEnum(MembershipRole)
  role: MembershipRole;
}

export class BulkInviteDto {
  @IsArray()
  invites: InviteMemberDto[];
}

// Response DTOs
export class OrganizationResponseDto {
  id: string;
  name: string;
  slug: string;
  planTier: OrganizationTier;
  seatLimit: number;
  usedSeats: number;
  domainAllowlist: string[];
  createdAt: Date;
  updatedAt: Date;
  isOwner?: boolean;
  memberRole?: MembershipRole;
}

export class MembershipResponseDto {
  id: string;
  role: MembershipRole;
  status: string;
  acceptedAt?: Date;
  user: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export class InvitationResponseDto {
  id: string;
  email: string;
  role: MembershipRole;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: {
    email: string;
    fullName?: string;
  };
}

export class OrganizationStatsDto {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  seatUtilization: number;
  planLimits: {
    maxSeats: number;
    currentSeats: number;
    remainingSeats: number;
  };
  businessData: {
    properties: number;
    realEstateLeads: number;
    ecommerceLeads: number;
    campaigns: number;
    templates: number;
  };
}