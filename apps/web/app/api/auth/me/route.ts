// apps/web/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [/api/auth/me] Fetching user profile');

    // Get Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ [/api/auth/me] Missing or invalid Authorization header');
      return NextResponse.json(
        { message: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Firebase Admin
    let decodedToken;
    try {
      const { adminAuth } = await import('@/lib/firebaseAdmin.server');
      const auth = adminAuth();

      decodedToken = await auth.verifyIdToken(idToken, true); // checkRevoked = true
      console.log('✅ [/api/auth/me] Token verified:', {
        uid: decodedToken.uid,
        email: decodedToken.email,
      });
    } catch (authError: any) {
      console.error('🔥 [/api/auth/me] Token verification failed:', authError.message);
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user profile from Firestore
    try {
      const { getUserProfile } = await import('@/lib/firebaseAdmin.server');
      const profile = await getUserProfile(decodedToken.uid);

      if (!profile) {
        console.warn('⚠️ [/api/auth/me] User profile not found in Firestore');

        // Return Firebase user data even if Firestore profile doesn't exist
        return NextResponse.json({
          uid: decodedToken.uid,
          email: decodedToken.email,
          email_verified: decodedToken.email_verified,
          name: decodedToken.name,
          picture: decodedToken.picture,
          claims: decodedToken,
        });
      }

      console.log('✅ [/api/auth/me] User profile retrieved');

      return NextResponse.json({
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        fullName: profile.fullName,
        vertical: profile.vertical,
        lang: profile.lang,
        claims: {
          vertical: decodedToken.vertical,
        },
      });
    } catch (firestoreError: any) {
      console.error('🔥 [/api/auth/me] Firestore error:', firestoreError.message);

      // Fallback to Firebase Auth data only
      return NextResponse.json({
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        claims: decodedToken,
      });
    }
  } catch (error: any) {
    console.error('🔥 [/api/auth/me] Unexpected error:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
