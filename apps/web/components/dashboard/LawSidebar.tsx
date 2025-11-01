'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  CheckSquare,
  DollarSign,
  Settings,
} from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';

export function LawSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();

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
      className="group fixed left-0 top-0 h-full bg-[#0e1a2b] w-[72px] hover:w-60 rounded-r-[24px] transition-all duration-300 ease-in-out z-40 flex flex-col overflow-hidden shadow-[4px_0_20px_rgba(0,0,0,0.3)]"
    >
      {/* Logo/Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-[#0e1a2b]" />
          </div>
          <span className="text-white font-semibold text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {lang === 'he' ? 'משרד עורכי דין' : 'Law Office'}
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center justify-start h-[50px] px-3 rounded-xl font-medium overflow-hidden transition-all duration-300 ease-in-out ${
                  active
                    ? 'bg-amber-500 text-[#0e1a2b]'
                    : 'text-[#6b7280] hover:bg-[#1e3a5f20] hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="text-xs text-gray-400 text-center whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          © 2025 Effinity
        </div>
      </div>
    </div>
  );
}
