'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  Building2,
  Calendar,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  key: string;
  icon: React.ElementType;
  label: { en: string; he: string };
  path: string;
  badge?: number;
}

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      key: 'overview',
      icon: LayoutDashboard,
      label: { en: 'Overview', he: 'סקירה כללית' },
      path: '/dashboard/real-estate/management'
    },
    {
      key: 'leads',
      icon: Users,
      label: { en: 'Leads', he: 'לידים' },
      path: '/dashboard/real-estate/management/leads'
    },
    {
      key: 'clients',
      icon: UserCheck,
      label: { en: 'Clients', he: 'לקוחות' },
      path: '/dashboard/real-estate/management/clients'
    },
    {
      key: 'employees',
      icon: Briefcase,
      label: { en: 'Agents & Employees', he: 'סוכנים ועובדים' },
      path: '/dashboard/real-estate/management/employees'
    },
    {
      key: 'tasks',
      icon: LayoutDashboard,
      label: { en: 'Tasks & Pipelines', he: 'משימות וצינורות' },
      path: '/dashboard/real-estate/management/tasks'
    },
    {
      key: 'properties',
      icon: Building2,
      label: { en: 'Properties', he: 'נכסים' },
      path: '/dashboard/real-estate/management/properties'
    },
    {
      key: 'calendar',
      icon: Calendar,
      label: { en: 'Calendar & Meetings', he: 'יומן ופגישות' },
      path: '/dashboard/real-estate/management/calendar'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard/real-estate/management') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0E1A2B]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white dark:bg-[#1A2F4B]
          border-r border-gray-200 dark:border-[#2979FF]/20
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-[#2979FF]/20">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'he' ? 'ניהול' : 'Management'}
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-150
                  ${active
                    ? 'bg-[#2979FF]/10 text-[#2979FF] dark:bg-[#2979FF]/20 dark:text-[#2979FF] font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${language === 'he' ? 'flex-row-reverse' : ''}
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#2979FF]' : ''}`} />
                <span className="flex-1 text-left truncate" dir={language === 'he' ? 'rtl' : 'ltr'}>
                  {item.label[language as keyof typeof item.label]}
                </span>
                {active && (
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${language === 'he' ? 'rotate-180' : ''}`} />
                )}
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#2979FF]/20">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {language === 'he' ? 'מרכז ניהול משולב' : 'Unified Management Center'}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Menu Button */}
        <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-[#1A2F4B] border-b border-gray-200 dark:border-[#2979FF]/20 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">
              {language === 'he' ? 'תפריט' : 'Menu'}
            </span>
          </button>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
