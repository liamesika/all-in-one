'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '../lib/language-context';
import { AuthProvider } from '../lib/auth-context';
import { OrganizationProvider } from '../lib/organization-context';
import { MustChangePasswordGate } from '../components/auth/must-change-password-gate';
import { ApiUtils } from '../lib/api';

// Public routes that don't need authentication
const PUBLIC_ROUTES = ['/login', '/register', '/', '/real-estate', '/e-commerce', '/law', '/industries'];

// SWR configuration
const swrConfig = {
  fetcher: (url: string) => ApiUtils.getCached(url, 30000),
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30000,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  onError: (error: any, key: string) => {
    console.error('SWR Error:', error, 'Key:', key);

    // Handle specific error types
    if (error?.statusCode === 401) {
      // Don't show toast for auth errors - handled by API client
      return;
    }

    if (error?.statusCode >= 500) {
      // Don't show toast for server errors - handled by API client
      return;
    }
  },
};

export default function AppProviders({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: 'he' | 'en';
}) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  console.log('🔵 [AppProviders] Pathname:', pathname, 'isPublicRoute:', isPublicRoute);

  return (
    <SWRConfig value={swrConfig}>
      {isPublicRoute ? (
        // Public routes: No AuthProvider, no /api/auth/me calls
        <LanguageProvider initialLang={initialLang}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </LanguageProvider>
      ) : (
        // Protected routes: Include AuthProvider
        <AuthProvider>
          <LanguageProvider initialLang={initialLang}>
            <MustChangePasswordGate>
              <OrganizationProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </OrganizationProvider>
            </MustChangePasswordGate>
          </LanguageProvider>
        </AuthProvider>
      )}
    </SWRConfig>
  );
}
