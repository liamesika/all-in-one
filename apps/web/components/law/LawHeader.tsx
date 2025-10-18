'use client';

/**
 * Law Header Component
 * Persistent header with page title, language toggle, notifications, profile menu
 * Matches RealEstateHeader patterns exactly
 */

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { usePathname } from 'next/navigation';
import { Bell, User, MessageCircle, Globe, Menu, X, Scale } from 'lucide-react';

export function LawHeader() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Determine page title based on pathname
  const getPageTitle = () => {
    const titles: Record<string, { en: string; he: string }> = {
      '/dashboard/law/dashboard': { en: 'Dashboard', he: 'לוח בקרה' },
      '/dashboard/law/cases': { en: 'Cases', he: 'תיקים' },
      '/dashboard/law/clients': { en: 'Clients', he: 'לקוחות' },
      '/dashboard/law/documents': { en: 'Documents', he: 'מסמכים' },
      '/dashboard/law/calendar': { en: 'Calendar', he: 'יומן' },
      '/dashboard/law/tasks': { en: 'Tasks', he: 'משימות' },
      '/dashboard/law/invoices': { en: 'Invoices', he: 'חשבוניות' },
      '/dashboard/law/reports': { en: 'Reports & Analytics', he: 'דוחות וניתוח' },
      '/dashboard/law/team': { en: 'Team', he: 'צוות' },
      '/dashboard/law/settings': { en: 'Settings', he: 'הגדרות' },
    };

    const title = titles[pathname];
    return title ? title[language as keyof typeof title] : (language === 'he' ? 'משרד עורכי דין' : 'Law Firm');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  const handleSignOut = () => {
    console.log('Sign out clicked');
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-[#2979FF]/20 bg-white dark:bg-[#0E1A2B] shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left: Page Title with Law Icon */}
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

          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#2979FF]" />
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>
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
          </button>

          {/* Messages */}
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
                        {language === 'he' ? 'דיון בבית משפט מחר' : 'Court hearing tomorrow'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {language === 'he' ? 'לפני שעה' : '1 hour ago'}
                      </p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {language === 'he' ? 'מסמך חדש הועלה' : 'New document uploaded'}
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

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-[#1A2F4B] border border-gray-200 dark:border-[#2979FF]/20 overflow-hidden z-20">
                  <div className="p-4 border-b border-gray-200 dark:border-[#2979FF]/20">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {language === 'he' ? 'עורך דין דמו' : 'Attorney Demo'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      demo@lawfirm.com
                    </p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      {language === 'he' ? 'פרופיל' : 'Profile'}
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      {language === 'he' ? 'הגדרות' : 'Settings'}
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

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 dark:border-[#2979FF]/20 bg-white dark:bg-[#0E1A2B]">
          <nav className="p-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
              {language === 'he' ? 'השתמש בסרגל הצד לניווט' : 'Use sidebar for navigation'}
            </p>
          </nav>
        </div>
      )}
    </header>
  );
}
