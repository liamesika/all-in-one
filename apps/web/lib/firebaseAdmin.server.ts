// apps/web/lib/firebaseAdmin.server.ts
// Server-only Firebase Admin SDK - DO NOT IMPORT IN CLIENT COMPONENTS
import 'server-only';
import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (app) {
    console.log('✅ [Firebase Admin] Returning existing instance');
    return app;
  }

  console.log('🔧 [Firebase Admin] Initializing new instance...');

  // ENV-based configuration (no JSON files)
  // Trim values to remove any accidental newlines or whitespace
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const rawKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').trim();
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DB_URL?.trim();
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

  console.log('🔍 [Firebase Admin] Environment check:', {
    hasProjectId: !!projectId,
    projectId: projectId ? `${projectId.substring(0, 10)}...` : 'MISSING',
    hasClientEmail: !!clientEmail,
    clientEmail: clientEmail ? `${clientEmail.substring(0, 20)}...` : 'MISSING',
    hasPrivateKey: !!rawKey,
    privateKeyLength: rawKey.length,
    hasDatabaseURL: !!databaseURL,
    databaseURL: databaseURL || 'MISSING',
    hasStorageBucket: !!storageBucket,
    storageBucket: storageBucket || 'MISSING',
  });

  if (!projectId || !clientEmail || !rawKey) {
    const missing = [];
    if (!projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
    if (!rawKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');

    console.error('❌ [Firebase Admin] Missing required environment variables:', missing);
    throw new Error(`Missing Firebase Admin ENV: ${missing.join(', ')}`);
  }

  if (!databaseURL) {
    console.error('❌ [Firebase Admin] Missing NEXT_PUBLIC_FIREBASE_DB_URL');
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_DB_URL env (copy it from Firebase Console RTDB settings).');
  }

  // Initialize Firebase Admin with ENV credentials
  try {
    const credential = admin.credential.cert({
      projectId,
      clientEmail,
      // Convert \n escapes back to actual newlines if present
      privateKey: rawKey.replace(/\\n/g, '\n'),
    });

    console.log('🔑 [Firebase Admin] Credential created successfully');

    app = admin.initializeApp({
      credential,
      databaseURL,
      storageBucket,
    });

    console.log('✅ [Firebase Admin] Initialized successfully');
    console.log('📊 [Firebase Admin] App name:', app.name);
    console.log('📊 [Firebase Admin] Project ID:', projectId);

    return app;
  } catch (error: any) {
    console.error('🔥 [Firebase Admin] Initialization failed:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Firebase Admin initialization failed: ${error.message}`);
  }
}

// Convenience exports for Firebase Admin services
export const firebaseAuth = () => getFirebaseAdmin().auth();
export const firestore = () => getFirebaseAdmin().firestore();
export const storage = () => getFirebaseAdmin().storage();
export const rtdb = () => getFirebaseAdmin().database();
