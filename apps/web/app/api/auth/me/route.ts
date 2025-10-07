// apps/web/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic route - prevent static optimization during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'session';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Return 401 immediately if no session cookie (don't log as error)
    if (!sessionCookie) {
      return NextResponse.json(
        { message: 'No session found' },
        { status: 401 }
      );
    }

    // Only import expensive dependencies if we have a session
    const { getFirebaseAdmin } = await import('@/lib/firebaseAdmin.server');
    const { prisma } = await import('@/lib/prisma.server');

    // Verify the session cookie using Firebase Admin
    let decodedToken;
    try {
      const admin = getFirebaseAdmin();
      decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    } catch (verifyError: any) {
      // Session invalid or expired - return 401, not 500
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      include: {
        userProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

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
