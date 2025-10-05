// apps/web/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic route - prevent static optimization during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'session';

export async function GET(request: NextRequest) {
  try {
    // Dynamic imports to prevent build-time evaluation
    const { getFirebaseAdmin } = await import('@/lib/firebaseAdmin.server');
    const { prisma } = await import('@/lib/prisma.server');

    console.log('🔍 [ME] Getting current user profile');

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      console.warn('⚠️ [ME] No session cookie found');
      return NextResponse.json(
        { message: 'No session found' },
        { status: 401 }
      );
    }

    console.log('🔑 [ME] Session cookie found, verifying...');

    // Verify the session cookie using Firebase Admin
    let decodedToken;
    try {
      const admin = getFirebaseAdmin();
      decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
      console.log('✅ [ME] Session verified for user:', decodedToken.uid);
    } catch (verifyError: any) {
      console.error('❌ [ME] Session verification failed:', verifyError.message);
      return NextResponse.json(
        { message: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get user data from database
    console.log('📊 [ME] Fetching user data from database...');
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      include: {
        userProfile: true,
      },
    });

    if (!user) {
      console.error('❌ [ME] User not found in database:', decodedToken.uid);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ [ME] User found:', user.id);

    // Return user profile
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      defaultVertical: user.userProfile?.defaultVertical || null,
      lang: user.lang,
    });
  } catch (error: any) {
    console.error('🔥 [ME] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
