'use client';
import { useLang } from './i18n/LangProvider'; // עדכני נתיב יחסי נכון

export default function LanguageToggle() {
  const { lang, toggle } = useLang();
  return (
    <button onClick={toggle} className="text-xs px-2 py-1 rounded-lg border border-neutral-300 hover:bg-neutral-50">
      <span suppressHydrationWarning>{lang === 'en' ? 'עברית' : 'English'}</span>
    </button>
  );
}
