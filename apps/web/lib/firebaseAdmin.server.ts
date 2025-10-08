// apps/web/lib/firebaseAdmin.server.ts
// Server-only Firebase Admin SDK - DO NOT IMPORT IN CLIENT COMPONENTS
import 'server-only';
import { getApps, initializeApp, cert, type AppOptions } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getDatabase } from 'firebase-admin/database';

// Singleton pattern - initialize only once
let adminInitialized = false;

export function getFirebaseAdmin() {
  const existingApps = getApps();
  if (existingApps.length > 0 && adminInitialized) {
    console.log('✅ [Firebase Admin] Returning existing instance');
    return existingApps[0];
  }

  console.log('🔧 [Firebase Admin] Initializing new instance...');

  // ENV-based configuration (no JSON files)
  // Trim values to remove any accidental newlines or whitespace
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ?.replace(/\\n/g, '\n') // Convert escaped newlines to actual newlines
    ?.trim();
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DB_URL?.trim();
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

  console.log('🔍 [Firebase Admin] Environment check:', {
    hasProjectId: !!projectId,
    projectId: projectId ? `${projectId.substring(0, 15)}...` : 'MISSING',
    hasClientEmail: !!clientEmail,
    clientEmail: clientEmail ? `${clientEmail.substring(0, 30)}...` : 'MISSING',
    hasPrivateKey: !!privateKey,
    privateKeyLength: privateKey?.length || 0,
    privateKeyStart: privateKey ? privateKey.substring(0, 30) : 'MISSING',
    hasDatabaseURL: !!databaseURL,
    databaseURL: databaseURL || 'MISSING',
    hasStorageBucket: !!storageBucket,
    storageBucket: storageBucket || 'MISSING',
  });

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [];
    if (!projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
    if (!privateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');

    console.error('❌ [Firebase Admin] Missing required environment variables:', missing);
    throw new Error(`Missing Firebase Admin ENV: ${missing.join(', ')}`);
  }

  if (!databaseURL) {
    console.error('❌ [Firebase Admin] Missing NEXT_PUBLIC_FIREBASE_DB_URL');
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_DB_URL env (copy it from Firebase Console RTDB settings).');
  }

  // Initialize Firebase Admin with ENV credentials
  try {
    const options: AppOptions = {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      databaseURL,
      storageBucket,
    };

    console.log('🔑 [Firebase Admin] Creating credential with:', {
      projectId,
      clientEmail: clientEmail.substring(0, 30) + '...',
      privateKeyLength: privateKey.length,
    });

    const app = initializeApp(options);
    adminInitialized = true;

    console.log('✅ [Firebase Admin] Initialized successfully');
    console.log('📊 [Firebase Admin] App name:', app.name);
    console.log('📊 [Firebase Admin] Project ID from ENV:', projectId);
    console.log('📊 [Firebase Admin] Client Email:', clientEmail);

    return app;
  } catch (error: any) {
    console.error('🔥 [Firebase Admin] Initialization failed:', {
      message: error.message,
      code: error.code,
      projectId,
      clientEmail,
      privateKeyLength: privateKey?.length,
      stack: error.stack,
    });
    throw new Error(`Firebase Admin initialization failed: ${error.message}`);
  }
}

// Convenience exports for Firebase Admin services
export const adminAuth = () => getAuth(getFirebaseAdmin());
export const adminFirestore = () => getFirestore(getFirebaseAdmin());
export const adminStorage = () => getStorage(getFirebaseAdmin());
export const adminDatabase = () => getDatabase(getFirebaseAdmin());

// Export app getter for debug purposes
export const getAdminApp = () => getFirebaseAdmin();

// Firestore helpers for user profile management
export async function createUserProfile(uid: string, data: {
  email: string;
  fullName: string;
  vertical: string;
  lang?: string;
}) {
  const firestore = adminFirestore();
  const userRef = firestore.collection('users').doc(uid);

  const userDoc = {
    uid,
    email: data.email,
    fullName: data.fullName,
    vertical: data.vertical,
    lang: data.lang || 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await userRef.set(userDoc);
  console.log('✅ [Firestore] User profile created:', uid);

  return userDoc;
}

export async function getUserProfile(uid: string) {
  const firestore = adminFirestore();
  const userRef = firestore.collection('users').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
}

export async function updateUserProfile(uid: string, data: Partial<{
  fullName: string;
  vertical: string;
  lang: string;
}>) {
  const firestore = adminFirestore();
  const userRef = firestore.collection('users').doc(uid);

  await userRef.update({
    ...data,
    updatedAt: new Date().toISOString(),
  });

  console.log('✅ [Firestore] User profile updated:', uid);
}
