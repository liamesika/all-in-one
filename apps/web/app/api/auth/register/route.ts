// apps/web/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic route - prevent static optimization during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TERMS_VERSION = process.env.TERMS_VERSION || '1.0';

type Vertical = 'REAL_ESTATE' | 'E_COMMERCE' | 'LAW' | 'PRODUCTION';

interface RegisterDto {
  email: string;
  fullName: string;
  vertical: Vertical;
  lang?: string;
  termsConsent: boolean;
  firebaseUid: string; // Required - Firebase UID
  idToken: string; // Required - Firebase ID token for verification
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
    console.log('🚀 [REGISTER] Starting Firebase-based registration');

    const body: RegisterDto = await request.json();
    console.log(`📝 [REGISTER] Registration for: ${body.email.substring(0, 3)}***, vertical: ${body.vertical}`);

    // Validate required fields
    if (!body.email || !body.fullName || !body.vertical || !body.firebaseUid || !body.idToken) {
      console.error('❌ [REGISTER] Missing required fields');
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate terms consent
    if (!body.termsConsent) {
      return NextResponse.json(
        { message: 'Terms consent is required' },
        { status: 400 }
      );
    }

    // Load Firebase Admin
    console.log('📦 [REGISTER] Loading Firebase Admin...');
    const { getFirebaseAdmin } = await import('@/lib/firebaseAdmin.server');
    const admin = getFirebaseAdmin();
    console.log('✅ [REGISTER] Firebase Admin loaded');

    // Verify Firebase ID token (ensures the user was actually created in Firebase)
    console.log('🔑 [REGISTER] Verifying Firebase token...');
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(body.idToken);
      console.log('✅ [REGISTER] Firebase token verified for UID:', decodedToken.uid);

      // Ensure the token UID matches the provided UID
      if (decodedToken.uid !== body.firebaseUid) {
        console.error('❌ [REGISTER] UID mismatch - token UID does not match provided UID');
        return NextResponse.json(
          { message: 'Invalid authentication token' },
          { status: 401 }
        );
      }
    } catch (error: any) {
      console.error('🔥 [REGISTER] Firebase token verification failed:', error.message);
      return NextResponse.json(
        { message: 'Invalid Firebase token', details: error.message },
        { status: 401 }
      );
    }

    // Load Prisma
    console.log('📦 [REGISTER] Loading Prisma...');
    const { prisma } = await import('@/lib/prisma.server');
    console.log('✅ [REGISTER] Prisma loaded');

    // Check if user metadata already exists in Prisma (by Firebase UID)
    // Note: We check by UID, not email, since Firebase is the source of truth for auth
    console.log('🔍 [REGISTER] Checking if user metadata exists...');
    const existingUser = await prisma.user.findUnique({
      where: { id: body.firebaseUid },
      include: {
        userProfile: true,
      },
    });

    if (existingUser) {
      console.warn(`⚠️ [REGISTER] User metadata already exists for UID: ${body.firebaseUid}`);
      const vertical = existingUser.userProfile?.defaultVertical || body.vertical;
      return NextResponse.json(
        {
          message: 'User profile already exists',
          redirectPath: resolveDashboardPath(vertical as Vertical),
          user: {
            id: existingUser.id,
            fullName: existingUser.fullName,
            email: existingUser.email,
            defaultVertical: vertical,
          },
        },
        { status: 200 } // 200 since user can proceed to dashboard
      );
    }

    // Create user metadata in Prisma (Firebase UID as the primary key)
    console.log('💾 [REGISTER] Creating user metadata in database...');
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create user record with Firebase UID as ID
        const user = await tx.user.create({
          data: {
            id: body.firebaseUid, // Use Firebase UID as primary key
            fullName: body.fullName.trim(),
            email: body.email.toLowerCase(),
            passwordHash: '', // Empty - Firebase handles passwords
            lang: body.lang || 'en',
          },
        });

        // Create organization
        const organization = await tx.organization.create({
          data: {
            ownerUid: user.id,
            name: `${body.fullName.trim()}'s Organization`,
          },
        });

        // Create membership
        await tx.membership.create({
          data: {
            userId: user.id,
            ownerUid: organization.id,
            role: 'OWNER',
          },
        });

        // Create user profile with vertical
        const userProfile = await tx.userProfile.create({
          data: {
            userId: user.id,
            defaultVertical: body.vertical,
            termsConsentAt: new Date(),
            termsVersion: TERMS_VERSION,
          },
        });

        return { user, userProfile };
      });

      console.log(`✅ [REGISTER] User metadata created successfully: ${result.user.id}`);

      // Set Firebase custom claims for vertical (for fast token-based routing)
      try {
        await admin.auth().setCustomUserClaims(body.firebaseUid, {
          vertical: body.vertical,
        });
        console.log(`✅ [REGISTER] Firebase custom claims set: vertical=${body.vertical}`);
      } catch (claimsError: any) {
        console.warn(`⚠️ [REGISTER] Failed to set Firebase claims (non-critical):`, claimsError.message);
      }

      const redirectPath = resolveDashboardPath(body.vertical);

      return NextResponse.json(
        {
          redirectPath,
          user: {
            id: result.user.id,
            fullName: result.user.fullName,
            email: result.user.email,
            defaultVertical: body.vertical,
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('🔥 [REGISTER] Database transaction failed:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
      });
      return NextResponse.json(
        { message: 'Failed to create user metadata in database', details: error.message },
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
