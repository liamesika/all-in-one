export const dynamic = 'force-dynamic';
// apps/web/app/api/debug/admin-info/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';
  const debugKey = request.headers.get('x-debug-key');

  // Require debug key in production
  if (!isDev && debugKey !== 'check-env-2025') {
    return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
  }

  try {
    // Get environment variables
    const envProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
    const envClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
    const envPrivateKeyLength = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0;

    // Try to initialize Firebase Admin and get its project ID
    let adminProjectId = null;
    let adminClientEmail = null;
    let adminInitError = null;

    try {
      const { getFirebaseAdmin } = await import('@/lib/firebaseAdmin.server');
      const adminApp = getFirebaseAdmin();

      // Try to extract project ID from the app
      // @ts-ignore - accessing private properties for debug
      adminProjectId = adminApp.options?.credential?.projectId || 'UNKNOWN';
      // @ts-ignore
      adminClientEmail = adminApp.options?.credential?.clientEmail || 'UNKNOWN';
    } catch (error: any) {
      adminInitError = {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }

    return NextResponse.json({
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasProjectId: !!envProjectId,
        projectId: envProjectId || 'MISSING',
        hasClientEmail: !!envClientEmail,
        clientEmail: envClientEmail ? `${envClientEmail.substring(0, 40)}...` : 'MISSING',
        clientEmailLast6: envClientEmail ? envClientEmail.slice(-6) : 'MISSING',
        hasPrivateKey: envPrivateKeyLength > 0,
        privateKeyLength: envPrivateKeyLength,
      },
      adminApp: adminInitError ? null : {
        projectId: adminProjectId,
        clientEmail: adminClientEmail ? `${adminClientEmail.substring(0, 40)}...` : 'UNKNOWN',
        clientEmailLast6: adminClientEmail ? adminClientEmail.slice(-6) : 'UNKNOWN',
      },
      validation: {
        projectIdMatch: envProjectId === adminProjectId,
        clientEmailMatch: envClientEmail === adminClientEmail,
      },
      error: adminInitError,
      frontendConfig: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING',
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL || 'MISSING',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to retrieve admin info',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
