'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('he'); // Default to Hebrew

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'he' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div dir={language === 'he' ? 'rtl' : 'ltr'} lang={language}>
        {children}
      </div>
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