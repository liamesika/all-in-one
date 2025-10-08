// apps/web/services/authClient.ts
// Client-side authentication service using Firebase Auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

export type Vertical = 'REAL_ESTATE' | 'E_COMMERCE' | 'LAW' | 'PRODUCTION';

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  vertical: Vertical;
  lang?: string;
  termsConsent: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName?: string;
  vertical?: Vertical;
  planStatus?: 'basic' | 'premium';
}

/**
 * Sign up with email and password
 * Creates Firebase user, updates profile, and registers with backend
 */
export async function signUpWithEmail(data: SignUpData): Promise<{ uid: string; redirectPath: string }> {
  console.log('🔐 [Auth Client] Starting sign up for:', data.email);

  // Step 1: Create Firebase user
  const userCredential = await createUserWithEmailAndPassword(
    firebaseAuth,
    data.email,
    data.password
  );

  console.log('✅ [Auth Client] Firebase user created:', userCredential.user.uid);

  try {
    // Step 2: Update Firebase profile with display name
    await updateProfile(userCredential.user, {
      displayName: data.fullName,
    });
    console.log('✅ [Auth Client] Display name updated');

    // Step 3: Get fresh ID token
    const idToken = await userCredential.user.getIdToken(true);
    console.log('✅ [Auth Client] ID token obtained');

    // Step 4: Register profile with backend (Firestore)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        idToken,
        profile: {
          fullName: data.fullName,
          vertical: data.vertical,
          lang: data.lang || 'en',
          termsConsent: data.termsConsent,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [Auth Client] Backend registration failed:', errorData);

      // Clean up Firebase user if backend registration fails
      try {
        await userCredential.user.delete();
        console.log('✅ [Auth Client] Cleaned up Firebase user after backend error');
      } catch (deleteError) {
        console.warn('⚠️ [Auth Client] Failed to clean up Firebase user:', deleteError);
      }

      throw new Error(errorData.message || 'Registration failed');
    }

    const result = await response.json();
    console.log('✅ [Auth Client] Registration complete');

    return {
      uid: userCredential.user.uid,
      redirectPath: result.redirectPath || `/dashboard/${data.vertical.toLowerCase()}/dashboard`,
    };
  } catch (error) {
    console.error('❌ [Auth Client] Sign up error:', error);

    // Clean up Firebase user on any error
    try {
      await userCredential.user.delete();
      console.log('✅ [Auth Client] Cleaned up Firebase user after error');
    } catch (deleteError) {
      console.warn('⚠️ [Auth Client] Failed to clean up Firebase user:', deleteError);
    }

    throw error;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<{ uid: string }> {
  console.log('🔐 [Auth Client] Starting sign in for:', email);

  const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);

  console.log('✅ [Auth Client] Sign in successful:', userCredential.user.uid);

  return {
    uid: userCredential.user.uid,
  };
}

/**
 * Sign out and clear all session data
 */
export async function logoutUser(): Promise<void> {
  console.log('🔄 [Auth Client] Starting logout...');

  try {
    // Sign out from Firebase
    await firebaseSignOut(firebaseAuth);
    console.log('✅ [Auth Client] Firebase sign out complete');

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ [Auth Client] Storage cleared');

    // Clear Firebase IndexedDB
    if ('indexedDB' in window) {
      const dbNames = [
        'firebase-auth-database',
        'firebase-app-config',
        'firebaseLocalStorageDb',
      ];

      await Promise.allSettled(
        dbNames.map(
          (dbName) =>
            new Promise((resolve) => {
              const deleteReq = indexedDB.deleteDatabase(dbName);
              deleteReq.onsuccess = () => resolve(true);
              deleteReq.onerror = () => resolve(false);
              deleteReq.onblocked = () => resolve(false);
            })
        )
      );
      console.log('✅ [Auth Client] IndexedDB cleared');
    }

    // Clear cookies
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
    console.log('✅ [Auth Client] Cookies cleared');

    // Redirect to home
    window.location.replace('/');
  } catch (error) {
    console.error('❌ [Auth Client] Logout error:', error);
    // Force clear and redirect even on error
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/');
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChanged(callback: (user: User | null) => void) {
  return firebaseOnAuthStateChanged(firebaseAuth, callback);
}

/**
 * Get current user's ID token
 */
export async function getCurrentUserToken(): Promise<string | null> {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

/**
 * Get current user's profile from backend
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const token = await getCurrentUserToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('❌ [Auth Client] Failed to fetch user profile');
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('❌ [Auth Client] Error fetching user profile:', error);
    return null;
  }
}
