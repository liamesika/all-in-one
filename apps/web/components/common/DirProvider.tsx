'use client';

import { createContext, useContext, ReactNode } from 'react';

interface DirContextType {
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const DirContext = createContext<DirContextType>({
  dir: 'ltr',
  isRTL: false,
});

export function useDir() {
  return useContext(DirContext);
}

interface DirProviderProps {
  children: ReactNode;
  locale?: string;
}

/**
 * Direction provider for RTL/LTR support
 *
 * Usage:
 * ```tsx
 * <DirProvider locale={lang}>
 *   {children}
 * </DirProvider>
 * ```
 */
export function DirProvider({ children, locale = 'en' }: DirProviderProps) {
  const isRTL = locale === 'he' || locale === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <DirContext.Provider value={{ dir, isRTL }}>
      <div dir={dir} className={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </DirContext.Provider>
  );
}
