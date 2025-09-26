import { SetMetadata } from '@nestjs/common';
import { MembershipRole } from '../guards/role.guard';

export const Roles = (...roles: MembershipRole[]) => SetMetadata('roles', roles);

export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

// Commonly used role combinations
export const OwnerOrAdmin = () => Roles(MembershipRole.OWNER, MembershipRole.ADMIN);
export const AdminOrManager = () => Roles(MembershipRole.ADMIN, MembershipRole.MANAGER);
export const CanWrite = () => Permissions('data:write');
export const CanRead = () => Permissions('data:read');
export const CanDelete = () => Permissions('data:delete');
export const CanManageMembers = () => Permissions('members:manage');
export const CanManageOrg = () => Permissions('org:manage');

// Special decorators for specific operations
export const RequireOwner = () => Roles(MembershipRole.OWNER);
export const RequireAdmin = () => Roles(MembershipRole.ADMIN);
export const RequireManager = () => Roles(MembershipRole.MANAGER);

// Viewer access (read-only)
export const ViewerAccess = () => Roles(MembershipRole.VIEWER, MembershipRole.MEMBER, MembershipRole.MANAGER, MembershipRole.ADMIN, MembershipRole.OWNER);