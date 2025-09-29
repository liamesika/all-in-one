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
          {/* Logo - positioned on right as requested */}
          <div className={`flex items-center ${isRTL ? 'order-3' : 'order-1'}`}>
            <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">E</span>
              </div>
            </Link>
          </div>

          {/* Main Navigation - Desktop */}
          <nav className={`hidden md:flex items-center space-x-8 ${isRTL ? 'order-1 space-x-reverse' : 'order-2'}`}>
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(`/dashboard/${item.vertical}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-white hover:bg-white/10 rounded-lg ${
                    isActive ? 'text-white bg-white/20' : 'text-white/90'
                  }`}
                >
                  {item.label}
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

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sub-navigation */}
        {subNavItems.length > 0 && (
          <div className="border-t border-white/20 py-3">
            <nav className="flex items-center space-x-6">
              {subNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-normal transition-all duration-200 hover:text-white ${
                      isActive
                        ? 'text-white border-b-2 border-white pb-1'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-black/10 backdrop-blur-sm">
          <div className="px-4 py-6 space-y-4">
            {/* Main Navigation */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname.startsWith(`/dashboard/${item.vertical}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                      isActive ? 'text-white bg-white/20' : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Sub Navigation */}
            {subNavItems.length > 0 && (
              <div className="pt-4 border-t border-white/20">
                <div className="space-y-2">
                  {subNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive ? 'text-white bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
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