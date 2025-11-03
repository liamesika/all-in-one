'use client';

import { LangProvider } from '@/components/i18n/LangProvider';
import { LawSidebar } from '@/components/dashboard/LawSidebar';
import { MobileLawDrawer } from '@/components/dashboard/MobileLawDrawer';

export default function LawLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
        <LawSidebar />
        <MobileLawDrawer />
        <main className="flex-1 ml-0 md:ml-[72px]">
          {children}
        </main>
      </div>
    </LangProvider>
  );
}