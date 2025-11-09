import { NextRequest, NextResponse } from 'next/server';
import { auth as firebaseAuth } from './firebaseAdmin.server';
import { getRealEstateAuthContext, RealEstateAuthContext } from './realEstateAuth';

export type RealEstateApiHandler = (
  request: NextRequest,
  context: { auth: RealEstateAuthContext; params?: any }
) => Promise<NextResponse>;

/**
 * Wrapper for Real Estate API routes with role-based auth
 * Automatically injects RealEstateAuthContext into handler
 */
export function withRealEstateAuth(handler: RealEstateApiHandler) {
  return async (request: NextRequest, routeContext?: { params: any }) => {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized: Missing or invalid authorization header' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Verify Firebase token
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      const uid = decodedToken.uid;
      const email = decodedToken.email || null;

      // Get Real Estate auth context
      const auth = await getRealEstateAuthContext(uid, email);

      // Call handler with auth context
      return await handler(request, {
        auth,
        params: routeContext?.params
      });
    } catch (error: any) {
      console.error('Real Estate auth error:', error);

      if (error.message?.includes('Access denied')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}
