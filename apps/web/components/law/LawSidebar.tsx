'use client';

/**
 * Law Sidebar Component
 * Navigation sidebar with 10 menu items for Law vertical
 */

import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import {
  LayoutDashboard,
  Scale,
  Users,
  FileText,
  Calendar,
  CheckSquare,
  DollarSign,
  BarChart3,
  Briefcase,
  Settings,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: { en: string; he: string };
}

export function LawSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();

  const navItems: NavItem[] = [
    {
      href: '/dashboard/law/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: { en: 'Dashboard', he: 'לוח בקרה' },
    },
    {
      href: '/dashboard/law/cases',
      icon: <Scale className="w-5 h-5" />,
      label: { en: 'Cases', he: 'תיקים' },
    },
    {
      href: '/dashboard/law/clients',
      icon: <Users className="w-5 h-5" />,
      label: { en: 'Clients', he: 'לקוחות' },
    },
    {
      href: '/dashboard/law/documents',
      icon: <FileText className="w-5 h-5" />,
      label: { en: 'Documents', he: 'מסמכים' },
    },
    {
      href: '/dashboard/law/calendar',
      icon: <Calendar className="w-5 h-5" />,
      label: { en: 'Calendar', he: 'יומן' },
    },
    {
      href: '/dashboard/law/tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      label: { en: 'Tasks', he: 'משימות' },
    },
    {
      href: '/dashboard/law/invoices',
      icon: <DollarSign className="w-5 h-5" />,
      label: { en: 'Invoices', he: 'חשבוניות' },
    },
    {
      href: '/dashboard/law/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      label: { en: 'Reports', he: 'דוחות' },
    },
    {
      href: '/dashboard/law/team',
      icon: <Briefcase className="w-5 h-5" />,
      label: { en: 'Team', he: 'צוות' },
    },
    {
      href: '/dashboard/law/settings',
      icon: <Settings className="w-5 h-5" />,
      label: { en: 'Settings', he: 'הגדרות' },
    },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-[#0E1A2B] border-r border-gray-200 dark:border-[#2979FF]/20 min-h-screen">
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const label = item.label[language as keyof typeof item.label];

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-[#2979FF] text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <span className={isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}>
                  {item.icon}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200 dark:border-[#2979FF]/20">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>{language === 'he' ? 'Effinity - מערכת לניהול משרד עורכי דין' : 'Effinity - Law Firm Management'}</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
