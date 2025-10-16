'use client';

import { ProductionsSidebar } from '@/components/productions/ProductionsSidebar';
import { LanguageProvider } from '@/lib/language-context';

export default function ProductionLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen bg-[#F9FAFB]">
        <ProductionsSidebar />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </LanguageProvider>
  );
}
