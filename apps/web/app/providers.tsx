'use client';

import React from 'react';
import LangProvider from '../components/i18n/LangProvider';
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
      <LangProvider initialLang={initialLang}>{children}</LangProvider>
    </AuthProvider>
  );
}
