// apps/web/lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics';

// Only initialize Firebase on the client side to avoid SSR issues
let firebaseApp: any = null;
let firebaseAuth: any = null;

if (typeof window !== 'undefined') {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    ...(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      ? { messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }
      : {}),
    ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      ? { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
      : {}),
  };

  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
}

export const auth = firebaseAuth;

// Analytics רק אם נתמך בדפדפן
export let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== 'undefined' && firebaseApp) {
  analyticsIsSupported().then((ok) => { if (ok) analytics = getAnalytics(firebaseApp); }).catch(() => {});
}

export default firebaseApp;
