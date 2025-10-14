import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';
import { permissionChecker } from '@/lib/permissions';
import { FeatureAccess } from '@prisma/client';
import { getAuthContext } from '@/middleware/permissions';

/**
 * POST /api/permissions/check
 * Check if the current user has specific permissions
 *
 * Body: { permissions: FeatureAccess[] | FeatureAccess }
 * Returns: { hasPermission: boolean, permissions?: FeatureAccess[] }
 */
export const POST = withAuth(async (request, { user }) => {
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

    // Parse body
    const body = await request.json();
    const { permissions } = body;

    if (!permissions) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing permissions field' },
        { status: 400 }
      );
    }

    // Handle single permission or array
    const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];

    // Validate permissions
    const validPermissions = permissionsArray.every((p: any) => typeof p === 'string');
    if (!validPermissions) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid permissions format' },
        { status: 400 }
      );
    }

    // Check permissions
    const hasPermission = await permissionChecker.checkAllPermissions(
      userId,
      orgId,
      permissionsArray as FeatureAccess[]
    );

    return NextResponse.json({
      hasPermission,
      permissions: permissionsArray,
    });

  } catch (error) {
    console.error('[API /permissions/check] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to check permissions' },
      { status: 500 }
    );
  }
});
