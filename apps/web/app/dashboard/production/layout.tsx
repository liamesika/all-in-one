'use client';

import { ProductionsSidebar } from '@/components/productions/ProductionsSidebar';
import { CommandPalette } from '@/components/productions/CommandPalette';
import { LanguageProvider } from '@/lib/language-context';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function ProductionLayoutContent({ children }: { children: React.ReactNode }) {
  const { showCommandPalette, setShowCommandPalette } = useKeyboardShortcuts();

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
