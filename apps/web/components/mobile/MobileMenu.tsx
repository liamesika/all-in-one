'use client';

// apps/web/components/mobile/MobileMenu.tsx - EFFINITY Mobile Drawer Menu
// Slide-in drawer menu with account switcher and settings

import React from 'react';
import Link from 'next/link';
import {
  X,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
  Building2,
  ChevronDown,
  type LucideIcon
} from 'lucide-react';
import { useSwipeDetection } from '@/lib/gestures';

/**
 * Menu Item Interface
 */
export interface MobileMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  divider?: boolean;
  danger?: boolean;
}

/**
 * Organization Interface (for account switcher)
 */
export interface Organization {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

/**
 * MobileMenu Props
 */
export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  currentOrganization?: Organization;
  organizations?: Organization[];
  onSwitchOrganization?: (org: Organization) => void;
  menuItems?: MobileMenuItem[];
  onLogout?: () => void;
  className?: string;
}

/**
 * Default Menu Items
 */
const DEFAULT_MENU_ITEMS: MobileMenuItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    href: '/help',
  },
  {
    id: 'divider',
    label: '',
    divider: true,
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    danger: true,
  },
];

/**
 * MobileMenu Component
 * Slide-in drawer menu from the right with smooth animations
 * Following EFFINITY design system: 8pt grid, brand colors, RTL support
 */
export function MobileMenu({
  isOpen,
  onClose,
  user,
  currentOrganization,
  organizations = [],
  onSwitchOrganization,
  menuItems = DEFAULT_MENU_ITEMS,
  onLogout,
  className = '',
}: MobileMenuProps) {
  const [showOrgSwitcher, setShowOrgSwitcher] = React.useState(false);

  // Swipe right to close
  const swipeHandlers = useSwipeDetection({
    onSwipeRight: onClose,
  });

  // Close on escape key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleItemClick = (item: MobileMenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.id === 'logout') {
      onLogout?.();
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 bottom-0
          w-[85%] max-w-sm
          bg-white dark:bg-gray-900
          shadow-2xl
          z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          ${className}
        `}
        {...swipeHandlers}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        {/* Scrollable Content */}
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
            <div className="flex items-center justify-between px-4 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <button
                onClick={onClose}
                className="
                  p-2
                  rounded-lg
                  text-gray-600 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors
                  touch-manipulation
                "
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* User Section */}
          {user && (
            <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Organization Switcher */}
          {currentOrganization && organizations.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowOrgSwitcher(!showOrgSwitcher)}
                className="
                  w-full
                  flex items-center justify-between
                  p-3 rounded-lg
                  bg-gray-50 dark:bg-gray-800
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                  touch-manipulation
                "
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="text-start">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {currentOrganization.name}
                    </p>
                    {currentOrganization.role && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {currentOrganization.role}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`
                    w-5 h-5 text-gray-600 dark:text-gray-400
                    transition-transform duration-200
                    ${showOrgSwitcher ? 'rotate-180' : ''}
                  `}
                />
              </button>

              {/* Organization List */}
              {showOrgSwitcher && (
                <div className="mt-2 space-y-1">
                  {organizations
                    .filter((org) => org.id !== currentOrganization.id)
                    .map((org) => (
                      <button
                        key={org.id}
                        onClick={() => {
                          onSwitchOrganization?.(org);
                          setShowOrgSwitcher(false);
                          onClose();
                        }}
                        className="
                          w-full
                          flex items-center gap-3
                          p-3 rounded-lg
                          text-start
                          hover:bg-gray-100 dark:hover:bg-gray-700
                          transition-colors
                          touch-manipulation
                        "
                      >
                        <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {org.name}
                          </p>
                          {org.role && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {org.role}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              // Divider
              if (item.divider) {
                return (
                  <div
                    key={item.id}
                    className="my-2 border-t border-gray-200 dark:border-gray-700"
                  />
                );
              }

              const Icon = item.icon;

              // Menu Item
              const content = (
                <>
                  {Icon && (
                    <Icon
                      className={`
                        w-5 h-5
                        ${item.danger ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}
                      `}
                    />
                  )}
                  <span
                    className={`
                      flex-1
                      text-base
                      ${
                        item.danger
                          ? 'text-red-600 font-medium'
                          : 'text-gray-900 dark:text-white'
                      }
                    `}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.href && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </>
              );

              const baseClasses = `
                flex items-center gap-3
                px-4 py-3
                hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors
                touch-manipulation
              `;

              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleItemClick(item)}
                    className={baseClasses}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`${baseClasses} w-full text-start`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
