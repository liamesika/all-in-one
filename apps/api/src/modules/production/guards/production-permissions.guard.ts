import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../../auth/middleware/organization-scope.middleware';
import { MembershipRole } from '../../auth/guards/role.guard';
import { PRODUCTION_ROLE_PERMISSIONS } from '../decorators/production-roles.decorator';

@Injectable()
export class ProductionPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler()) ||
                               this.reflector.get<string[]>('permissions', context.getClass());

    // If no permission requirements, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Must have organization context
    if (!request.organization || !request.membership) {
      throw new ForbiddenException('Organization context required');
    }

    const userRole = request.membership.role as MembershipRole;
    const userPermissions = PRODUCTION_ROLE_PERMISSIONS[userRole] || [];

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => {
      return userPermissions.includes(permission);
    });

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(p => !userPermissions.includes(p));
      throw new ForbiddenException(`Missing production permissions: ${missingPermissions.join(', ')}`);
    }

    return true;
  }
}