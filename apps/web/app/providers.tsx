'use client';

import React from 'react';
import { LanguageProvider } from '../lib/language-context';
import { AuthProvider } from '../lib/auth-context';

export default function AppProviders({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: 'he' | 'en';
}) {
  return (
    <AuthProvider>
      <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
    </AuthProvider>
  );
}
