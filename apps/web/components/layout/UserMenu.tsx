'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { signOut } from 'firebase/auth';

interface UserMenuProps {
  user: User;
  userData: { fullName?: string; defaultVertical?: string } | null;
  isRTL: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, userData, isRTL }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await signOut(auth);
        // Clear any session cookies
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/login');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const displayName = userData?.fullName || user.displayName || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* User Info - Hidden on mobile */}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-white truncate max-w-32">
            {displayName}
          </div>
          {userData?.defaultVertical && (
            <div className="text-xs text-white/70 truncate max-w-32">
              {userData.defaultVertical.toLowerCase().replace('_', '-')}
            </div>
          )}
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-white/80 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 ${
            isRTL ? 'left-0' : 'right-0'
          }`}
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-blue-600">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {userEmail}
                </p>
                {userData?.defaultVertical && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {userData.defaultVertical.toLowerCase().replace('_', '-')} vertical
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                // Could navigate to profile page
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // Could navigate to preferences
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Preferences</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;