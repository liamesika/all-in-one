'use client';

import { useLanguage } from '@/lib/language-context';
import { ChevronDown } from 'lucide-react';

export function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();

  const currentLanguageLabel = language === 'en' 
    ? (t?.('common.english') || 'English')
    : (t?.('common.hebrew') || 'עברית');
  
  const ariaLabel = language === 'en'
    ? 'Switch to Hebrew language'
    : 'Switch to English language';

  return (
    <button
      onClick={toggleLanguage}
      className="
        flex items-center justify-center gap-2 px-4 py-2 text-sm 
        bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200
        text-white font-medium backdrop-blur-sm border border-white/20
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white 
        focus-visible:ring-offset-2 focus-visible:ring-offset-blue-800
        min-h-[40px] min-w-[80px]
      "
      aria-label={ariaLabel}
      title={ariaLabel}
      type="button"
    >
      <span className="text-sm" aria-hidden="true" role="img" aria-label="language icon">
        🌐
      </span>
      <span className="font-semibold">
        {currentLanguageLabel}
      </span>
      <ChevronDown 
        className="h-4 w-4 opacity-70" 
        aria-hidden="true"
      />
    </button>
  );
}

// Alternative dropdown version for future enhancement
export function LanguageDropdown() {
  const { language, setLanguage } = useLanguage();
  
  const languages = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'he', label: 'Hebrew', nativeLabel: 'עברית' }
  ];
  
  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'he')}
        className="
          appearance-none bg-white/10 hover:bg-white/20 rounded-lg 
          px-4 py-2 pr-8 text-white font-medium border border-white/20
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white 
          focus-visible:ring-offset-2 focus-visible:ring-offset-blue-800
          cursor-pointer transition-all duration-200 min-h-[40px]
        "
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option 
            key={lang.code} 
            value={lang.code}
            className="bg-blue-800 text-white"
          >
            {lang.nativeLabel}
          </option>
        ))}
      </select>
      <ChevronDown 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-70 pointer-events-none" 
        aria-hidden="true"
      />
    </div>
  );
}