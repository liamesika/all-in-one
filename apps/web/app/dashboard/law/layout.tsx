'use client';

import { LangProvider } from '@/components/i18n/LangProvider';

export default function LawLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      {children}
    </LangProvider>
  );
}