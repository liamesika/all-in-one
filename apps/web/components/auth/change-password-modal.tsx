'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { userApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../ui/loading-states';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  mustChange?: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  mustChange = false,
  onSuccess
}: ChangePasswordModalProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(language === 'he' ? 'הסיסמאות אינן תואמות' : 'Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error(language === 'he' ? 'הסיסמה חייבת להכיל לפחות 8 תווים' : 'Password must be at least 8 characters');
      return;
    }

    if (!mustChange && !formData.currentPassword) {
      toast.error(language === 'he' ? 'נא להזין את הסיסמה הנוכחית' : 'Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      await userApi.changePassword(formData.currentPassword, formData.newPassword);
      toast.success(language === 'he' ? 'הסיסמה שונתה בהצלחה' : 'Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Password change failed:', error);
      const message = error.message || (language === 'he' ? 'שגיאה בשינוי הסיסמה' : 'Failed to change password');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {language === 'he' ? 'שינוי סיסמה' : 'Change Password'}
            </h3>
            {mustChange && (
              <p className="text-sm text-amber-600 mt-1">
                {language === 'he' ? 'חובה לשנות את הסיסמה לפני המשך השימוש במערכת' : 'You must change your password to continue using the system'}
              </p>
            )}
          </div>
          {!mustChange && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!mustChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'he' ? 'סיסמה נוכחית' : 'Current Password'}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required={!mustChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill={showPasswords.current ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'he' ? 'סיסמה חדשה' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
                disabled={loading}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill={showPasswords.new ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'he' ? 'לפחות 8 תווים' : 'At least 8 characters'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'he' ? 'אימות סיסמה חדשה' : 'Confirm New Password'}
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill={showPasswords.confirm ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!mustChange && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                {language === 'he' ? 'ביטול' : 'Cancel'}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                language === 'he' ? 'שמור סיסמה' : 'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}