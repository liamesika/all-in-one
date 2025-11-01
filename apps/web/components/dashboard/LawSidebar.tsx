'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  CheckSquare,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';

export function LawSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: lang === 'he' ? 'לוח בקרה' : 'Dashboard',
      path: '/dashboard/law/dashboard',
    },
    {
      icon: Users,
      label: lang === 'he' ? 'לקוחות' : 'Clients',
      path: '/dashboard/law/clients',
    },
    {
      icon: Briefcase,
      label: lang === 'he' ? 'תיקים' : 'Cases',
      path: '/dashboard/law/cases',
    },
    {
      icon: Calendar,
      label: lang === 'he' ? 'יומן' : 'Calendar',
      path: '/dashboard/law/calendar',
    },
    {
      icon: CheckSquare,
      label: lang === 'he' ? 'משימות' : 'Tasks',
      path: '/dashboard/law/tasks',
    },
    {
      icon: DollarSign,
      label: lang === 'he' ? 'חשבוניות' : 'Billing',
      path: '/dashboard/law/billing',
    },
    {
      icon: Settings,
      label: lang === 'he' ? 'הגדרות' : 'Settings',
      path: '/dashboard/law/settings',
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-[#1e3a5f] dark:bg-[#0a1929] transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">
              {lang === 'he' ? 'משרד עורכי דין' : 'Law Office'}
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                active
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-gray-400 text-center">
            © 2025 Effinity
          </div>
        </div>
      )}
    </div>
  );
}
