// apps/web/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic route - prevent static optimization during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TERMS_VERSION = process.env.TERMS_VERSION || '1.0';

type Vertical = 'REAL_ESTATE' | 'E_COMMERCE' | 'LAW' | 'PRODUCTION';

interface RegisterDto {
  fullName: string;
  vertical: Vertical;
  lang?: string;
  termsConsent: boolean;
}

function resolveDashboardPath(vertical: Vertical): string {
  const verticalRoutes: Record<Vertical, string> = {
    REAL_ESTATE: '/dashboard/real-estate/dashboard',
    LAW: '/dashboard/law/dashboard',
    E_COMMERCE: '/dashboard/e-commerce/dashboard',
    PRODUCTION: '/dashboard/production/dashboard',
  };

  return verticalRoutes[vertical] || '/dashboard/e-commerce/dashboard';
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [REGISTER] Starting Firebase-only registration');

    // Get Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ [REGISTER] Missing or invalid Authorization header');
      return NextResponse.json(
        { message: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔑 [REGISTER] ID token received, prefix:', idToken.substring(0, 15));

    // Parse request body
    let body: RegisterDto;
    try {
      body = await request.json();
      console.log(`📝 [REGISTER] Registration for vertical: ${body.vertical}`);
    } catch (parseError: any) {
      console.error('❌ [REGISTER] Failed to parse request body:', parseError.message);
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.fullName || !body.vertical || !body.termsConsent) {
      console.error('❌ [REGISTER] Missing required fields:', {
        hasFullName: !!body.fullName,
        hasVertical: !!body.vertical,
        hasTermsConsent: !!body.termsConsent,
      });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate vertical is a valid enum value
    const validVerticals = ['REAL_ESTATE', 'E_COMMERCE', 'LAW', 'PRODUCTION'];
    if (!validVerticals.includes(body.vertical)) {
      console.error('❌ [REGISTER] Invalid vertical:', body.vertical);
      return NextResponse.json(
        { message: 'Invalid vertical selected' },
        { status: 400 }
      );
    }

    // Load Firebase Admin Auth
    console.log('📦 [REGISTER] Loading Firebase Admin...');
    let auth;
    let decodedToken;
    try {
      const { adminAuth } = await import('@/lib/firebaseAdmin.server');
      auth = adminAuth();
      console.log('✅ [REGISTER] Firebase Admin loaded');

      // Verify Firebase ID token
      console.log('🔑 [REGISTER] Verifying Firebase token...');
      decodedToken = await auth.verifyIdToken(idToken, true); // checkRevoked = true
      console.log('✅ [REGISTER] Token verified:', {
        uid: decodedToken.uid,
        email: decodedToken.email,
        aud: decodedToken.aud,
        iss: decodedToken.iss,
      });

      // Verify project ID matches expected project
      const expectedProjectId = 'all-in-one-eed0a';
      if (decodedToken.aud !== expectedProjectId) {
        console.error('❌ [REGISTER] Project ID mismatch:', {
          expected: expectedProjectId,
          actual: decodedToken.aud,
        });
        return NextResponse.json(
          { message: 'Token is from different Firebase project' },
          { status: 401 }
        );
      }
    } catch (authError: any) {
      console.error('🔥 [REGISTER] Firebase Auth error:', {
        message: authError.message,
        code: authError.code,
        stack: authError.stack,
      });
      return NextResponse.json(
        { message: 'Invalid or expired authentication token', details: authError.message },
        { status: 401 }
      );
    }

    // Create or update user profile in Firestore
    console.log('💾 [REGISTER] Creating user profile in Firestore...');
    try {
      const { createUserProfile, getUserProfile } = await import('@/lib/firebaseAdmin.server');

      // Check if profile already exists
      const existingProfile = await getUserProfile(decodedToken.uid);
      if (existingProfile) {
        console.log('⚠️ [REGISTER] User profile already exists:', decodedToken.uid);
        return NextResponse.json(
          {
            message: 'User profile already exists',
            redirectPath: resolveDashboardPath(existingProfile.vertical as Vertical),
            user: {
              uid: decodedToken.uid,
              email: decodedToken.email,
              fullName: existingProfile.fullName,
              vertical: existingProfile.vertical,
            },
          },
          { status: 200 }
        );
      }

      // Create new profile
      const userDoc = await createUserProfile(decodedToken.uid, {
        email: decodedToken.email!,
        fullName: body.fullName.trim(),
        vertical: body.vertical,
        lang: body.lang || 'en',
      });

      console.log('✅ [REGISTER] User profile created in Firestore');

      // Set Firebase custom claims for vertical (optional, for fast routing)
      try {
        await auth.setCustomUserClaims(decodedToken.uid, {
          vertical: body.vertical,
        });
        console.log(`✅ [REGISTER] Custom claims set: vertical=${body.vertical}`);
      } catch (claimsError: any) {
        console.warn('⚠️ [REGISTER] Failed to set custom claims (non-critical):', claimsError.message);
      }

      const redirectPath = resolveDashboardPath(body.vertical);

      return NextResponse.json(
        {
          redirectPath,
          user: {
            uid: userDoc.uid,
            email: userDoc.email,
            fullName: userDoc.fullName,
            vertical: userDoc.vertical,
          },
        },
        { status: 201 }
      );
    } catch (firestoreError: any) {
      console.error('🔥 [REGISTER] Firestore error:', {
        message: firestoreError.message,
        code: firestoreError.code,
        stack: firestoreError.stack,
      });

      // Defensive cleanup: delete Firebase user if Firestore write failed
      // Suppress 400 errors if user doesn't exist
      try {
        console.log('🧹 [REGISTER] Attempting cleanup: deleting Firebase user...');
        await auth.deleteUser(decodedToken.uid);
        console.log('✅ [REGISTER] Firebase user deleted during cleanup');
      } catch (cleanupError: any) {
        // Ignore "user not found" errors - this is expected if cleanup already happened
        if (cleanupError.code !== 'auth/user-not-found') {
          console.warn('⚠️ [REGISTER] Cleanup failed (non-critical):', cleanupError.message);
        }
      }

      return NextResponse.json(
        {
          message: 'Failed to create user profile',
          details: firestoreError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('🔥 [REGISTER] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    return NextResponse.json(
      {
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
