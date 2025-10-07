// apps/web/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';

// Force dynamic route - prevent static optimization during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TERMS_VERSION = process.env.TERMS_VERSION || '1.0';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

type Vertical = 'REAL_ESTATE' | 'E_COMMERCE' | 'LAW' | 'PRODUCTION';

interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  vertical: Vertical;
  lang?: string;
  termsConsent: boolean;
  firebaseUid?: string;
  idToken?: string;
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
    console.log('🚀 [REGISTER] Starting registration request');

    const body: RegisterDto = await request.json();
    console.log(`📝 [REGISTER] Registration for: ${body.email.substring(0, 3)}***, vertical: ${body.vertical}`);

    // Validate required fields
    if (!body.email || !body.fullName || !body.vertical || !body.firebaseUid || !body.idToken) {
      console.error('❌ [REGISTER] Missing required fields:', { email: !!body.email, fullName: !!body.fullName, vertical: !!body.vertical, firebaseUid: !!body.firebaseUid, idToken: !!body.idToken });
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

    // Dynamic imports - load Firebase Admin
    console.log('📦 [REGISTER] Loading Firebase Admin...');
    let getFirebaseAdmin;
    try {
      const module = await import('@/lib/firebaseAdmin.server');
      getFirebaseAdmin = module.getFirebaseAdmin;
      console.log('✅ [REGISTER] Firebase Admin loaded');
    } catch (error: any) {
      console.error('🔥 [REGISTER] Failed to load Firebase Admin:', error.message);
      return NextResponse.json(
        { message: 'Firebase configuration error. Please contact support.', details: error.message },
        { status: 500 }
      );
    }

    // Dynamic imports - load Prisma
    console.log('📦 [REGISTER] Loading Prisma...');
    let prisma;
    try {
      const module = await import('@/lib/prisma.server');
      prisma = module.prisma;
      console.log('✅ [REGISTER] Prisma loaded');
    } catch (error: any) {
      console.error('🔥 [REGISTER] Failed to load Prisma:', error.message);
      return NextResponse.json(
        { message: 'Database configuration error. Please contact support.', details: error.message },
        { status: 500 }
      );
    }

    // Check if user already exists
    console.log('🔍 [REGISTER] Checking for existing user...');
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
      });

      if (existingUser) {
        console.warn(`⚠️ [REGISTER] Email already exists: ${body.email.substring(0, 3)}***`);
        return NextResponse.json(
          {
            message: 'Email already exists',
            action: 'login_or_reset',
          },
          { status: 409 }
        );
      }
    } catch (error: any) {
      console.error('🔥 [REGISTER] Database query failed:', error.message);
      return NextResponse.json(
        { message: 'Database error while checking existing user', details: error.message },
        { status: 500 }
      );
    }

    // Verify Firebase token
    console.log('🔑 [REGISTER] Verifying Firebase token...');
    let admin;
    try {
      admin = getFirebaseAdmin();
      await admin.auth().verifyIdToken(body.idToken);
      console.log('✅ [REGISTER] Firebase token verified');
    } catch (error: any) {
      console.error('🔥 [REGISTER] Firebase token verification failed:', error.message);
      return NextResponse.json(
        { message: 'Invalid Firebase token', details: error.message },
        { status: 401 }
      );
    }

    // Create user in database
    console.log('💾 [REGISTER] Creating user in database...');
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create user with Firebase UID
        const user = await tx.user.create({
          data: {
            id: body.firebaseUid!,
            fullName: body.fullName.trim(),
            email: body.email.toLowerCase(),
            passwordHash: '', // Empty for Firebase users
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

        // Create user profile
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

      console.log(`✅ [REGISTER] User created successfully: ${result.user.id}`);

      // Set Firebase custom claims
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
        { message: 'Failed to create user in database', details: error.message },
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
