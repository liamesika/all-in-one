'use client';

import { CreativeProductionsNav } from '@/components/productions/CreativeProductionsNav';
import { LanguageProvider } from '@/lib/language-context';
import { usePathname } from 'next/navigation';

export default function CreativeProductionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <LanguageProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
        <CreativeProductionsNav />
        <div className="flex-1 lg:ml-64">
          {children}
        </div>
      </div>
    </LanguageProvider>
  );
}
