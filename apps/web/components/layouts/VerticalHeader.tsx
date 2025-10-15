'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, Bell, Search, Menu } from 'lucide-react';

/**
 * VerticalHeader Component
 *
 * Page header with breadcrumbs, search, notifications, and action buttons
 * Used consistently across all vertical dashboards
 */

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface VerticalHeaderProps {
  /**
   * Page title
   */
  title?: string;

  /**
   * Breadcrumb items
   */
  breadcrumbs?: Breadcrumb[];

  /**
   * Action buttons/components to display on the right
   */
  actions?: React.ReactNode;

  /**
   * Show search bar
   */
  showSearch?: boolean;

  /**
   * Show notifications bell
   */
  showNotifications?: boolean;

  /**
   * Notification count
   */
  notificationCount?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function VerticalHeader({
  title,
  breadcrumbs,
  actions,
  showSearch = false,
  showNotifications = true,
  notificationCount = 0,
  className,
}: VerticalHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'bg-white dark:bg-[#1A2F4B]',
        'border-b border-gray-200 dark:border-[#2979FF]/20',
        'shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Left: Title & Breadcrumbs */}
        <div className="flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center space-x-2 text-sm mb-1">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900 dark:text-white font-medium">
                      {crumb.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                  )}
                </React.Fragment>
              ))}
            </nav>
          ) : null}

          {title && (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Right: Search, Notifications, Actions */}
        <div className="flex items-center gap-4 ml-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search..."
                className={cn(
                  'w-64 pl-10 pr-4 py-2',
                  'bg-gray-50 dark:bg-[#0E1A2B]',
                  'border border-gray-200 dark:border-[#2979FF]/20',
                  'rounded-lg',
                  'text-sm text-gray-900 dark:text-white',
                  'placeholder-gray-500 dark:placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent',
                  'transition-colors'
                )}
              />
            </div>
          )}

          {/* Notifications */}
          {showNotifications && (
            <button
              className={cn(
                'relative p-2 rounded-lg',
                'text-gray-500 dark:text-gray-400',
                'hover:bg-gray-100 dark:hover:bg-[#0E1A2B]',
                'hover:text-gray-700 dark:hover:text-gray-200',
                'transition-colors'
              )}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Custom Actions */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Mobile Menu Button
 * For responsive designs where sidebar needs to be toggled
 */
export interface MobileMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function MobileMenuButton({ onClick, className }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg',
        'text-gray-500 dark:text-gray-400',
        'hover:bg-gray-100 dark:hover:bg-[#0E1A2B]',
        'hover:text-gray-700 dark:hover:text-gray-200',
        'transition-colors',
        'lg:hidden',
        className
      )}
      aria-label="Toggle menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
