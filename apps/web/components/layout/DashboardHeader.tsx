'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import LanguageToggle from './LanguageToggle';
import UserMenu from './UserMenu';
import { OrganizationSwitcher } from './OrganizationSwitcher';

const DashboardHeader: React.FC = () => {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { language: lang } = useLanguage();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{ fullName?: string; defaultVertical?: string } | null>(null);

  // Fetch user data for display
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const token = await user.getIdToken();
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // Don't render header if not authenticated or still loading
  if (loading || !user) {
    return null;
  }

  // Navigation items based on user's vertical and current features
  const navigationItems = [
    { href: '/dashboard/e-commerce/dashboard', label: 'E-commerce', vertical: 'e-commerce' },
    { href: '/dashboard/real-estate/dashboard', label: 'Real Estate', vertical: 'real-estate' },
    { href: '/dashboard/law/dashboard', label: 'Law', vertical: 'law' },
    { href: '/dashboard/production/dashboard', label: 'Production', vertical: 'production' },
  ];

  // Sub-navigation for current vertical
  const getSubNavigation = () => {
    if (pathname.startsWith('/dashboard/e-commerce/')) {
      return [
        { href: '/dashboard/e-commerce/dashboard', label: 'Dashboard' },
        { href: '/dashboard/e-commerce/shopify-csv', label: 'Shopify CSV' },
        { href: '/dashboard/e-commerce/leads', label: 'Leads' },
        { href: '/dashboard/e-commerce/campaigns', label: 'Campaigns' },
        { href: '/dashboard/e-commerce/templates', label: 'Templates' },
      ];
    }
    if (pathname.startsWith('/dashboard/real-estate/')) {
      return [
        { href: '/dashboard/real-estate/dashboard', label: 'Dashboard' },
        { href: '/dashboard/real-estate/properties', label: 'Properties' },
        { href: '/dashboard/real-estate/leads', label: 'Leads' },
        { href: '/dashboard/real-estate/ai-searcher', label: 'AI Search' },
      ];
    }
    if (pathname.startsWith('/dashboard/law/')) {
      return [
        { href: '/dashboard/law/dashboard', label: 'Dashboard' },
      ];
    }
    if (pathname.startsWith('/dashboard/production/')) {
      return [
        { href: '/dashboard/production/dashboard', label: 'Dashboard' },
        { href: '/dashboard/production/projects', label: 'Projects' },
        { href: '/dashboard/production/suppliers', label: 'Suppliers' },
        { href: '/dashboard/production/team', label: 'Team' },
      ];
    }
    return [];
  };

  const subNavItems = getSubNavigation();
  const isRTL = lang === 'he';

  return (
    <header className="bg-white border-b border-gray-200 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-xl border-0 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo with hover effects */}
          <div className={`flex items-center ${isRTL ? 'order-3' : 'order-1'}`}>
            <Link href="/dashboard" className="group flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-12">
                <span className="text-blue-600 font-bold text-lg group-hover:text-blue-700 transition-colors">E</span>
              </div>
              <div className="hidden md:block">
                <div className="text-white font-semibold text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                  EFFINITY
                </div>
                <div className="text-white/70 text-xs group-hover:text-white/90 transition-colors">
                  All-in-One Platform
                </div>
              </div>
            </Link>
          </div>

          {/* Enhanced Main Navigation - Desktop */}
          <nav className={`hidden md:flex items-center space-x-2 ${isRTL ? 'order-1 space-x-reverse' : 'order-2'}`}>
            {navigationItems.map((item, index) => {
              const isActive = pathname.startsWith(`/dashboard/${item.vertical}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative px-4 py-2 text-sm font-medium rounded-lg
                    transition-all duration-300 transform
                    hover:scale-105 hover:shadow-lg hover:bg-white/15
                    ${
                      isActive
                        ? 'text-white bg-white/20 shadow-lg scale-105'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="relative z-10">{item.label}</span>
                  {/* Animated background */}
                  <div className={`
                    absolute inset-0 rounded-lg bg-white/30 opacity-0
                    group-hover:opacity-100 transition-opacity duration-300
                    transform scale-0 group-hover:scale-100
                  `} />
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Controls */}
          <div className={`flex items-center space-x-4 ${isRTL ? 'order-2 space-x-reverse' : 'order-3'}`}>
            {/* Organization Switcher */}
            <OrganizationSwitcher />

            {/* Language Toggle */}
            <LanguageToggle />

            {/* User Menu */}
            <UserMenu
              user={user}
              userData={userData}
              isRTL={isRTL}
            />

            {/* Enhanced Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden group inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:rotate-180"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              <div className="relative w-6 h-6">
                <svg
                  className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Sub-navigation */}
        {subNavItems.length > 0 && (
          <div className="border-t border-white/20 py-3 animate-slide-up">
            <nav className="flex items-center space-x-6">
              {subNavItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group relative text-sm font-normal transition-all duration-300
                      hover:text-white transform hover:-translate-y-0.5
                      ${
                        isActive
                          ? 'text-white'
                          : 'text-white/80 hover:text-white'
                      }
                    `}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {/* Animated underline */}
                    <div className={`
                      absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300
                      ${
                        isActive
                          ? 'w-full'
                          : 'w-0 group-hover:w-full'
                      }
                    `} />
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Enhanced Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-black/10 backdrop-blur-sm animate-slide-up">
          <div className="px-4 py-6 space-y-4">
            {/* Main Navigation */}
            <div className="space-y-2">
              {navigationItems.map((item, index) => {
                const isActive = pathname.startsWith(`/dashboard/${item.vertical}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group block px-3 py-2 text-base font-medium rounded-lg
                      transition-all duration-300 transform animate-fade-in
                      hover:scale-105 hover:shadow-lg hover:translate-x-2
                      ${
                        isActive
                          ? 'text-white bg-white/20 shadow-lg scale-105'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                      }
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <svg
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Sub Navigation */}
            {subNavItems.length > 0 && (
              <div className="pt-4 border-t border-white/20">
                <div className="space-y-2">
                  {subNavItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          group block px-3 py-2 text-sm rounded-lg
                          transition-all duration-300 transform animate-fade-in
                          hover:scale-105 hover:translate-x-2
                          ${
                            isActive
                              ? 'text-white bg-white/20'
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }
                        `}
                        style={{ animationDelay: `${(index + navigationItems.length) * 0.1}s` }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-white/50 rounded-full" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;