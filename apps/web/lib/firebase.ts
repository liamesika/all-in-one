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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL?.trim()
};

// Debug logging to verify Firebase project configuration
console.log('🔧 [Firebase Client] Initializing with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 20) + '...',
});

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Verify the initialized app matches expected project
console.log('✅ [Firebase Client] App initialized:', {
  name: app.name,
  projectId: app.options.projectId,
  authDomain: app.options.authDomain,
  storageBucket: app.options.storageBucket,
});

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
    console.log('🔄 Starting comprehensive logout...');

    // First, sign out from Firebase Auth
    await firebaseSignOut(auth);
    console.log('✅ Firebase Auth signed out');

    // Wait a moment for Firebase to process the sign out
    await new Promise(resolve => setTimeout(resolve, 100));

    // Clear all localStorage data
    localStorage.clear();
    console.log('✅ localStorage cleared');

    // Clear all sessionStorage data
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');

    // Clear Firebase-specific IndexedDB data
    if ('indexedDB' in window) {
      try {
        // Clear Firebase Auth IndexedDB databases
        const dbPromises = [
          'firebase-auth-database',
          'firebase-app-config',
          'firebaseLocalStorageDb'
        ].map(dbName => {
          return new Promise((resolve) => {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            deleteReq.onsuccess = () => resolve(`${dbName} deleted`);
            deleteReq.onerror = () => resolve(`${dbName} delete failed`);
            deleteReq.onblocked = () => resolve(`${dbName} delete blocked`);
          });
        });

        const results = await Promise.allSettled(dbPromises);
        console.log('✅ IndexedDB cleanup results:', results);
      } catch (error) {
        console.warn('⚠️ IndexedDB cleanup failed:', error);
      }
    }

    // Clear all cookies related to Firebase and the app
    const cookiesToClear = document.cookie.split(";");
    cookiesToClear.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        // Clear cookie for current domain and all parent domains
        const expireDate = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = `${name}=;${expireDate};path=/`;
        document.cookie = `${name}=;${expireDate};path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;${expireDate};path=/;domain=.${window.location.hostname}`;
      }
    });
    console.log('✅ Cookies cleared');

    // Clear specific Firebase persistence keys that might remain
    const firebaseKeys = [
      'firebase:host:all-in-one-eed0a-default-rtdb.firebaseio.com',
      'firebase:authUser:AIzaSyDtZJA6SxMsWcDOJDHQrKGOmVLkMaInLaI:[DEFAULT]',
      'firebase:config',
      'user',
      'lastDashboard',
      'language',
      'lang'
    ];

    firebaseKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log('✅ Complete logout successful - all session data cleared');

    // Force a complete page reload to ensure clean state
    window.location.replace('/');

  } catch (error) {
    console.error('❌ Logout error:', error);
    // Even if there's an error, force clear and redirect
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/');
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

// Helper to get ID token result with custom claims
export const getIdTokenResult = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdTokenResult();
};

export default app;