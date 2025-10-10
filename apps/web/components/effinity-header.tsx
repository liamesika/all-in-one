'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './ui';
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
        ? 'bg-white shadow-md'
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
    }`,
    dashboard: 'bg-white border-b border-gray-200',
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
          <nav className="hidden md:flex gap-8 text-sm font-normal text-gray-600">
            <a 
              href="#industries" 
              className="relative hover:text-blue-600 transition-colors duration-200 group"
            >
              Industries
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </a>
            <a 
              href="#about" 
              className="relative hover:text-blue-600 transition-colors duration-200 group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </a>
            <a 
              href="#contact" 
              className="relative hover:text-blue-600 transition-colors duration-200 group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </a>
          </nav>
        )}

        {/* Dashboard Navigation */}
        {showNavigation && variant === 'dashboard' && (
          <nav className="hidden md:flex gap-6 text-sm font-normal text-gray-600">
            <a 
              href="/dashboard" 
              className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>
            <a 
              href="/analytics" 
              className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Analytics
            </a>
            <a 
              href="/settings" 
              className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </a>
          </nav>
        )}
        
        {/* Language Toggle & Authentication Buttons */}
        {showAuth && (
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-gray-50"
              aria-label={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="text-xs font-semibold">{language === 'en' ? 'HE' : 'EN'}</span>
            </button>

            {user ? (
              // Authenticated user UI
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3 3-3-3h.01M15 8l2.5 2.5L21 7"/>
                  </svg>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full" />
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200 text-left"
                    >
                      Sign out
                    </button>
                  </div>
                  <button className="md:hidden text-sm font-normal text-gray-700 hover:text-blue-600 transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : variant === 'landing' ? (
              // Landing page login buttons
              <>
                <Button
                  href="/login"
                  variant="outline"
                  size="sm"
                  className="hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Log in
                </Button>
                <Button
                  href="/register"
                  variant="primary"
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Sign up
                </Button>
              </>
            ) : null}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && variant === 'landing' && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            <a
              href="#industries"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Industries
            </a>
            <a
              href="#about"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#contact"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>

            {/* Language Toggle (Mobile) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              aria-label={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span>{language === 'en' ? 'עברית' : 'English'}</span>
            </button>

            {!user && (
              <>
                <div className="border-t border-gray-200 my-2" />
                <Button
                  href="/login"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                >
                  Log in
                </Button>
                <Button
                  href="/register"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  Sign up
                </Button>
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