'use client';

import React from 'react';
import LangProvider from '../components/i18n/LangProvider';

export default function AppProviders({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: 'he' | 'en';
}) {
  return <LangProvider initialLang={initialLang}>{children}</LangProvider>;
}
