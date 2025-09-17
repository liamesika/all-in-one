'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'he';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Properties Page
    'properties.title': 'EFFINITY Properties',
    'properties.addProperty': 'Add Property',
    'properties.search': 'Search properties...',
    'properties.name': 'Name',
    'properties.city': 'City',
    'properties.price': 'Price',
    'properties.rooms': 'Rooms',
    'properties.size': 'Size (sqm)',
    'properties.status': 'Status',
    'properties.actions': 'Actions',
    'properties.view': 'View',
    'properties.edit': 'Edit',
    'properties.delete': 'Delete',
    'properties.noProperties': 'No properties found.',
    
    // New Property Page
    'newProperty.title': 'Add New Property',
    'newProperty.propertyName': 'Property Name',
    'newProperty.propertyNamePlaceholder': 'e.g., 4-room apartment on Rothschild',
    'newProperty.propertyNameRequired': 'Required field. Will be highlighted if empty.',
    'newProperty.address': 'Address',
    'newProperty.addressPlaceholder': 'e.g., Rothschild 45',
    'newProperty.city': 'City',
    'newProperty.cityPlaceholder': 'Tel Aviv, Haifa, Jerusalem...',
    'newProperty.agentName': 'Agent Name',
    'newProperty.agentNamePlaceholder': 'Full name',
    'newProperty.agentPhone': 'Agent Phone',
    'newProperty.agentPhonePlaceholder': 'e.g., 0587878676',
    'newProperty.price': 'Price (₪)',
    'newProperty.pricePlaceholder': 'Enter amount',
    'newProperty.rooms': 'Rooms',
    'newProperty.roomsPlaceholder': 'Number',
    'newProperty.size': 'Size (sqm)',
    'newProperty.sizePlaceholder': 'Square meters',
    'newProperty.photos': 'Property Photos',
    'newProperty.photosDropText': 'Drop images here or click to select files',
    'newProperty.photosSupport': 'Support up to 20 images at once',
    'newProperty.removePhoto': 'Remove',
    'newProperty.cancel': 'Cancel',
    'newProperty.save': 'Save Property',
    'newProperty.saving': 'Saving...',
    
    // Common
    'common.loading': 'Loading...',
    'common.english': 'English',
    'common.hebrew': 'Hebrew',
  },
  he: {
    // Properties Page
    'properties.title': 'נכסים EFFINITY',
    'properties.addProperty': 'הוסף נכס',
    'properties.search': 'חפש נכסים...',
    'properties.name': 'שם',
    'properties.city': 'עיר',
    'properties.price': 'מחיר',
    'properties.rooms': 'חדרים',
    'properties.size': 'גודל (מ"ר)',
    'properties.status': 'סטטוס',
    'properties.actions': 'פעולות',
    'properties.view': 'צפה',
    'properties.edit': 'ערוך',
    'properties.delete': 'מחק',
    'properties.noProperties': 'לא נמצאו נכסים.',
    
    // New Property Page
    'newProperty.title': 'הוסף נכס חדש',
    'newProperty.propertyName': 'שם הנכס',
    'newProperty.propertyNamePlaceholder': 'לדוגמה, דירת 4 חדרים ברוטשילד',
    'newProperty.propertyNameRequired': 'שדה חובה. יודגש אם ריק.',
    'newProperty.address': 'כתובת',
    'newProperty.addressPlaceholder': 'לדוגמה, רוטשילד 45',
    'newProperty.city': 'עיר',
    'newProperty.cityPlaceholder': 'תל אביב, חיפה, ירושלים...',
    'newProperty.agentName': 'שם הסוכן',
    'newProperty.agentNamePlaceholder': 'שם מלא',
    'newProperty.agentPhone': 'טלפון סוכן',
    'newProperty.agentPhonePlaceholder': 'לדוגמה: 0587878676',
    'newProperty.price': 'מחיר (₪)',
    'newProperty.pricePlaceholder': 'הכנס סכום',
    'newProperty.rooms': 'חדרים',
    'newProperty.roomsPlaceholder': 'מספר',
    'newProperty.size': 'גודל (מ"ר)',
    'newProperty.sizePlaceholder': 'מטר רבוע',
    'newProperty.photos': 'תמונות הנכס',
    'newProperty.photosDropText': 'גרור תמונות לכאן או לחץ לבחירת קבצים',
    'newProperty.photosSupport': 'תמיכה עד 20 תמונות בבת אחת',
    'newProperty.removePhoto': 'הסר',
    'newProperty.cancel': 'ביטול',
    'newProperty.save': 'שמור נכס',
    'newProperty.saving': 'שומר...',
    
    // Common
    'common.loading': 'טוען...',
    'common.english': 'אנגלית',
    'common.hebrew': 'עברית',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLang
}: {
  children: ReactNode;
  initialLang?: Language;
}) {
  // Always start with the same state on server and client to prevent hydration mismatch
  const [language, setLanguage] = useState<Language>(initialLang || 'en');
  const [hydrated, setHydrated] = useState(false);

  // Initialize language from localStorage only on client side after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'he')) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.warn('Failed to load language preference:', error);
      }
      setHydrated(true);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'he' : 'en');
  };

  // Update localStorage when language changes (only after hydration)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem('language', language);
        // Set cookie for SSR language detection
        document.cookie = `language=${language}; path=/; max-age=${60 * 60 * 24 * 365}`;
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }
  }, [language, hydrated]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}