import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../middleware/organization-scope.middleware';

export enum MembershipRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  [MembershipRole.OWNER]: 5,
  [MembershipRole.ADMIN]: 4,
  [MembershipRole.MANAGER]: 3,
  [MembershipRole.MEMBER]: 2,
  [MembershipRole.VIEWER]: 1
};

// Permission sets for each role
const ROLE_PERMISSIONS: Record<MembershipRole, string[]> = {
  [MembershipRole.OWNER]: [
    'org:manage',
    'org:delete',
    'billing:manage',
    'members:manage',
    'members:invite',
    'members:remove',
    'data:read',
    'data:write',
    'data:delete',
    'settings:manage'
  ],
  [MembershipRole.ADMIN]: [
    'org:manage',
    'members:manage',
    'members:invite',
    'members:remove',
    'data:read',
    'data:write',
    'data:delete',
    'settings:manage'
  ],
  [MembershipRole.MANAGER]: [
    'data:read',
    'data:write',
    'members:view',
    'settings:view'
  ],
  [MembershipRole.MEMBER]: [
    'data:read',
    'data:write',
    'members:view'
  ],
  [MembershipRole.VIEWER]: [
    'data:read',
    'members:view'
  ]
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.get<MembershipRole[]>('roles', context.getHandler()) ||
                         this.reflector.get<MembershipRole[]>('roles', context.getClass());

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler()) ||
                               this.reflector.get<string[]>('permissions', context.getClass());

    // If no role/permission requirements, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Must have organization context
    if (!request.organization || !request.membership) {
      throw new ForbiddenException('Organization context required');
    }

    const userRole = request.membership.role as MembershipRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => {
        // Check if user's role is equal or higher in hierarchy
        return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[role];
      });

      if (!hasRequiredRole) {
        throw new ForbiddenException(`Insufficient role. Required: ${requiredRoles.join(', ')}, Current: ${userRole}`);
      }
    }

    // Check permission requirements
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => {
        return userPermissions.includes(permission);
      });

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(p => !userPermissions.includes(p));
        throw new ForbiddenException(`Missing permissions: ${missingPermissions.join(', ')}`);
      }
    }

    return true;
  }
}