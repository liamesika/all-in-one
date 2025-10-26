// apps/web/lib/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, getIdToken, logout } from './firebase';
import { userApi } from './api';
import useSWR, { KeyedMutator } from 'swr';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  displayName?: string;
  mustChangePassword?: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  getToken: () => Promise<string | null>;
  ownerUid: string | null;
  mustChangePassword: boolean;
  logout: () => Promise<void>;
  refreshProfile: KeyedMutator<UserProfile>;
  updateProfile: (displayName: string, avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  profileLoading: false,
  getToken: async () => null,
  ownerUid: null,
  mustChangePassword: false,
  logout: async () => {},
  refreshProfile: async () => undefined,
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile using SWR when user is authenticated
  const {
    data: userProfile,
    error: profileError,
    isLoading: profileLoading,
    mutate: refreshProfile
  } = useSWR<UserProfile>(
    user ? '/auth/me' : null,
    user ? () => userApi.getMe() : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
      shouldRetryOnError: false, // Don't retry on 401/404
      onError: (error) => {
        // Silently handle 401 errors (not logged in)
        if (error.message.includes('401') || error.message.includes('No session')) {
          // This is expected when not logged in
          return;
        }
        console.error('Profile fetch error:', error);
      }
    }
  );

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Migrate from localStorage to Firebase auth
    const migrateLocalStorageUser = () => {
      try {
        if (typeof localStorage === 'undefined') return;
        const localUser = localStorage.getItem('user');
        if (localUser) {
          console.log('Migrating user from localStorage to Firebase auth...');
          // We'll keep the localStorage data until Firebase auth is confirmed working
        }
      } catch (error) {
        console.error('Error during migration:', error);
      }
    };

    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Clear localStorage after successful Firebase auth
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('user');
          }
          console.log('Firebase auth established, localStorage cleaned');
        } catch (error) {
          console.warn('Could not access localStorage:', error);
        }
      } else {
        // Check for localStorage migration on no user
        migrateLocalStorageUser();
      }
    });

    return unsubscribe;
  }, []);

  const getToken = async () => {
    return await getIdToken();
  };

  const updateProfile = async (displayName: string, avatarUrl: string) => {
    // Store in localStorage for immediate persistence
    if (typeof window !== 'undefined' && userProfile) {
      const updatedProfile = { ...userProfile, displayName, avatarUrl };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      // Optimistically update SWR cache
      await refreshProfile(updatedProfile, { revalidate: false });
    }
  };

  const value = {
    user,
    userProfile: userProfile || null,
    loading,
    profileLoading,
    getToken,
    ownerUid: user?.uid || null,
    mustChangePassword: userProfile?.mustChangePassword || false,
    logout,
    refreshProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};