// apps/web/app/layout.tsx
import './globals';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import '../styles/themes/law.theme.css';
import React from 'react';
import { cookies, headers } from 'next/headers';
import AppProviders from './providers';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { GlobalFooter } from '@/components/GlobalFooter';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Effinity — AI-Powered Business Management Platform',
    template: '%s | Effinity'
  },
  description: 'Manage Real Estate, E-Commerce, Productions, and Law operations in one unified SaaS platform. AI-driven automation, unified analytics, and enterprise-grade tools.',
  keywords: [
    'business management platform',
    'real estate CRM',
    'e-commerce management',
    'production management',
    'law practice management',
    'AI automation',
    'unified analytics',
    'multi-vertical SaaS',
    'lead management',
    'property management',
    'project management'
  ],
  authors: [{ name: 'Effinity Team' }],
  creator: 'Effinity',
  publisher: 'Effinity',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['he_IL'],
    title: 'Effinity — AI-Powered Business Management Platform',
    description: 'One intelligent platform for Real Estate, E-Commerce, Productions, and Law. Unified CRM, AI automation, and analytics for modern businesses.',
    siteName: 'Effinity',
    url: 'https://effinity.co.il',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Effinity Multi-Vertical Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Effinity — AI-Powered Business Management Platform',
    description: 'Manage Real Estate, E-Commerce, Productions, and Law in one unified platform',
    images: ['/og-image.png']
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Effinity',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2979FF' },
    { media: '(prefers-color-scheme: dark)', color: '#0E1A2B' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const h = await headers();

  // עדיפויות: cookie 'language' -> cookie 'lang' -> Accept-Language -> 'he'
  const cookieLang = (cookieStore.get('language')?.value ?? cookieStore.get('lang')?.value ?? '') as 'he' | 'en' | '';
  const accept = (h.get('accept-language') || '').toLowerCase();
  const acceptLang = accept.startsWith('he') ? 'he' : accept.startsWith('en') ? 'en' : '';

  const lang: 'he' | 'en' =
    cookieLang === 'he' || cookieLang === 'en'
      ? cookieLang
      : (acceptLang as 'he' | 'en') || 'he';

  const dir = lang === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <GoogleAnalytics />

        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Service Worker UNREGISTRATION - Critical fix for asset 404s */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // CRITICAL: Unregister service worker that was caching stale assets
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let registration of registrations) {
                    registration.unregister().then(function(success) {
                      if (success) {
                        console.log('✅ ServiceWorker unregistered successfully');
                      }
                    });
                  }
                });

                // Clear all caches
                if ('caches' in window) {
                  caches.keys().then(function(cacheNames) {
                    return Promise.all(
                      cacheNames.map(function(cacheName) {
                        console.log('🗑️ Clearing cache:', cacheName);
                        return caches.delete(cacheName);
                      })
                    );
                  }).then(function() {
                    console.log('✅ All caches cleared');
                  });
                }
              }
            `,
          }}
        />
      </head>
      
      <body
        className={`min-h-screen bg-white text-gray-900 antialiased ${inter.variable}`}
      >
        <AppProviders initialLang={lang}>{children}</AppProviders>
        <GlobalFooter />

        {/* Global logout helper for console debugging */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global logout function for console debugging
              window.logoutUser = async function() {
                try {
                  console.log('🔄 Initiating console logout - comprehensive session clearing...');

                  // Clear all localStorage data first
                  localStorage.clear();
                  console.log('✅ localStorage cleared');

                  // Clear all sessionStorage data
                  sessionStorage.clear();
                  console.log('✅ sessionStorage cleared');

                  // Clear IndexedDB Firebase databases
                  if ('indexedDB' in window) {
                    const dbsToDelete = [
                      'firebase-auth-database',
                      'firebase-app-config',
                      'firebaseLocalStorageDb'
                    ];

                    for (const dbName of dbsToDelete) {
                      try {
                        indexedDB.deleteDatabase(dbName);
                        console.log('🗑️ Deleting IndexedDB:', dbName);
                      } catch (e) {
                        console.warn('⚠️ Failed to delete', dbName, e);
                      }
                    }
                  }

                  // Clear all cookies
                  const cookies = document.cookie.split(";");
                  cookies.forEach(function(cookie) {
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                    if (name) {
                      const expireDate = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
                      document.cookie = name + "=;" + expireDate + ";path=/";
                      document.cookie = name + "=;" + expireDate + ";path=/;domain=" + window.location.hostname;
                      document.cookie = name + "=;" + expireDate + ";path=/;domain=." + window.location.hostname;
                    }
                  });
                  console.log('✅ All cookies cleared');

                  // Clear specific Firebase persistence keys
                  const firebaseKeys = [
                    'firebase:host:all-in-one-eed0a-default-rtdb.firebaseio.com',
                    'firebase:authUser:AIzaSyDtZJA6SxMsWcDOJDHQrKGOmVLkMaInLaI:[DEFAULT]',
                    'firebase:config'
                  ];

                  firebaseKeys.forEach(key => {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                  });

                  console.log('🎯 Specific Firebase keys cleared');
                  console.log('✅ CONSOLE LOGOUT COMPLETE! Redirecting to clean homepage...');

                  // Force complete page reload with cache bust
                  window.location.replace('/?t=' + Date.now());

                } catch (error) {
                  console.error('❌ Console logout failed:', error);
                  console.log('🚨 EMERGENCY: Force clearing all data and redirecting...');

                  // Emergency cleanup
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.replace('/?emergency=true&t=' + Date.now());
                  } catch (e) {
                    console.error('💥 Emergency cleanup failed:', e);
                    alert('Manual refresh required - press F5 or Ctrl+R');
                  }
                }
              };

              // Additional helper for quick auth check
              window.checkAuthState = function() {
                console.log('🔍 Current Auth State Check:');
                console.log('- localStorage keys:', Object.keys(localStorage).filter(k => k.includes('firebase') || k.includes('user')));
                console.log('- sessionStorage keys:', Object.keys(sessionStorage).filter(k => k.includes('firebase') || k.includes('user')));
                console.log('- cookies:', document.cookie);
                return {
                  localStorage: Object.keys(localStorage),
                  sessionStorage: Object.keys(sessionStorage),
                  cookies: document.cookie
                };
              };

              console.log('💡 Debug helpers available:');
              console.log('  - logoutUser() - Complete logout with session clearing');
              console.log('  - checkAuthState() - Check current authentication state');
            `,
          }}
        />

        {/* Performance monitoring client-side initialization */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Track navigation performance in development
                if ('PerformanceObserver' in window) {
                  const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                      if (entry.entryType === 'navigation') {
                        const timing = entry;
                        const metrics = {
                          dns: timing.domainLookupEnd - timing.domainLookupStart,
                          connection: timing.connectEnd - timing.connectStart,
                          request: timing.responseStart - timing.requestStart,
                          response: timing.responseEnd - timing.responseStart,
                          dom: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
                          load: timing.loadEventEnd - timing.loadEventStart
                        };
                        console.table(metrics);
                      }
                    });
                  });
                  observer.observe({ entryTypes: ['navigation'] });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
