// apps/web/app/layout.tsx
import './globals';
import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { cookies, headers } from 'next/headers';
import AppProviders from './providers';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'All-in-One Platform - EFFINITY',
    template: '%s | EFFINITY All-in-One Platform'
  },
  description: 'AI-powered efficiency for modern teams - Real Estate, E-commerce, and Law verticals',
  keywords: ['real estate', 'e-commerce', 'law', 'CRM', 'lead management', 'AI', 'productivity'],
  authors: [{ name: 'EFFINITY Team' }],
  creator: 'EFFINITY',
  publisher: 'EFFINITY',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['he_IL'],
    title: 'All-in-One Platform - EFFINITY',
    description: 'AI-powered efficiency for modern teams',
    siteName: 'EFFINITY All-in-One Platform',
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
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
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('ServiceWorker registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      
      <body
        className={`min-h-screen bg-white text-gray-900 antialiased ${inter.variable}`}
      >
        <AppProviders initialLang={lang}>{children}</AppProviders>
        
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
