'use client';

import { ProductionsSidebar } from '@/components/productions/ProductionsSidebar';
import { CommandPalette } from '@/components/productions/CommandPalette';
import { AIAssistant } from '@/components/productions/AIAssistant';
import { LanguageProvider } from '@/lib/language-context';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePathname } from 'next/navigation';

function ProductionLayoutContent({ children }: { children: React.ReactNode }) {
  const { showCommandPalette, setShowCommandPalette } = useKeyboardShortcuts();
  const pathname = usePathname();

  // Determine AI context based on current path
  const getAIContext = () => {
    if (pathname.includes('/projects')) return 'projects';
    if (pathname.includes('/tasks')) return 'tasks';
    if (pathname.includes('/reports')) return 'reports';
    if (pathname.includes('/calendar')) return 'calendar';
    if (pathname.includes('/company')) return 'clients';
    return 'general';
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <ProductionsSidebar />
      <div className="flex-1">
        {children}
      </div>
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
      <AIAssistant context={getAIContext()} />
    </div>
  );
}

export default function ProductionLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ProductionLayoutContent>
        {children}
      </ProductionLayoutContent>
    </LanguageProvider>
  );
}
