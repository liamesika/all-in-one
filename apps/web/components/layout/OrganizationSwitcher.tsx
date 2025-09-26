'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useOrganization } from '@/lib/organization-context';
import { useLanguage } from '@/lib/language-context';
import { LoadingSpinner } from '../ui/loading-states';
import { toast } from 'react-hot-toast';

export function OrganizationSwitcher() {
  const { activeOrg, memberships, switchOrg, loading } = useOrganization();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === activeOrg?.id || switching) return;

    setSwitching(orgId);
    try {
      await switchOrg(orgId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch organization:', error);
      toast.error(language === 'he' ? 'שגיאה בהחלפת הארגון' : 'Failed to switch organization');
    } finally {
      setSwitching(null);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return language === 'he' ? 'בעלים' : 'Owner';
      case 'ADMIN':
        return language === 'he' ? 'מנהל' : 'Admin';
      case 'MANAGER':
        return language === 'he' ? 'מנהל פרוייקטים' : 'Manager';
      case 'MEMBER':
        return language === 'he' ? 'חבר' : 'Member';
      case 'VIEWER':
        return language === 'he' ? 'צופה' : 'Viewer';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'MEMBER':
        return 'bg-green-100 text-green-800';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !activeOrg) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-white/90">
          {language === 'he' ? 'טוען...' : 'Loading...'}
        </span>
      </div>
    );
  }

  // If only one organization, show read-only display
  if (memberships.length <= 1) {
    const currentMembership = memberships.find(m => m.orgId === activeOrg.id);
    return (
      <div className="flex items-center space-x-3 px-3 py-2 bg-white/10 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {activeOrg.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm truncate max-w-32">
              {activeOrg.name}
            </span>
            {currentMembership && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(currentMembership.role)}`}>
                {getRoleLabel(currentMembership.role)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentMembership = memberships.find(m => m.orgId === activeOrg.id);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
        disabled={switching !== null}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {activeOrg.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm truncate max-w-32">
              {activeOrg.name}
            </span>
            {currentMembership && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(currentMembership.role)}`}>
                {getRoleLabel(currentMembership.role)}
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">
              {language === 'he' ? 'החלף ארגון' : 'Switch Organization'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'he' ? 'בחר ארגון לעבוד איתו' : 'Select an organization to work with'}
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {memberships.map((membership) => {
              const isActive = membership.orgId === activeOrg.id;
              const isSwitching = switching === membership.orgId;

              return (
                <button
                  key={membership.orgId}
                  onClick={() => handleSwitchOrg(membership.orgId)}
                  disabled={isActive || isSwitching}
                  className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                    isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  } ${isSwitching ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-700 font-medium">
                        {membership.organization.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 truncate">
                          {membership.organization.name}
                        </span>
                        {isActive && (
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(membership.role)}`}>
                          {getRoleLabel(membership.role)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {membership.organization.usedSeats} / {membership.organization.seatLimit}
                          {language === 'he' ? ' משתמשים' : ' users'}
                        </span>
                      </div>
                    </div>
                    {isSwitching && (
                      <LoadingSpinner size="sm" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Organization management link */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/org/admin';
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {language === 'he' ? 'ניהול ארגון' : 'Organization Settings'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}