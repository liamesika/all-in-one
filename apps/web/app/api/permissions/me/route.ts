export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';
import { permissionChecker } from '@/lib/permissions';
import { getAuthContext } from '@/middleware/permissions';

/**
 * GET /api/permissions/me
 * Get all permissions for the current user in their current organization
 *
 * Returns: {
 *   permissions: FeatureAccess[],
 *   role: MembershipRole,
 *   plan: SubscriptionPlan
 * }
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    // Get auth context
    const authContext = getAuthContext(request);
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing authentication context' },
        { status: 401 }
      );
    }

    const { userId, orgId } = authContext;

    // Get user permissions
    const permissions = await permissionChecker.getUserPermissions(userId, orgId);

    // Get user role
    const role = await permissionChecker.getUserRole(userId, orgId);

    // Get org plan
    const plan = await permissionChecker.getOrgPlan(orgId);

    return NextResponse.json({
      permissions,
      role,
      plan,
    });

  } catch (error) {
    console.error('[API /permissions/me] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to get user permissions' },
      { status: 500 }
    );
  }
});
