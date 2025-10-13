'use client';

import { useState } from 'react';

interface NavigationTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface DashboardNavigationProps {
  tabs?: NavigationTab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

const defaultTabs: NavigationTab[] = [
  { id: 'all', label: 'All Data' },
  { id: 'leads', label: 'Leads Stream' },
  { id: 'listings', label: 'Listings Overview' },
  { id: 'deals', label: 'Deals Summary' },
  { id: 'operations', label: 'Operations View' },
];

export function DashboardNavigation({
  tabs = defaultTabs,
  defaultTab = 'all',
  onTabChange,
}: DashboardNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="mb-8">
      <div
        className="rounded-xl p-2 border border-gray-800 inline-flex gap-2"
        style={{ background: '#1A2F4B' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 relative overflow-hidden group"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #2979FF 0%, #1d4ed8 100%)'
                  : 'transparent',
                color: isActive ? '#FFFFFF' : '#9EA7B3',
                boxShadow: isActive
                  ? '0 0 20px rgba(41, 121, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                  : 'none',
              }}
            >
              {/* Hover glow effect */}
              {!isActive && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'rgba(41, 121, 255, 0.1)',
                  }}
                />
              )}

              {/* Tab content */}
              <div className="relative flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>

              {/* Active indicator line */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
