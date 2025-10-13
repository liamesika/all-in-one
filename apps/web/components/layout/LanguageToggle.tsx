'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language: lang, toggleLanguage: toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white hover:text-white group"
      title="Change Language"
      aria-label={lang === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
    >
      <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </button>
  );
};

export default LanguageToggle;