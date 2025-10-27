'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Settings, LogOut, Camera } from 'lucide-react';

interface UserMenuProps {
  userProfile: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
    displayName?: string;
  } | null;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export function UserMenu({ userProfile, onLogout, onOpenProfile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const displayName = userProfile?.displayName || userProfile?.firstName || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }

      if (event.key === 'Tab' && menuRef.current) {
        const focusableElements = menuRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Focus first menu item when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstButton = menuRef.current.querySelector('button');
      firstButton?.focus();
    }
  }, [isOpen]);

  const handleProfile = () => {
    setIsOpen(false);
    onOpenProfile();
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push('/dashboard/settings');
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 sm:px-4 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm cursor-pointer transition-all duration-300 group min-h-[44px] min-w-[44px]"
        style={{ boxShadow: 'var(--re-shadow-sm)' }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <span className="hidden sm:block text-white font-medium">
          {displayName}
        </span>
        <div
          className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden"
          style={{ boxShadow: 'var(--re-shadow-md)' }}
        >
          {userProfile?.avatarUrl ? (
            <Image
              src={userProfile.avatarUrl}
              alt={displayName}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg overflow-hidden z-50"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }}
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200" style={{ background: '#F9FAFB' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                {userProfile?.avatarUrl ? (
                  <Image
                    src={userProfile.avatarUrl}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                {userProfile?.email && (
                  <p className="text-sm text-gray-500 truncate">{userProfile.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfile}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150 min-h-[44px]"
              role="menuitem"
            >
              <User size={18} className="text-gray-500" />
              <span className="font-medium">Profile</span>
            </button>

            <button
              onClick={handleSettings}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150 min-h-[44px]"
              role="menuitem"
            >
              <Settings size={18} className="text-gray-500" />
              <span className="font-medium">Settings</span>
            </button>

            <div className="border-t border-gray-200 my-2" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-150 min-h-[44px]"
              role="menuitem"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
