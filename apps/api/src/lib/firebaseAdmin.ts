// apps/api/src/lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import type { Request } from 'express';

let app: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (app) return app;

  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON; // אופציה לבייס64 במקום קובץ
  const databaseURL = process.env.FIREBASE_DB_URL;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!databaseURL) {
    throw new Error('Missing FIREBASE_DB_URL env (copy it from Firebase Console RTDB settings).');
  }

  let credential: admin.credential.Credential | undefined;

  if (saPath) {
    if (!fs.existsSync(saPath)) {
      throw new Error(`Service account file not found at ${saPath}`);
    }
    const json = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    credential = admin.credential.cert(json);
  } else if (inline) {
    const text = inline.trim().startsWith('{')
      ? inline
      : Buffer.from(inline, 'base64').toString('utf8');
    const json = JSON.parse(text);
    credential = admin.credential.cert(json);
  } else {
    throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS (file path) OR FIREBASE_SERVICE_ACCOUNT_JSON (base64).');
  }

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
