// apps/web/app/api/debug/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'No idToken provided' }, { status: 400 });
    }

    // Load Firebase Admin
    const { getFirebaseAdmin } = await import('@/lib/firebaseAdmin.server');
    const admin = getFirebaseAdmin();

    console.log('🔍 [DEBUG] Attempting to verify token...');
    console.log('🔍 [DEBUG] Token preview:', idToken.substring(0, 50) + '...');

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken, true);

      return NextResponse.json({
        success: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        projectId: decodedToken.aud, // audience = project ID
        issuer: decodedToken.iss,
        authTime: decodedToken.auth_time,
        claims: decodedToken,
      });
    } catch (verifyError: any) {
      console.error('❌ [DEBUG] Token verification failed:', {
        code: verifyError.code,
        message: verifyError.message,
        stack: verifyError.stack,
      });

      return NextResponse.json({
        success: false,
        error: verifyError.message,
        code: verifyError.code,
        adminProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
