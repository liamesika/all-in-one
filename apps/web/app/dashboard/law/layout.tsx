'use client';

import { LawHeader } from '@/components/law/LawHeader';
import { LawSidebar } from '@/components/law/LawSidebar';
import { LawFooter } from '@/components/law/LawFooter';
import { LanguageProvider } from '@/lib/language-context';

export default function LawLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] flex flex-col">
        <LawHeader />
        <div className="flex flex-1">
          <LawSidebar />
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
        <LawFooter />
      </div>
    </LanguageProvider>
  );
}