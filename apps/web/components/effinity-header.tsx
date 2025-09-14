'use client';

import React from 'react';
import { Button } from './ui';
import { useAuth } from '../lib/auth-context';
import { signOut } from '../lib/firebase';

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
    landing: 'sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 animate-fade-in',
    dashboard: 'bg-white border-b border-gray-200',
    auth: 'bg-transparent'
  };

  return (
    <header className={`${headerStyles[variant]} ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Effinity Brand Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
            <div className="w-6 h-6 text-white">
              {/* Effinity Star Icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
          <div className="group-hover:translate-x-1 transition-transform duration-300">
            <h1 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              EFFINITY
            </h1>
            <p className="text-xs font-normal text-gray-600 leading-none">
              AI-powered efficiency
            </p>
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
        
        {/* Authentication Buttons */}
        {showAuth && (
          <div className="flex gap-3">
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
        <button className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}

// Export individual brand components for flexibility
export const EffinityLogo = ({ size = 'default', showText = true }: { size?: 'sm' | 'default' | 'lg', showText?: boolean }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-xs' },
    default: { container: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-base' },
    lg: { container: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-xl' }
  };
  
  return (
    <div className="flex items-center gap-3 group">
      <div className={`${sizes[size].container} bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1`}>
        <div className={`${sizes[size].icon} text-white`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>
      {showText && (
        <div className="group-hover:translate-x-1 transition-transform duration-300">
          <h1 className={`${sizes[size].text} font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300`}>
            EFFINITY
          </h1>
          <p className="text-xs font-normal text-gray-600 leading-none">
            AI-powered efficiency
          </p>
        </div>
      )}
    </div>
  );
};

export default EffinityHeader;