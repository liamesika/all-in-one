'use client';

import { AIAdvisorBot } from '@/components/real-estate/AIAdvisorBot';
import { LanguageProvider } from '@/lib/language-context';
import { usePathname } from 'next/navigation';

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine page context for AI Advisor
  const getPageContext = () => {
    if (pathname.includes('/leads')) return 'leads';
    if (pathname.includes('/properties/new')) return 'ad-generator';
    if (pathname.includes('/properties') && pathname.match(/\/properties\/[^/]+$/)) return 'property-detail';
    if (pathname.includes('/properties')) return 'properties';
    if (pathname.includes('/campaigns')) return 'campaigns';
    if (pathname.includes('/ai-searcher')) return 'comps';
    return 'dashboard';
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
        <AIAdvisorBot
          pageContext={{
            page: getPageContext() as any,
            data: null
          }}
        />
      </div>
    </LanguageProvider>
  );
}