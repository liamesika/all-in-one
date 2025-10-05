// apps/web/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin.server';
import { prisma } from '@/lib/prisma.server';
import * as bcrypt from 'bcryptjs';

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
    const body: RegisterDto = await request.json();

    console.log(`📝 [REGISTER] Registration attempt for email: ${body.email.substring(0, 3)}***`);

    // Validate terms consent
    if (!body.termsConsent) {
      return NextResponse.json(
        { message: 'Terms consent is required' },
        { status: 409 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingUser) {
      console.warn(`⚠️ [REGISTER] Registration failed: email already exists ${body.email.substring(0, 3)}***`);
      return NextResponse.json(
        {
          message: 'Email already exists',
          action: 'login_or_reset',
        },
        { status: 409 }
      );
    }

    // Firebase registration path
    if (body.firebaseUid && body.idToken) {
      try {
        // Verify Firebase token
        const admin = getFirebaseAdmin();
        await admin.auth().verifyIdToken(body.idToken);

        // Create user in transaction (no password hash needed for Firebase users)
        const result = await prisma.$transaction(async (tx) => {
          // Create user with Firebase UID
          const user = await tx.user.create({
            data: {
              id: body.firebaseUid!, // Use Firebase UID as primary key
              fullName: body.fullName.trim(),
              email: body.email.toLowerCase(),
              passwordHash: '', // Empty for Firebase users
              lang: body.lang || 'en',
            },
          });

          // Create organization for the user
          const organization = await tx.organization.create({
            data: {
              ownerUid: user.id,
              name: `${body.fullName.trim()}'s Organization`,
            },
          });

          // Create membership with OWNER role
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

        console.log(`✅ [REGISTER] Firebase user registered successfully: ${result.user.id}`);

        // Set Firebase custom claims for vertical (for fast token-based routing)
        try {
          await admin.auth().setCustomUserClaims(body.firebaseUid, {
            vertical: body.vertical,
          });
          console.log(`✅ [REGISTER] Firebase custom claims set for user ${result.user.id}: vertical=${body.vertical}`);
        } catch (claimsError) {
          // Log error but don't fail registration - vertical is still in DB
          console.error(`⚠️ [REGISTER] Failed to set Firebase custom claims for user ${result.user.id}:`, claimsError);
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
      } catch (error) {
        console.error('❌ [REGISTER] Firebase registration failed:', error);
        throw error;
      }
    }

    // Traditional registration path (not currently used but kept for compatibility)
    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: body.fullName.trim(),
          email: body.email.toLowerCase(),
          passwordHash,
          lang: body.lang || 'en',
        },
      });

      const organization = await tx.organization.create({
        data: {
          ownerUid: user.id,
          name: `${body.fullName.trim()}'s Organization`,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          ownerUid: organization.id,
          role: 'OWNER',
        },
      });

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

    console.log(`✅ [REGISTER] User registered successfully: ${result.user.id}`);

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
  } catch (error) {
    console.error('❌ [REGISTER] Registration failed:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}
