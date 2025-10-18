'use client';

/**
 * Law Footer Component
 * Footer with contact info and legal links
 */

import { useLanguage } from '@/lib/language-context';

export function LawFooter() {
  const { language } = useLanguage();

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-[#2979FF]/20 bg-white dark:bg-[#0E1A2B]">
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'he' ? 'צור קשר' : 'Contact'}
            </h4>
            <p>support@effinity.co.il</p>
            <p dir="ltr">+972-50-555-1234</p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'he' ? 'משפטי' : 'Legal'}
            </h4>
            <ul className="space-y-1">
              <li>
                <a href="/privacy" className="hover:text-[#2979FF] transition-colors">
                  {language === 'he' ? 'מדיניות פרטיות' : 'Privacy Policy'}
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-[#2979FF] transition-colors">
                  {language === 'he' ? 'תנאי שימוש' : 'Terms of Service'}
                </a>
              </li>
              <li>
                <a href="/ip-policy" className="hover:text-[#2979FF] transition-colors">
                  {language === 'he' ? 'קניין רוחני' : 'IP Policy'}
                </a>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'he' ? 'אודות' : 'About'}
            </h4>
            <p>
              {language === 'he'
                ? '© 2025 Effinity. כל הזכויות שמורות.'
                : '© 2025 Effinity. All rights reserved.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
