'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  FileText,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart3
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  submenu?: { name: string; href: string }[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/production/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Projects',
    href: '/dashboard/production/projects',
    icon: FolderKanban,
    badge: '12'
  },
  {
    name: 'Tasks',
    href: '/dashboard/production/tasks',
    icon: CheckSquare,
    badge: '247'
  },
  {
    name: 'Clients',
    href: '/dashboard/production/company',
    icon: Users
  },
  {
    name: 'Calendar',
    href: '/dashboard/production/calendar',
    icon: Calendar
  },
  {
    name: 'Reports',
    href: '/dashboard/production/reports',
    icon: FileText
  },
  {
    name: 'Analytics',
    href: '/dashboard/production/analytics',
    icon: BarChart3
  },
  {
    name: 'Automation',
    href: '/dashboard/production/automation',
    icon: Zap
  },
  {
    name: 'Settings',
    href: '/dashboard/production/settings',
    icon: Settings
  }
];

export function ProductionsSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 flex flex-col shadow-sm"
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm">E</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Effinity</span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm mx-auto"
                aria-label="Effinity Productions"
                title="Effinity"
              >
                <span className="text-white font-semibold text-sm">E</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      group relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-orange-50 text-orange-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 w-5 h-5 flex items-center justify-center
                      ${isActive ? 'text-orange-600' : 'text-gray-500 group-hover:text-gray-700'}
                    `}>
                      <Icon size={20} />
                    </div>

                    {/* Label */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between flex-1 overflow-hidden"
                        >
                          <span className="text-sm font-medium whitespace-nowrap">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className={`
                              ml-auto px-2 py-0.5 text-xs font-semibold rounded-full
                              ${isActive
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-600'
                              }
                            `}>
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}

                    {/* Collapsed tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                        {item.name}
                        {item.badge && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20">
                            {item.badge}
                          </span>
                        )}
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Content spacer */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
    </>
  );
}
