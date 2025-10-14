// apps/web/lib/apiAuth.ts
// Centralized authentication utilities for API routes
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin.server';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest {
  user: DecodedIdToken;
  uid: string;
  email: string | undefined;
}

/**
 * Verifies Firebase ID token from Authorization header
 * Returns decoded token or throws error
 */
export async function verifyAuthToken(request: NextRequest): Promise<DecodedIdToken> {
  // Get Authorization header
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid Authorization header');
  }

  const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const auth = adminAuth();
    const decodedToken = await auth.verifyIdToken(idToken, true); // checkRevoked = true

    console.log('✅ [API Auth] Token verified:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
    });

    return decodedToken;
  } catch (error: any) {
    console.error('🔥 [API Auth] Token verification failed:', error.message);
    throw new AuthenticationError('Invalid or expired token');
  }
}

/**
 * Extracts organization ID from headers
 * Returns orgId or throws error if missing
 */
export function getOrgId(request: NextRequest): string {
  const orgId = request.headers.get('x-org-id');

  if (!orgId) {
    throw new AuthenticationError('Organization ID required (x-org-id header)');
  }

  return orgId;
}

/**
 * Gets owner UID from authenticated user token
 * This is the primary user identification for data scoping
 */
export function getOwnerUid(decodedToken: DecodedIdToken): string {
  return decodedToken.uid;
}

/**
 * Middleware wrapper for API routes requiring authentication
 * Usage:
 *
 * export const GET = withAuth(async (request, { user }) => {
 *   // Your handler logic here
 *   return NextResponse.json({ data: 'Protected data' });
 * });
 */
export function withAuth<T = any>(
  handler: (
    request: NextRequest,
    context: AuthenticatedRequest & { params?: T }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, routeContext?: { params: T }) => {
    try {
      // Verify authentication
      const decodedToken = await verifyAuthToken(request);

      // Build authenticated context
      const authContext: AuthenticatedRequest = {
        user: decodedToken,
        uid: decodedToken.uid,
        email: decodedToken.email,
      };

      // Call the actual handler with authenticated context
      return await handler(request, {
        ...authContext,
        params: routeContext?.params,
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }

      console.error('🔥 [API Auth] Unexpected error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware wrapper for API routes requiring both authentication and organization context
 * Usage:
 *
 * export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
 *   // Your handler logic here with both user and org context
 *   return NextResponse.json({ data: 'Protected data' });
 * });
 */
export function withAuthAndOrg<T = any>(
  handler: (
    request: NextRequest,
    context: AuthenticatedRequest & { orgId: string; params?: T }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, routeContext?: { params: T }) => {
    try {
      // Verify authentication
      const decodedToken = await verifyAuthToken(request);

      // Get organization ID
      const orgId = getOrgId(request);

      // Verify user has access to this organization
      const hasAccess = await verifyOrgAccess(decodedToken.uid, orgId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied: You do not have access to this organization' },
          { status: 403 }
        );
      }

      // Build authenticated context with org
      const authContext: AuthenticatedRequest & { orgId: string } = {
        user: decodedToken,
        uid: decodedToken.uid,
        email: decodedToken.email,
        orgId,
      };

      // Call the actual handler with authenticated context
      return await handler(request, {
        ...authContext,
        params: routeContext?.params,
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }

      console.error('🔥 [API Auth] Unexpected error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Custom error class for authentication failures
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Helper to check if user has access to a specific organization
 * Queries the membership table to verify org access
 */
export async function verifyOrgAccess(uid: string, orgId: string): Promise<boolean> {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.membership.findFirst({
      where: {
        userId: uid,
        orgId: orgId,
        status: 'ACTIVE', // Only active memberships
      },
    });

    await prisma.$disconnect();

    if (!membership) {
      console.log('🔒 [API Auth] Access denied: User not member of organization', { uid, orgId });
      return false;
    }

    console.log('✅ [API Auth] Organization access verified', { uid, orgId, role: membership.role });
    return true;
  } catch (error) {
    console.error('🔥 [API Auth] Error verifying org access:', error);
    return false;
  }
}

/**
 * Helper to get user's organization membership with role
 */
export async function getUserOrgMembership(uid: string, orgId: string) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.membership.findFirst({
      where: {
        userId: uid,
        orgId: orgId,
        status: 'ACTIVE',
      },
      include: {
        organization: true,
      },
    });

    await prisma.$disconnect();
    return membership;
  } catch (error) {
    console.error('🔥 [API Auth] Error fetching membership:', error);
    return null;
  }
}

/**
 * Helper to get user's default or first active organization
 */
export async function getUserDefaultOrg(uid: string) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.membership.findFirst({
      where: {
        userId: uid,
        status: 'ACTIVE',
      },
      include: {
        organization: true,
      },
      orderBy: {
        joinedAt: 'asc', // First joined org
      },
    });

    await prisma.$disconnect();
    return membership;
  } catch (error) {
    console.error('🔥 [API Auth] Error fetching default org:', error);
    return null;
  }
}
