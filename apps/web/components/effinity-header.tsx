'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { UniversalButton } from './shared';
import { Bell, Globe, Home, BarChart2, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { signOut } from '../lib/firebase';
import { useLanguage } from '../lib/language-context';

interface EffinityHeaderProps {
  variant?: 'landing' | 'dashboard' | 'auth';
  showAuth?: boolean;
  showNavigation?: boolean;
  className?: string;
}

export function EffinityHeader({
  variant = 'landing',
  showAuth = true,
  showNavigation = true,
  className = ''
}: EffinityHeaderProps) {
  const { user, loading } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      // Also clean up any localStorage data for migration
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const headerStyles = {
    landing: `sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white dark:bg-[#1A2F4B] shadow-md'
        : 'bg-white/95 dark:bg-[#1A2F4B]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700'
    }`,
    dashboard: 'bg-white dark:bg-[#1A2F4B] border-b border-gray-200 dark:border-gray-700',
    auth: 'bg-transparent'
  };

  return (
    <header className={`${headerStyles[variant]} ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Effinity Brand Logo */}
        <a href="/" className="flex items-center gap-3 group" aria-label="EFFINITY Home">
          <div className="relative h-8 w-auto flex items-center">
            <Image
              src="/logo/logo-white-bg.png"
              alt="EFFINITY Logo"
              width={120}
              height={32}
              className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
        </a>
        
        {/* Navigation - Only for landing variant */}
        {showNavigation && variant === 'landing' && (
          <nav className="hidden md:flex gap-8 text-sm font-normal text-gray-600 dark:text-gray-300">
            <a
              href="#industries"
              className="relative hover:text-[#2979FF] dark:hover:text-[#2979FF] transition-colors duration-200 group"
            >
              Industries
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2979FF] transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#about"
              className="relative hover:text-[#2979FF] dark:hover:text-[#2979FF] transition-colors duration-200 group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2979FF] transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#contact"
              className="relative hover:text-[#2979FF] dark:hover:text-[#2979FF] transition-colors duration-200 group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2979FF] transition-all duration-300 group-hover:w-full" />
            </a>
          </nav>
        )}

        {/* Dashboard Navigation */}
        {showNavigation && variant === 'dashboard' && (
          <nav className="hidden md:flex gap-6 text-sm font-normal text-gray-600 dark:text-gray-300">
            <a
              href="/dashboard"
              className="flex items-center gap-2 hover:text-[#2979FF] dark:hover:text-[#2979FF] transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </a>
            <a
              href="/analytics"
              className="flex items-center gap-2 hover:text-[#2979FF] dark:hover:text-[#2979FF] transition-colors duration-200"
            >
              <BarChart2 className="w-4 h-4" />
              Analytics
            </a>
            <a
              href="/settings"
              className="flex items-center gap-2 hover:text-[#2979FF] dark:hover:text-[#2979FF] transition-colors duration-200"
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </a>
          </nav>
        )}
        
        {/* Language Toggle & Authentication Buttons */}
        {showAuth && (
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <UniversalButton
              variant="ghost"
              size="sm"
              leftIcon={<Globe className="w-4 h-4" />}
              onClick={toggleLanguage}
              aria-label={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
            >
              <span className="text-xs font-semibold">{language === 'en' ? 'HE' : 'EN'}</span>
            </UniversalButton>

            {user ? (
              // Authenticated user UI
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <UniversalButton
                  variant="ghost"
                  size="sm"
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#2979FF] rounded-full" />
                </UniversalButton>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#2979FF] to-blue-800 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-gray-500 hover:text-[#2979FF] transition-colors duration-200 text-left"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : variant === 'landing' ? (
              // Landing page login buttons
              <>
                <UniversalButton
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                  className="hover:border-[#2979FF] hover:text-[#2979FF]"
                >
                  Log in
                </UniversalButton>
                <UniversalButton
                  variant="primary"
                  size="sm"
                  onClick={() => window.location.href = '/register'}
                  className="shadow-lg hover:shadow-xl"
                >
                  Sign up
                </UniversalButton>
              </>
            ) : null}
          </div>
        )}

        {/* Mobile Menu Button */}
        <UniversalButton
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </UniversalButton>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && variant === 'landing' && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#1A2F4B] border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            <a
              href="#industries"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#2979FF] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Industries
            </a>
            <a
              href="#about"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#2979FF] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#contact"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#2979FF] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>

            {/* Language Toggle (Mobile) */}
            <UniversalButton
              variant="ghost"
              size="sm"
              leftIcon={<Globe className="w-4 h-4" />}
              onClick={toggleLanguage}
              className="w-full justify-center"
              aria-label={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
            >
              <span>{language === 'en' ? 'עברית' : 'English'}</span>
            </UniversalButton>

            {!user && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <UniversalButton
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                  className="w-full justify-center"
                >
                  Log in
                </UniversalButton>
                <UniversalButton
                  variant="primary"
                  size="sm"
                  onClick={() => window.location.href = '/register'}
                  className="w-full justify-center"
                >
                  Sign up
                </UniversalButton>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// Export individual brand components for flexibility
export const EffinityLogo = ({ size = 'default', showText = false }: { size?: 'sm' | 'default' | 'lg', showText?: boolean }) => {
  const sizes = {
    sm: { height: 24, width: 90 },
    default: { height: 32, width: 120 },
    lg: { height: 40, width: 150 }
  };

  const heightClass = {
    sm: 'h-6',
    default: 'h-8',
    lg: 'h-10'
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className={`relative ${heightClass[size]} w-auto flex items-center`}>
        <Image
          src="/logo/logo-white-bg.png"
          alt="EFFINITY Logo"
          width={sizes[size].width}
          height={sizes[size].height}
          className={`${heightClass[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105`}
        />
      </div>
    </div>
  );
};

export default EffinityHeader;