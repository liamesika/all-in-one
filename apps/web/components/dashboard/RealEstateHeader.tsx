'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLang } from '@/components/i18n/LangProvider';
import { useAuth } from '@/lib/auth-context';
import { UserMenu } from '@/components/header/UserMenu';
import { ProfileEditor } from '@/components/header/ProfileEditor';
import { logout as firebaseLogout } from '@/lib/firebase';

export function RealEstateHeader() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const { userProfile, updateProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);

  const navItems = [
    {
      label: lang === 'he' ? 'לוח מחוונים' : 'Dashboard',
      href: '/dashboard/real-estate/dashboard'
    },
    {
      label: lang === 'he' ? 'נכסים' : 'Properties',
      href: '/dashboard/real-estate/properties'
    },
    {
      label: lang === 'he' ? 'לידים' : 'Leads',
      href: '/dashboard/real-estate/leads'
    },
    {
      label: lang === 'he' ? 'קמפיינים' : 'Campaigns',
      href: '/dashboard/real-estate/campaigns'
    },
    {
      label: lang === 'he' ? 'דוחות' : 'Reports',
      href: '/dashboard/real-estate/revenue'
    },
  ];

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'he' : 'en');
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileSave = async (displayName: string, avatarUrl: string) => {
    await updateProfile(displayName, avatarUrl);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 transition-all duration-300"
        style={{
          background: '#0E1A2B',
          boxShadow: 'var(--re-shadow-lg)'
        }}
      >
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => router.push('/dashboard/real-estate/dashboard')}
            >
              <Image
                src="/logo/logo-silver.png"
                alt="EFFINITY"
                width={140}
                height={40}
                className="object-contain group-hover:opacity-90 transition-opacity duration-300"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="relative text-white/90 hover:text-white font-medium text-base transition-all duration-300 group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className="absolute inset-x-0 -bottom-1 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"
                    style={{ boxShadow: 'var(--re-shadow-glow)' }}
                  />
                </button>
              ))}
            </nav>

            {/* Right Side - Language Toggle & User Menu */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="hidden md:flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300 text-white"
                style={{ boxShadow: 'var(--re-shadow-sm)' }}
                title={lang === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
                aria-label="Toggle language"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </button>

              {/* User Menu */}
              <UserMenu
                userProfile={userProfile}
                onLogout={handleLogout}
                onOpenProfile={() => setProfileEditorOpen(true)}
              />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300"
                style={{ boxShadow: 'var(--re-shadow-sm)' }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              className="md:hidden mt-4 py-4 border-t border-white/20 space-y-2 animate-fade-in"
            >
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                >
                  {item.label}
                </button>
              ))}

              {/* Mobile Language Toggle */}
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <span>{lang === 'en' ? 'עברית' : 'English'}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Editor Modal */}
      <ProfileEditor
        isOpen={profileEditorOpen}
        onClose={() => setProfileEditorOpen(false)}
        currentProfile={userProfile}
        onSave={handleProfileSave}
      />
    </>
  );
}
export { RealEstateHeader as EcommerceHeader } from './RealEstateHeader';
