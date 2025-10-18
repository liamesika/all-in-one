'use client';

/**
 * Real Estate Footer Component
 * Company information, links, and branding
 */

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import Image from 'next/image';

export function RealEstateFooter() {
  const { language } = useLanguage();

  const t = {
    poweredBy: language === 'he' ? 'מופעל על ידי' : 'Powered by',
    support: language === 'he' ? 'תמיכה' : 'Support',
    contact: language === 'he' ? 'צור קשר' : 'Contact',
    privacyPolicy: language === 'he' ? 'מדיניות פרטיות' : 'Privacy Policy',
    termsOfUse: language === 'he' ? 'תנאי שימוש' : 'Terms of Use',
    ipBrandPolicy: language === 'he' ? 'מדיניות IP ומותג' : 'IP & Brand Policy',
    allRightsReserved: language === 'he' ? 'כל הזכויות שמורות' : 'All rights reserved',
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 dark:border-[#2979FF]/20 bg-white dark:bg-[#0E1A2B] mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {/* Logo placeholder - replace with actual Effinity logo */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2979FF] to-[#1e5bb8] flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Effinity
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'he'
                ? 'פלטפורמה משולבת לניהול נדל״ן'
                : 'All-in-One Real Estate Management Platform'}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {t.contact}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:support@effinity.co.il"
                  className="hover:text-[#2979FF] transition-colors"
                >
                  support@effinity.co.il
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400" dir="ltr">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+972505551234" className="hover:text-[#2979FF] transition-colors">
                  +972-50-555-1234
                </a>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {language === 'he' ? 'משפטי' : 'Legal'}
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/legal/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-[#2979FF] dark:hover:text-[#2979FF] transition-colors"
              >
                {t.privacyPolicy}
              </Link>
              <Link
                href="/legal/terms"
                className="text-gray-600 dark:text-gray-400 hover:text-[#2979FF] dark:hover:text-[#2979FF] transition-colors"
              >
                {t.termsOfUse}
              </Link>
              <Link
                href="/legal/ip"
                className="text-gray-600 dark:text-gray-400 hover:text-[#2979FF] dark:hover:text-[#2979FF] transition-colors"
              >
                {t.ipBrandPolicy}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-[#2979FF]/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Effinity. {t.allRightsReserved}.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{t.poweredBy}</span>
              <a
                href="https://effinity.co.il"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#2979FF] hover:text-[#1e5bb8] transition-colors"
              >
                Effinity
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
