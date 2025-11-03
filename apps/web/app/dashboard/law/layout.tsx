'use client';

import { LangProvider, useLang } from '@/components/i18n/LangProvider';
import { LawSidebar } from '@/components/dashboard/LawSidebar';
import { MobileLawDrawer } from '@/components/dashboard/MobileLawDrawer';
import { DirProvider } from '@/components/common/DirProvider';

function LawLayoutContent({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();

  return (
    <DirProvider locale={lang}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
        <LawSidebar />
        <MobileLawDrawer />
        <main className="flex-1 ms-0 md:ms-[72px]">
          {children}
        </main>
      </div>
    </DirProvider>
  );
}

export default function LawLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <LawLayoutContent>{children}</LawLayoutContent>
    </LangProvider>
  );
}