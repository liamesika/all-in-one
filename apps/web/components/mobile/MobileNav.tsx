'use client';

// apps/web/components/mobile/MobileNav.tsx - EFFINITY Mobile Bottom Navigation
// Sticky bottom navigation bar optimized for one-handed mobile use

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  PlusCircle,
  Bell,
  User,
  type LucideIcon
} from 'lucide-react';

/**
 * Navigation Item Interface
 */
export interface MobileNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number; // Notification badge count
}

/**
 * MobileNav Props
 */
export interface MobileNavProps {
  items?: MobileNavItem[];
  onItemClick?: (item: MobileNavItem) => void;
  className?: string;
}

/**
 * Default Navigation Items
 */
const DEFAULT_NAV_ITEMS: MobileNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/dashboard',
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    href: '/search',
  },
  {
    id: 'add',
    label: 'Add',
    icon: PlusCircle,
    href: '/add',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/notifications',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile',
  },
];

/**
 * MobileNav Component
 * Bottom navigation bar with 5 main items, badges, and active state highlighting
 * Following EFFINITY design system: 8pt grid, 44px minimum touch targets, brand colors
 */
export function MobileNav({
  items = DEFAULT_NAV_ITEMS,
  onItemClick,
  className = '',
}: MobileNavProps) {
  const pathname = usePathname();

  // Check if current path matches item href
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        h-16
        bg-white dark:bg-gray-900
        border-t border-gray-200 dark:border-gray-700
        flex items-center justify-around
        pb-[env(safe-area-inset-bottom)]
        shadow-lg
        ${className}
      `}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => onItemClick?.(item)}
            className="
              relative
              flex flex-col items-center justify-center
              min-w-[44px] min-h-[44px]
              px-3 py-2
              touch-manipulation
              transition-colors duration-200
              group
            "
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            {/* Icon Container */}
            <div className="relative">
              <Icon
                className={`
                  w-6 h-6
                  transition-colors duration-200
                  ${
                    active
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                  }
                `}
                strokeWidth={active ? 2.5 : 2}
              />

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className="
                    absolute -top-1 -right-1
                    min-w-[16px] h-4
                    px-1
                    flex items-center justify-center
                    text-[10px] font-semibold
                    bg-red-500 text-white
                    rounded-full
                    shadow-sm
                  "
                  aria-label={`${item.badge} notifications`}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`
                mt-1
                text-[10px] font-semibold
                leading-tight
                transition-colors duration-200
                ${
                  active
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                }
              `}
            >
              {item.label}
            </span>

            {/* Active Indicator */}
            {active && (
              <div
                className="
                  absolute bottom-0 left-1/2 transform -translate-x-1/2
                  w-8 h-0.5
                  bg-blue-700 dark:bg-blue-400
                  rounded-full
                "
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * MobileNav Spacer
 * Use this component to add bottom padding to content to prevent overlap with bottom nav
 */
export function MobileNavSpacer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-16 pb-[env(safe-area-inset-bottom)] ${className}`}
      aria-hidden="true"
    />
  );
}

export default MobileNav;
