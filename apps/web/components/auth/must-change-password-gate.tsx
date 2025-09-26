'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { ChangePasswordModal } from './change-password-modal';
import { PageLoading } from '../ui/loading-states';

interface MustChangePasswordGateProps {
  children: React.ReactNode;
}

export function MustChangePasswordGate({ children }: MustChangePasswordGateProps) {
  const { user, userProfile, loading, profileLoading, mustChangePassword, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  // Show modal when mustChangePassword is true
  useEffect(() => {
    if (!loading && !profileLoading && user && mustChangePassword) {
      setShowModal(true);
    }
  }, [loading, profileLoading, user, mustChangePassword]);

  // Handle successful password change
  const handlePasswordChangeSuccess = async () => {
    try {
      // Refresh user profile to get updated mustChangePassword status
      await refreshProfile();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to refresh profile after password change:', error);
    }
  };

  // Show loading while auth is initializing
  if (loading) {
    return <PageLoading />;
  }

  // If user not authenticated, show children (login page, etc.)
  if (!user) {
    return <>{children}</>;
  }

  // Show loading while profile is loading
  if (profileLoading) {
    return <PageLoading />;
  }

  // If mustChangePassword is true, show blocking modal
  if (mustChangePassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-9V6a3 3 0 00-3-3H7a3 3 0 00-3 3v1M12 7v10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {language === 'he' ? 'נדרש שינוי סיסמה' : 'Password Change Required'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'he'
                ? 'מטעמי אבטחה, עליך לשנות את הסיסמה שלך לפני המשך השימוש במערכת.'
                : 'For security reasons, you must change your password before continuing to use the system.'
              }
            </p>

            {/* User info */}
            {userProfile && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6 text-left">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    {language === 'he' ? 'משתמש:' : 'User:'}
                  </span>{' '}
                  {userProfile.email}
                </p>
                {userProfile.firstName && userProfile.lastName && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">
                      {language === 'he' ? 'שם:' : 'Name:'}
                    </span>{' '}
                    {userProfile.firstName} {userProfile.lastName}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === 'he' ? 'שנה סיסמה' : 'Change Password'}
            </button>
          </div>
        </div>

        <ChangePasswordModal
          isOpen={showModal}
          onClose={() => {}} // Cannot close when mustChange=true
          mustChange={true}
          onSuccess={handlePasswordChangeSuccess}
        />
      </div>
    );
  }

  // Normal flow - render children
  return <>{children}</>;
}