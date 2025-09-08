// apps/web/app/layout.tsx
import './globals.css'; // ← זה מחזיר את ה-Tailwind/סטיילים שלך
import React from 'react';
import { cookies, headers } from 'next/headers';
import AppProviders from './providers';
// אם השתמשת בפונט מ-Next/font, תחזירי גם אותו כאן:
// import { Inter } from 'next/font/google';
// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const h = await headers();

  // עדיפויות: cookie 'lang' -> Accept-Language -> 'he'
  const cookieLang = (cookieStore.get('lang')?.value ?? '') as 'he' | 'en' | '';
  const accept = (h.get('accept-language') || '').toLowerCase();
  const acceptLang = accept.startsWith('he') ? 'he' : accept.startsWith('en') ? 'en' : '';

  const lang: 'he' | 'en' =
    cookieLang === 'he' || cookieLang === 'en'
      ? cookieLang
      : (acceptLang as 'he' | 'en') || 'he';

  const dir = lang === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir}>
      <body
        className={
          // החזירי פה כל מחלקות שהיו לך קודם על <body>
          // למשל:
          'min-h-screen bg-white text-gray-900 antialiased'
          // + (inter?.variable ?? '')
        }
      >
        <AppProviders initialLang={lang}>{children}</AppProviders>
      </body>
    </html>
  );
}
