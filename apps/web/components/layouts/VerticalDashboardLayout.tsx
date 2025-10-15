'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { VerticalSidebar } from './VerticalSidebar';
import { VerticalHeader } from './VerticalHeader';

/**
 * VerticalDashboardLayout
 *
 * Main layout component for all vertical dashboards (Real Estate, E-Commerce, Productions, Law)
 * Provides consistent structure with sidebar navigation and header
 */

export interface VerticalDashboardLayoutProps {
  /**
   * Current vertical (real-estate, e-commerce, productions, law)
   */
  vertical: 'real-estate' | 'e-commerce' | 'productions' | 'law';

  /**
   * Page title
   */
  title?: string;

  /**
   * Breadcrumb items
   */
  breadcrumbs?: Array<{ label: string; href?: string }>;

  /**
   * Actions to display in header (buttons, etc.)
   */
  headerActions?: React.ReactNode;

  /**
   * Page content
   */
  children: React.ReactNode;

  /**
   * Whether sidebar is collapsible
   */
  collapsibleSidebar?: boolean;

  /**
   * Additional CSS classes for main content area
   */
  className?: string;
}

export function VerticalDashboardLayout({
  vertical,
  title,
  breadcrumbs,
  headerActions,
  children,
  collapsibleSidebar = true,
  className,
}: VerticalDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      {/* Sidebar */}
      <VerticalSidebar
        vertical={vertical}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        collapsible={collapsibleSidebar}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Header */}
        <VerticalHeader
          title={title}
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />

        {/* Page Content */}
        <main className={cn('p-6 lg:p-8', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Simple container for pages that don't need sidebar/header
 */
export interface SimpleLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SimpleLayout({ children, className }: SimpleLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-[#0E1A2B]', className)}>
      {children}
    </div>
  );
}
