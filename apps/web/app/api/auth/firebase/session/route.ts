// apps/web/app/api/auth/firebase/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic route - prevent static optimization during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'session';
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export async function POST(request: NextRequest) {
  try {
    // Dynamic import to prevent build-time evaluation
    const { getFirebaseAdmin } = await import('@/lib/firebaseAdmin.server');

    const body = await request.json();
    const idToken: string | undefined = body?.idToken;

    if (!idToken) {
      console.error('❌ [SESSION] Missing idToken in body:', body);
      return NextResponse.json(
        { message: 'Missing idToken' },
        { status: 401 }
      );
    }

    console.log('🔑 [SESSION] Got idToken', idToken.substring(0, 12) + '...');

    // Check if Firebase Admin is configured
    let admin;
    try {
      admin = getFirebaseAdmin();
    } catch (error: any) {
      console.error('🔥 [SESSION] Firebase Admin not configured:', error.message);
      return NextResponse.json(
        { message: 'Firebase authentication not configured. Please contact support.' },
        { status: 401 }
      );
    }

    const expiresIn = SESSION_TTL_MS;

    // Verify the ID token first
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('✅ [SESSION] Token verified for user:', decodedToken.uid);

    // Create session cookie
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    console.log('✅ [SESSION] Created session cookie');

    // Set cookie using Next.js cookies API
    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === 'production';

    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: expiresIn / 1000, // Convert to seconds
      path: '/',
    });

    return NextResponse.json({
      ok: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
    });
  } catch (err: any) {
    console.error('🔥 [SESSION] createSession failed', err);

    if (err.code === 'auth/invalid-id-token') {
      return NextResponse.json(
        { message: 'Invalid Firebase ID token. Please sign in again.' },
        { status: 401 }
      );
    } else if (err.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { message: 'Firebase ID token has expired. Please sign in again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create session. Please try again.' },
      { status: 401 }
    );
  }
}
