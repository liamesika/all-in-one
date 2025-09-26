import { Injectable, NestMiddleware, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../../lib/prisma.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
    planTier: string;
    seatLimit: number;
    usedSeats: number;
    ownerUserId: string;
  };
  membership?: {
    id: string;
    role: string;
    status: string;
    userId: string;
    orgId: string;
  };
}

@Injectable()
export class OrganizationScopeMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Skip organization scoping for non-authenticated routes
    if (!req.user) {
      return next();
    }

    try {
      // Check for organization context in headers or query params
      let targetOrgId: string | undefined;

      // Priority order: header, query param, user's personal org
      targetOrgId = req.headers['x-organization-id'] as string
        || req.query.orgId as string
        || `org_${req.user.uid}`; // Default to personal org

      // Get user's organization membership
      const membership = await this.prisma.membership.findFirst({
        where: {
          userId: req.user.uid,
          orgId: targetOrgId,
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
              ownerUserId: true
            }
          }
        }
      });

      if (!membership) {
        // If no membership found, try to get user's personal organization
        const personalOrg = await this.prisma.organization.findFirst({
          where: {
            ownerUserId: req.user.uid
          },
          include: {
            memberships: {
              where: {
                userId: req.user.uid,
                status: 'ACTIVE'
              },
              take: 1
            }
          }
        });

        if (!personalOrg || personalOrg.memberships.length === 0) {
          throw new ForbiddenException('User has no access to any organization');
        }

        // Set organization and membership context
        req.organization = {
          id: personalOrg.id,
          name: personalOrg.name,
          slug: personalOrg.slug,
          planTier: personalOrg.planTier,
          seatLimit: personalOrg.seatLimit,
          usedSeats: personalOrg.usedSeats,
          ownerUserId: personalOrg.ownerUserId
        };
        req.membership = personalOrg.memberships[0];
      } else {
        // Set organization and membership context
        req.organization = membership.organization;
        req.membership = {
          id: membership.id,
          role: membership.role,
          status: membership.status,
          userId: membership.userId,
          orgId: membership.orgId
        };
      }

      // Log organization context for debugging (remove in production)
      console.log(`[OrgScope] User ${req.user.email} accessing org ${req.organization.name} as ${req.membership.role}`);

      next();
    } catch (error) {
      console.error('[OrganizationScopeMiddleware] Error:', error);

      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new BadRequestException('Failed to determine organization context');
    }
  }
}

// Helper decorator to inject organization context into route handlers
export const OrganizationContext = () => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const req = args[0] as AuthenticatedRequest;
      return method.apply(this, [req.organization, req.membership, ...args]);
    };
  };
};