'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';

const LanguageToggle: React.FC = () => {
  const { language: lang, toggleLanguage: toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white hover:text-white group"
      title={lang === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
      aria-label={lang === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
    >
      <svg
        className="w-5 h-5 group-hover:scale-110 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span className="sr-only ml-1 text-xs font-medium">
        {lang === 'en' ? 'עב' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;