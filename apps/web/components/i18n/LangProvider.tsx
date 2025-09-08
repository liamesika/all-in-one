'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dict } from './dict';

export type Lang = keyof typeof dict;
type TKey = keyof typeof dict['en'];

type LangCtx = {
  lang: Lang;
  t: (key: TKey) => string;
  toggle: () => void;
  setLang: (l: Lang) => void;
};

const LangContext = createContext<LangCtx | null>(null);

export function LangProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Lang; // מגיע מה־SSR
}) {
  // שימי לב: לא קוראים ל-localStorage כאן כדי לא ליצור mismatch!
  const [lang, setLang] = useState<Lang>(initialLang);

  const t = (key: TKey) =>
    (dict[lang] as any)[key] ?? (dict.en as any)[key] ?? (key as string);

  const toggle = () => setLang((prev) => (prev === 'en' ? 'he' : 'en'));

  useEffect(() => {
    // סנכרון מתרחש רק אחרי שיש סטייט — זה יקרה לאחר אינטראקציה/טעינה אחידה
    try {
      window.localStorage.setItem('lang', lang);
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
      // נעדכן גם cookie כדי שב־SSR הבא נקבל אותה שפה
      document.cookie = `lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {}
  }, [lang]);

  const value = useMemo(() => ({ lang, t, toggle, setLang }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

export default LangProvider;
