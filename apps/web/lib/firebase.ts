// apps/web/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Auth functions
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

// Comprehensive logout function that clears all session data
export const logout = async () => {
  try {
    // Sign out from Firebase Auth
    await firebaseSignOut(auth);

    // Clear all localStorage data
    localStorage.clear();

    // Clear all sessionStorage data
    sessionStorage.clear();

    // Clear Firebase-specific IndexedDB data
    if ('indexedDB' in window) {
      try {
        // Clear Firebase Auth IndexedDB
        const authDB = indexedDB.deleteDatabase('firebase-auth-database');
        const configDB = indexedDB.deleteDatabase('firebase-app-config');
        await Promise.allSettled([authDB, configDB]);
      } catch (error) {
        console.warn('Failed to clear IndexedDB:', error);
      }
    }

    // Clear all cookies related to Firebase and the app
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      // Clear cookie for current domain and all parent domains
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    });

    // Clear any cached user preferences
    localStorage.removeItem('user');
    localStorage.removeItem('lastDashboard');
    localStorage.removeItem('language');
    localStorage.removeItem('lang');

    console.log('✅ Complete logout successful - all session data cleared');

    // Redirect to homepage
    window.location.href = '/';

  } catch (error) {
    console.error('❌ Logout error:', error);
    // Even if there's an error, redirect to homepage
    window.location.href = '/';
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Helper to get ID token for API calls
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

export default app;