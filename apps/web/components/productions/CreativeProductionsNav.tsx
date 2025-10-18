'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import {
  LayoutDashboard,
  FolderKanban,
  Image,
  Film,
  CheckSquare,
  ClipboardCheck,
  Users,
  Calendar,
  BarChart3,
  Settings,
} from 'lucide-react';

interface NavItem {
  name: { en: string; he: string };
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    name: { en: 'Overview', he: 'סקירה' },
    href: '/dashboard/production/creative',
    icon: LayoutDashboard,
  },
  {
    name: { en: 'Projects', he: 'פרויקטים' },
    href: '/dashboard/production/creative/projects',
    icon: FolderKanban,
  },
  {
    name: { en: 'Assets', he: 'נכסים' },
    href: '/dashboard/production/creative/assets',
    icon: Image,
  },
  {
    name: { en: 'Renders', he: 'עיבודים' },
    href: '/dashboard/production/creative/renders',
    icon: Film,
  },
  {
    name: { en: 'Tasks', he: 'משימות' },
    href: '/dashboard/production/creative/tasks',
    icon: CheckSquare,
  },
  {
    name: { en: 'Reviews', he: 'ביקורות' },
    href: '/dashboard/production/creative/reviews',
    icon: ClipboardCheck,
  },
  {
    name: { en: 'Customers', he: 'לקוחות' },
    href: '/dashboard/production/creative/customers',
    icon: Users,
  },
  {
    name: { en: 'Calendar', he: 'יומן' },
    href: '/dashboard/production/creative/calendar',
    icon: Calendar,
  },
  {
    name: { en: 'Analytics', he: 'ניתוח' },
    href: '/dashboard/production/creative/analytics',
    icon: BarChart3,
  },
  {
    name: { en: 'Settings', he: 'הגדרות' },
    href: '/dashboard/production/creative/settings',
    icon: Settings,
  },
];

export function CreativeProductionsNav() {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#1A2F4B] border-r border-gray-200 dark:border-[#2979FF]/20 z-40 hidden lg:block">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {language === 'he' ? 'הפקות יצירתיות' : 'Creative Productions'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'he' ? 'וידאו ופרסומות' : 'Video & Ads'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard/production/creative' &&
                pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#374151]'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">
                    {item.name[language as 'en' | 'he']}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-[#2979FF]/20">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {language === 'he' ? 'פרודקשנס' : 'Productions'} v1.0
        </div>
      </div>
    </aside>
  );
}
