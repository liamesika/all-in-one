'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Building2,
  Bell,
  Globe,
  Link as LinkIcon,
  Save,
  Camera,
  Check,
  ChevronLeft,
  Mail,
  MessageSquare,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
} from '@/components/shared';

interface SettingsData {
  profile: {
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
  };
  organization: {
    name: string;
    language: string;
    timezone: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
}

export function SettingsPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      displayName: '',
      firstName: '',
      lastName: '',
      email: '',
      avatarUrl: '',
    },
    organization: {
      name: '',
      language: 'en',
      timezone: 'UTC',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
    },
  });

  useEffect(() => {
    // Load settings from API/localStorage
    const loadSettings = async () => {
      try {
        // TODO: Replace with actual API call
        const stored = localStorage.getItem('userSettings');
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      localStorage.setItem('userSettings', JSON.stringify(settings));
      localStorage.setItem('userProfile', JSON.stringify(settings.profile));

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: settings.profile }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatarUrl: reader.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-heading-1 text-gray-900 dark:text-white">Settings</h1>
            <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your account and preferences
            </p>
          </div>
          <UniversalButton
            variant="primary"
            size="md"
            leftIcon={loading ? undefined : <Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </UniversalButton>
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <Check className="w-5 h-5" />
            Settings saved successfully
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <UniversalCard variant="default">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-[#2979FF]" />
                  <h2 className="text-heading-3 text-gray-900 dark:text-white">Profile</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#2979FF] to-[#1565C0] flex items-center justify-center text-white text-2xl font-semibold overflow-hidden">
                      {settings.profile.avatarUrl ? (
                        <img
                          src={settings.profile.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        settings.profile.displayName?.charAt(0).toUpperCase() || 'U'
                      )}
                      <label
                        htmlFor="avatar-upload"
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload a new avatar
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        JPG, PNG or GIF • Max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={settings.profile.displayName}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, displayName: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                    placeholder="Your display name"
                  />
                </div>

                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={settings.profile.firstName}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, firstName: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={settings.profile.lastName}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, lastName: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    readOnly
                    className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Contact support to change your email address
                  </p>
                </div>
              </CardBody>
            </UniversalCard>

            {/* Organization Section */}
            <UniversalCard variant="default">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-[#2979FF]" />
                  <h2 className="text-heading-3 text-gray-900 dark:text-white">Organization</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <label
                    htmlFor="orgName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Organization Name
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    value={settings.organization.name}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        organization: { ...prev.organization, name: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="language"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Default Language
                    </label>
                    <select
                      id="language"
                      value={settings.organization.language}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          organization: { ...prev.organization, language: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                    >
                      <option value="en">English</option>
                      <option value="he">עברית (Hebrew)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="timezone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      value={settings.organization.timezone}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          organization: { ...prev.organization, timezone: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Jerusalem">Asia/Jerusalem (Israel)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>
              </CardBody>
            </UniversalCard>

            {/* Notifications Section */}
            <UniversalCard variant="default">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-[#2979FF]" />
                  <h2 className="text-heading-3 text-gray-900 dark:text-white">Notifications</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1A2F4B] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#243B5A] transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates via email
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          emailNotifications: e.target.checked,
                        },
                      }))
                    }
                    className="w-5 h-5 text-[#2979FF] border-gray-300 rounded focus:ring-2 focus:ring-[#2979FF]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1A2F4B] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#243B5A] transition-colors">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Push Notifications
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Receive browser push notifications
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          pushNotifications: e.target.checked,
                        },
                      }))
                    }
                    className="w-5 h-5 text-[#2979FF] border-gray-300 rounded focus:ring-2 focus:ring-[#2979FF]"
                  />
                </label>
              </CardBody>
            </UniversalCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Integrations Quick Links */}
            <UniversalCard variant="default">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-6 h-6 text-[#2979FF]" />
                  <h2 className="text-heading-3 text-gray-900 dark:text-white">Integrations</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                <button
                  onClick={() => router.push('/dashboard/real-estate/integrations')}
                  className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2F4B] rounded-lg transition-colors min-h-[44px]"
                >
                  Manage Integrations
                </button>
                <button
                  onClick={() => router.push('/connections')}
                  className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2F4B] rounded-lg transition-colors min-h-[44px]"
                >
                  Connected Accounts
                </button>
              </CardBody>
            </UniversalCard>

            {/* Help */}
            <UniversalCard variant="default">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-[#2979FF]" />
                  <h2 className="text-heading-3 text-gray-900 dark:text-white">Help & Support</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                <button
                  onClick={() => window.open('https://docs.effinity.co.il', '_blank')}
                  className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2F4B] rounded-lg transition-colors min-h-[44px]"
                >
                  Documentation
                </button>
                <button
                  onClick={() => router.push('/contact')}
                  className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2F4B] rounded-lg transition-colors min-h-[44px]"
                >
                  Contact Support
                </button>
              </CardBody>
            </UniversalCard>
          </div>
        </div>
      </div>
    </main>
  );
}
