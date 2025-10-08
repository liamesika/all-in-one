// apps/web/app/api/debug/env/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Only allow in development or with special header
  const isDev = process.env.NODE_ENV === 'development';
  const debugKey = request.headers.get('x-debug-key');

  if (!isDev && debugKey !== 'check-env-2025') {
    return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
  }

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    hasFirebaseProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
    firebaseProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID ? `${process.env.FIREBASE_ADMIN_PROJECT_ID.substring(0, 15)}...` : 'MISSING',
    hasFirebaseClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    firebaseClientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? `${process.env.FIREBASE_ADMIN_CLIENT_EMAIL.substring(0, 25)}...` : 'MISSING',
    hasFirebasePrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    firebasePrivateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
    hasFirebaseDbUrl: !!process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
    firebaseDbUrl: process.env.NEXT_PUBLIC_FIREBASE_DB_URL || 'MISSING',
    hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING',
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrl: process.env.DATABASE_URL ? 'PRESENT (masked)' : 'MISSING',
  });
}
