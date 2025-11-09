'use client';

/**
 * Real Estate Header Component
 * Persistent header with page title, language toggle, notifications, profile menu
 */

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { usePathname } from 'next/navigation';
import { Bell, User, MessageCircle, Globe, Menu, X } from 'lucide-react';
import { UniversalButton } from '@/components/shared';

export function RealEstateHeader() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Determine page title based on pathname
  const getPageTitle = () => {
    const titles: Record<string, { en: string; he: string }> = {
      '/dashboard/real-estate/dashboard': { en: 'Dashboard', he: 'לוח בקרה' },
      '/dashboard/real-estate/properties': { en: 'Properties', he: 'נכסים' },
      '/dashboard/real-estate/leads': { en: 'Leads', he: 'לידים' },
      '/dashboard/real-estate/calendar': { en: 'Calendar', he: 'יומן' },
      '/dashboard/real-estate/customers': { en: 'Customers', he: 'לקוחות' },
      '/dashboard/real-estate/campaigns': { en: 'Campaigns', he: 'קמפיינים' },
      '/dashboard/real-estate/ai-searcher': { en: 'AI Property Search', he: 'חיפוש AI' },
      '/dashboard/real-estate/neighborhoods': { en: 'Smart Neighborhood Map', he: 'מפת שכונות חכמה' },
      '/dashboard/real-estate/agents': { en: 'Agents & Tasks', he: 'סוכנים ומשימות' },
      '/dashboard/real-estate/automations': { en: 'Automations', he: 'אוטומציות' },
      '/dashboard/real-estate/integrations': { en: 'Integrations', he: 'אינטגרציות' },
      '/dashboard/real-estate/reports': { en: 'Reports & Analytics', he: 'דוחות וניתוח' },
    };

    const title = titles[pathname];
    return title ? title[language as keyof typeof title] : (language === 'he' ? 'נדל"ן' : 'Real Estate');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  const handleSignOut = () => {
    // TODO: Implement actual sign out logic
    console.log('Sign out clicked');
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-[#2979FF]/20 bg-white dark:bg-[#0E1A2B] shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left: Page Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={language === 'en' ? 'Switch to Hebrew' : 'עבור לאנגלית'}
          >
            <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="sr-only">
              {language === 'en' ? 'Switch to Hebrew' : 'עבור לאנגלית'}
            </span>
          </button>

          {/* Chat Icon (if applicable) */}
          <button
            className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            title={language === 'he' ? 'הודעות' : 'Messages'}
          >
            <MessageCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              title={language === 'he' ? 'התראות' : 'Notifications'}
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white dark:bg-[#1A2F4B] border border-gray-200 dark:border-[#2979FF]/20 overflow-hidden z-20">
                  <div className="p-4 border-b border-gray-200 dark:border-[#2979FF]/20">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {language === 'he' ? 'התראות' : 'Notifications'}
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {language === 'he' ? 'ליד חדש התקבל' : 'New lead received'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {language === 'he' ? 'לפני 5 דקות' : '5 minutes ago'}
                      </p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {language === 'he' ? 'צפייה בנכס מתוזמנת' : 'Property viewing scheduled'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {language === 'he' ? 'לפני שעה' : '1 hour ago'}
                      </p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {language === 'he' ? 'נכס חדש פורסם' : 'New property published'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {language === 'he' ? 'לפני 3 שעות' : '3 hours ago'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-[#2979FF]/20">
                    <button className="w-full text-sm text-[#2979FF] hover:text-[#1e5bb8] font-medium">
                      {language === 'he' ? 'הצג הכל' : 'View all'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#2979FF] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">
                {language === 'he' ? 'חשבון' : 'Account'}
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-[#1A2F4B] border border-gray-200 dark:border-[#2979FF]/20 overflow-hidden z-20">
                  <div className="p-4 border-b border-gray-200 dark:border-[#2979FF]/20">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {language === 'he' ? 'משתמש דמו' : 'Demo User'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      demo@example.com
                    </p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      {language === 'he' ? 'פרופיל' : 'Profile'}
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      {language === 'he' ? 'הגדרות' : 'Settings'}
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      {language === 'he' ? 'עזרה' : 'Help'}
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-[#2979FF]/20 py-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {language === 'he' ? 'התנתק' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu (if needed for navigation) */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 dark:border-[#2979FF]/20 bg-white dark:bg-[#0E1A2B]">
          <nav className="p-4 space-y-2">
            {/* Mobile navigation links can be added here if needed */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
              {language === 'he' ? 'השתמש בסרגל הצד לניווט' : 'Use sidebar for navigation'}
            </p>
          </nav>
        </div>
      )}
    </header>
  );
}
