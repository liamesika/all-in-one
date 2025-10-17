'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from './NotificationBell';
import { CommandPalette } from './CommandPalette';
import { UserOrgContextBar } from './UserOrgContextBar';

export type HeaderVariant = 'light' | 'dark' | 'compact';

interface PlatformHeaderProps {
  variant?: HeaderVariant;
  showOrgContext?: boolean;
  showNotifications?: boolean;
  showCommandPalette?: boolean;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

export function PlatformHeader({
  variant = 'light',
  showOrgContext = true,
  showNotifications = true,
  showCommandPalette = true,
  userName = 'User',
  userEmail = 'user@example.com',
  userAvatar,
  onLogout,
}: PlatformHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isCompact = variant === 'compact';
  const isDark = variant === 'dark';

  const headerClasses = {
    light: 'bg-white border-gray-200 text-gray-900',
    dark: 'bg-gray-900 border-gray-800 text-white',
    compact: 'bg-white border-gray-200 text-gray-900',
  };

  const linkClasses = {
    light: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    dark: 'text-gray-300 hover:text-white hover:bg-gray-800',
    compact: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would integrate with your theme system
    document.documentElement.classList.toggle('dark');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Productions', href: '/dashboard/production/dashboard' },
    { name: 'Real Estate', href: '/dashboard/real-estate/dashboard' },
    { name: 'E-commerce', href: '/dashboard/e-commerce/dashboard' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b ${headerClasses[variant]} transition-colors duration-200`}
        style={{ height: isCompact ? '56px' : '64px' }}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left: Logo + Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg ${linkClasses[variant]} transition-colors`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-3 group"
              >
                <div className="relative w-8 h-8 lg:w-10 lg:h-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg opacity-100 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg lg:text-xl">
                    E
                  </div>
                </div>
                {!isCompact && (
                  <span className={`hidden sm:block text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Effinity
                  </span>
                )}
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1 ml-8">
                {navigation.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? isDark
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-900'
                          : linkClasses[variant]
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              {!isCompact && (
                <button
                  onClick={handleThemeToggle}
                  className={`p-2 rounded-lg ${linkClasses[variant]} transition-colors`}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Command Palette Hint (Desktop only) */}
              {showCommandPalette && !isCompact && (
                <button
                  onClick={() => {
                    // Command palette opens with Cmd+K, this is just a visual hint
                    const event = new KeyboardEvent('keydown', {
                      key: 'k',
                      metaKey: true,
                      bubbles: true,
                    });
                    document.dispatchEvent(event);
                  }}
                  className={`hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm ${linkClasses[variant]} rounded-lg border ${
                    isDark ? 'border-gray-700' : 'border-gray-300'
                  } transition-colors`}
                >
                  <span className="text-gray-500">Search</span>
                  <kbd className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}>
                    ⌘K
                  </kbd>
                </button>
              )}

              {/* Notifications */}
              {showNotifications && <NotificationBell />}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 p-2 rounded-lg ${linkClasses[variant]} transition-colors`}
                  aria-label="User menu"
                >
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt={userName}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  {!isCompact && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-xl border z-50 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{userName}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{userEmail}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            router.push('/dashboard/settings');
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${linkClasses[variant]}`}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            onLogout?.();
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              <nav className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-lg text-left transition-colors ${
                        isActive
                          ? isDark
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-900'
                          : linkClasses[variant]
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Org Context Bar (below header) */}
      {showOrgContext && <UserOrgContextBar />}

      {/* Command Palette (global) */}
      {showCommandPalette && <CommandPalette />}
    </>
  );
}
