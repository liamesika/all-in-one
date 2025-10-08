// apps/web/lib/firebase.ts
// Client-side Firebase initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim(),
};

// Debug logging to verify Firebase project configuration
console.log('🔧 [Firebase Client] Initializing with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 20) + '...',
});

// Initialize Firebase only if it hasn't been initialized yet
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Verify the initialized app matches expected project
console.log('✅ [Firebase Client] App initialized:', {
  name: firebaseApp.name,
  projectId: firebaseApp.options.projectId,
  authDomain: firebaseApp.options.authDomain,
  storageBucket: firebaseApp.options.storageBucket,
});

export const firebaseAuth = getAuth(firebaseApp);

// Helper to get ID token for API calls
export const getIdToken = async () => {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

// Helper to get ID token result with custom claims
export const getIdTokenResult = async () => {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  return await user.getIdTokenResult();
};

// Backward-compatible exports for components still using old imports
/**
 * @deprecated Use onAuthStateChanged from @/services/authClient instead
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}

/**
 * @deprecated Use logoutUser from @/services/authClient instead
 */
export async function logout() {
  const { logoutUser } = await import('@/services/authClient');
  return logoutUser();
}

/**
 * @deprecated Use logoutUser from @/services/authClient instead
 */
export async function signOut() {
  const { logoutUser } = await import('@/services/authClient');
  return logoutUser();
}

export default firebaseApp;
