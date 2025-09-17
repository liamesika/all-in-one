// apps/web/lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL || '',
};

// Initialize Firebase only on client side
let firebaseApp: any = null;
let firebaseAuth: Auth | null = null;

if (typeof window !== 'undefined') {
  try {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Function to get auth instance safely
export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  return firebaseAuth;
}

export const auth = firebaseAuth;

// Analytics רק אם נתמך בדפדפן
export let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== 'undefined' && firebaseApp) {
  analyticsIsSupported().then((ok) => { if (ok) analytics = getAnalytics(firebaseApp); }).catch(() => {});
}

export default firebaseApp;
