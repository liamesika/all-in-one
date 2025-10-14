import { NextRequest, NextResponse } from 'next/server';
import { permissionChecker } from '@/lib/permissions';
import { FeatureAccess, MembershipRole } from '@prisma/client';
import { getRequiredPlanForPermission } from '@/config/permissions';

/**
 * Middleware factory to require specific permissions
 * Returns a function that can be called in API routes to check permissions
 */
export function requirePermission(...permissions: FeatureAccess[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const userId = request.headers.get('x-user-id');
    const orgId = request.headers.get('x-org-id');

    if (!userId || !orgId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing user or organization context',
        },
        { status: 401 }
      );
    }

    // Check if user has ALL required permissions
    const hasPermission = await permissionChecker.checkAllPermissions(
      userId,
      orgId,
      permissions
    );

    if (!hasPermission) {
      // Get the required plan for upgrade messaging
      const requiredPlan = permissions.length > 0 ? getRequiredPlanForPermission(permissions[0]) : null;

      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
          required: permissions,
          requiredPlan,
          upgradeUrl: '/billing/upgrade',
        },
        { status: 403 }
      );
    }

    // Permission granted, return null to continue to handler
    return null;
  };
}

/**
 * Middleware to require ANY of the specified permissions
 */
export function requireAnyPermission(...permissions: FeatureAccess[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const userId = request.headers.get('x-user-id');
    const orgId = request.headers.get('x-org-id');

    if (!userId || !orgId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing user or organization context',
        },
        { status: 401 }
      );
    }

    const hasPermission = await permissionChecker.checkAnyPermission(
      userId,
      orgId,
      permissions
    );

    if (!hasPermission) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
          requiredAny: permissions,
        },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Middleware to require a specific role
 */
export function requireRole(...roles: MembershipRole[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const userId = request.headers.get('x-user-id');
    const orgId = request.headers.get('x-org-id');

    if (!userId || !orgId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing user or organization context',
        },
        { status: 401 }
      );
    }

    const userRole = await permissionChecker.getUserRole(userId, orgId);

    if (!userRole || !roles.includes(userRole)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Your role does not have access to this resource',
          required: roles,
          current: userRole,
        },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Middleware to require owner role
 */
export function requireOwner() {
  return requireRole('OWNER');
}

/**
 * Middleware to require admin or owner role
 */
export function requireAdminOrOwner() {
  return requireRole('OWNER', 'ADMIN');
}

/**
 * Middleware to require active subscription
 */
export function requireActiveSubscription() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const orgId = request.headers.get('x-org-id');

    if (!orgId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing organization context',
        },
        { status: 401 }
      );
    }

    const hasActiveSubscription = await permissionChecker.hasActiveSubscription(orgId);

    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          error: 'Subscription Required',
          message: 'Your organization does not have an active subscription',
          upgradeUrl: '/billing/upgrade',
        },
        { status: 402 } // Payment Required
      );
    }

    return null;
  };
}

/**
 * Helper to extract user and org IDs from request
 */
export function getAuthContext(request: NextRequest): { userId: string; orgId: string } | null {
  const userId = request.headers.get('x-user-id');
  const orgId = request.headers.get('x-org-id');

  if (!userId || !orgId) {
    return null;
  }

  return { userId, orgId };
}

/**
 * Combine multiple middleware checks
 */
export function combineMiddleware(...middlewares: Array<(req: NextRequest) => Promise<NextResponse | null>>) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    for (const middleware of middlewares) {
      const result = await middleware(request);
      if (result) {
        // If any middleware returns a response, stop and return it
        return result;
      }
    }
    // All checks passed
    return null;
  };
}

/**
 * Wrapper to easily apply middleware to API route handlers
 */
export async function withPermissions(
  request: NextRequest,
  permissions: FeatureAccess[],
  handler: (req: NextRequest, context: { userId: string; orgId: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  // Check permissions
  const permCheck = await requirePermission(...permissions)(request);
  if (permCheck) return permCheck;

  // Extract auth context
  const authContext = getAuthContext(request);
  if (!authContext) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing authentication context' },
      { status: 401 }
    );
  }

  // Call the handler with context
  return handler(request, authContext);
}

/**
 * Wrapper for role-based handlers
 */
export async function withRole(
  request: NextRequest,
  roles: MembershipRole[],
  handler: (req: NextRequest, context: { userId: string; orgId: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  // Check role
  const roleCheck = await requireRole(...roles)(request);
  if (roleCheck) return roleCheck;

  // Extract auth context
  const authContext = getAuthContext(request);
  if (!authContext) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing authentication context' },
      { status: 401 }
    );
  }

  // Call the handler with context
  return handler(request, authContext);
}
