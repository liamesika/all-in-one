'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Building2,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Film,
  Scale,
  BarChart3,
  Folder,
  Calendar,
  DollarSign,
} from 'lucide-react';

/**
 * VerticalSidebar Component
 *
 * Collapsible sidebar navigation for vertical dashboards
 * Dynamically shows navigation items based on the current vertical
 */

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface VerticalConfig {
  name: string;
  icon: React.ReactNode;
  color: string;
  navItems: NavItem[];
}

const verticalConfigs: Record<string, VerticalConfig> = {
  'real-estate': {
    name: 'Real Estate',
    icon: <Building2 className="w-5 h-5" />,
    color: '#2979FF',
    navItems: [
      { label: 'Dashboard', href: '/real-estate/dashboard', icon: <Home className="w-5 h-5" /> },
      { label: 'Properties', href: '/real-estate/properties', icon: <Building2 className="w-5 h-5" /> },
      { label: 'Leads', href: '/real-estate/leads', icon: <Users className="w-5 h-5" /> },
      { label: 'Reports', href: '/real-estate/reports', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Settings', href: '/real-estate/settings', icon: <Settings className="w-5 h-5" /> },
    ],
  },
  'e-commerce': {
    name: 'E-Commerce',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: '#10B981',
    navItems: [
      { label: 'Dashboard', href: '/dashboard/ecommerce', icon: <Home className="w-5 h-5" /> },
      { label: 'Leads', href: '/dashboard/e-commerce/leads', icon: <Users className="w-5 h-5" /> },
      { label: 'Campaigns', href: '/dashboard/e-commerce/campaigns', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Settings', href: '/dashboard/e-commerce/settings', icon: <Settings className="w-5 h-5" /> },
    ],
  },
  'productions': {
    name: 'Productions',
    icon: <Film className="w-5 h-5" />,
    color: '#8B5CF6',
    navItems: [
      { label: 'Dashboard', href: '/productions/dashboard', icon: <Home className="w-5 h-5" /> },
      { label: 'Projects', href: '/productions/projects', icon: <Folder className="w-5 h-5" /> },
      { label: 'Clients', href: '/productions/clients', icon: <Users className="w-5 h-5" /> },
      { label: 'Suppliers', href: '/productions/suppliers', icon: <Building2 className="w-5 h-5" /> },
      { label: 'Team', href: '/productions/team', icon: <Users className="w-5 h-5" /> },
      { label: 'Calendar', href: '/productions/calendar', icon: <Calendar className="w-5 h-5" /> },
      { label: 'Budget', href: '/productions/budget', icon: <DollarSign className="w-5 h-5" /> },
      { label: 'Reports', href: '/productions/reports', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Company', href: '/productions/company', icon: <Settings className="w-5 h-5" /> },
    ],
  },
  'law': {
    name: 'Law',
    icon: <Scale className="w-5 h-5" />,
    color: '#F59E0B',
    navItems: [
      { label: 'Dashboard', href: '/law/dashboard', icon: <Home className="w-5 h-5" /> },
      { label: 'Cases', href: '/law/cases', icon: <FileText className="w-5 h-5" /> },
      { label: 'Clients', href: '/law/clients', icon: <Users className="w-5 h-5" /> },
      { label: 'Settings', href: '/law/settings', icon: <Settings className="w-5 h-5" /> },
    ],
  },
};

export interface VerticalSidebarProps {
  vertical: 'real-estate' | 'e-commerce' | 'productions' | 'law';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  collapsible?: boolean;
}

export function VerticalSidebar({
  vertical,
  collapsed = false,
  onToggleCollapse,
  collapsible = true,
}: VerticalSidebarProps) {
  const pathname = usePathname();
  const config = verticalConfigs[vertical];

  if (!config) {
    console.warn(`Unknown vertical: ${vertical}`);
    return null;
  }

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen',
        'bg-white dark:bg-[#1A2F4B]',
        'border-r border-gray-200 dark:border-[#2979FF]/20',
        'transition-all duration-300 ease-in-out',
        'z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-[#2979FF]/20">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <div style={{ color: config.color }}>
                {config.icon}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {config.name}
              </h2>
            </div>
          </div>
        )}

        {collapsed && (
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg mx-auto"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <div style={{ color: config.color }}>
              {config.icon}
            </div>
          </div>
        )}

        {collapsible && !collapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#0E1A2B] transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {config.navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'text-sm font-medium transition-all duration-200',
                'group relative',
                isActive
                  ? 'bg-[#2979FF] text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0E1A2B]'
              )}
            >
              <span className={cn(
                'flex-shrink-0',
                isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
              )}>
                {item.icon}
              </span>

              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-semibold rounded-full',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#2979FF]/10 text-[#2979FF]'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900 dark:border-r-white" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Button (Bottom) */}
      {collapsible && collapsed && (
        <div className="p-3 border-t border-gray-200 dark:border-[#2979FF]/20">
          <button
            onClick={onToggleCollapse}
            className="w-full p-2.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#0E1A2B] transition-colors flex items-center justify-center"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
}
