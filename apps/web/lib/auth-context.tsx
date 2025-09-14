// apps/web/lib/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, getIdToken } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  ownerUid: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  getToken: async () => null,
  ownerUid: null,
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

  useEffect(() => {
    // Migrate from localStorage to Firebase auth
    const migrateLocalStorageUser = () => {
      try {
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
        localStorage.removeItem('user');
        console.log('Firebase auth established, localStorage cleaned');
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

  const value = {
    user,
    loading,
    getToken,
    ownerUid: user?.uid || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};