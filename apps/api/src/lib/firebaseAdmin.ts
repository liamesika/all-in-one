// apps/api/src/lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';
import type { Request } from 'express';

let app: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (app) return app;

  // ENV-based configuration (no JSON files)
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DB_URL;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !rawKey) {
    throw new Error('Missing Firebase Admin ENV: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, or FIREBASE_ADMIN_PRIVATE_KEY');
  }

  if (!databaseURL) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_DB_URL env (copy it from Firebase Console RTDB settings).');
  }

  // Initialize Firebase Admin with ENV credentials
  const credential = admin.credential.cert({
    projectId,
    clientEmail,
    // Convert \n escapes back to actual newlines if present
    privateKey: rawKey.replace(/\\n/g, '\n'),
  });

  app = admin.initializeApp({
    credential,
    databaseURL,
    storageBucket,
  });

  return app;
}

/** החזרת מופע Realtime DB */
export function rtdb(): admin.database.Database {
  return getFirebaseAdmin().database();
}

/** המרה של ימים למילישניות לשדות expiresAt וכד׳ */
export const msInDays = (days: number) => days * 24 * 60 * 60 * 1000;

/** קריאת ה־uid מה־session cookie (שמו: "session") ובדיקתו */
const SESSION_COOKIE_NAME = 'session';
export async function getUidFromRequest(req: Request): Promise<string> {
  const cookie = (req as any)?.cookies?.[SESSION_COOKIE_NAME];
  if (!cookie) throw new Error('No session');

  const adminApp = getFirebaseAdmin();
  const decoded = await adminApp.auth().verifySessionCookie(cookie, true);
  return decoded.uid;
}

// Convenience exports for Firebase Admin services
export const firebaseAuth = () => getFirebaseAdmin().auth();
export const firestore = () => getFirebaseAdmin().firestore();
export const storage = () => getFirebaseAdmin().storage();
