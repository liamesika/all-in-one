// apps/web/app/register/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';
import { signUp } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';
import { EffinityLogo } from '@/components/effinity-header';

enum Vertical {
  REAL_ESTATE = 'REAL_ESTATE',
  LAW = 'LAW',
  E_COMMERCE = 'E_COMMERCE',
  PRODUCTION = 'PRODUCTION',
}

enum AccountType {
  FREELANCER = 'FREELANCER',
  COMPANY = 'COMPANY',
}

type FormData = {
  fullName: string;
  email: string;
  password: string;
  vertical: Vertical;
  accountType?: AccountType;
  termsConsent: boolean;
  lang: string;
};

function RegisterForm() {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const qp = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    vertical: Vertical.E_COMMERCE,
    accountType: undefined,
    termsConsent: false,
    lang: language,
  });

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const verticalOptions = [
    { 
      value: Vertical.E_COMMERCE, 
      label: language === 'he' ? 'איקומרס' : 'E-Commerce',
      description: language === 'he' ? 'חנות אונליין וניהול מוצרים' : 'Online store & product management'
    },
    { 
      value: Vertical.REAL_ESTATE, 
      label: language === 'he' ? 'נדל״ן' : 'Real Estate',
      description: language === 'he' ? 'ניהול נכסים ולידים' : 'Property & lead management'
    },
    {
      value: Vertical.LAW,
      label: language === 'he' ? 'משפטים' : 'Law',
      description: language === 'he' ? 'ניהול משרד עורכי דין' : 'Law firm management'
    },
    {
      value: Vertical.PRODUCTION,
      label: language === 'he' ? 'הפקה' : 'Production',
      description: language === 'he' ? 'ניהול אירועים והפקות לעסקים ועצמאיים' : 'Event & production management for businesses and freelancers'
    },
  ];

  const accountTypeOptions = [
    {
      value: AccountType.FREELANCER,
      label: language === 'he' ? 'עצמאי (פרטי)' : 'Freelancer (Private)',
      description: language === 'he' ? 'משתמש יחיד - ניהול פרוייקטים אישיים' : 'Single user - personal project management'
    },
    {
      value: AccountType.COMPANY,
      label: language === 'he' ? 'חברה (צוות)' : 'Company (Team)',
      description: language === 'he' ? 'מנהל-בעלים עם חברי צוות' : 'Admin-owner with team members'
    },
  ];

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (formData.fullName.trim().length < 2) {
      newErrors.fullName = language === 'he' ? 'שם מלא חייב להכיל לפחות 2 תווים' : 'Full name must be at least 2 characters';
    }

    if (formData.fullName.trim().length > 80) {
      newErrors.fullName = language === 'he' ? 'שם מלא לא יכול להיות יותר מ-80 תווים' : 'Full name cannot exceed 80 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = language === 'he' ? 'כתובת אימייל לא תקינה' : 'Please provide a valid email address';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = language === 'he' 
        ? 'סיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר'
        : 'Password must contain at least 8 characters, uppercase, lowercase and number';
    }

    if (formData.vertical === Vertical.PRODUCTION && !formData.accountType) {
      newErrors.accountType = language === 'he' ? 'חובה לבחור סוג חשבון' : 'Account type is required';
    }

    if (!formData.termsConsent) {
      newErrors.termsConsent = language === 'he' ? 'חובה לאשר את התנאים וההגבלות' : 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setServerError(null);
    setLoading(true);

    try {
      // Create Firebase user
      const userCredential = await signUp(formData.email.trim(), formData.password);
      const idToken = await userCredential.user.getIdToken();
      
      // Create session with backend and register user profile
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          lang: language,
          firebaseUid: userCredential.user.uid,
          idToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If backend registration fails, clean up Firebase user
        await userCredential.user.delete();
        
        if (response.status === 409 && data.action === 'login_or_reset') {
          setServerError(
            language === 'he' 
              ? 'חשבון עם כתובת אימייל זו כבר קיים. נסה להתחבר או לאפס סיסמה.'
              : 'An account with this email already exists. Try logging in or resetting your password.'
          );
          return;
        }
        throw new Error(data.message || 'Registration failed');
      }
      
      // Create backend session
      const sessionResponse = await fetch('/api/auth/firebase/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          idToken,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create session');
      }

      // Registration successful, redirect to dashboard
      router.push(data.redirectPath);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = language === 'he'
        ? 'הרשמה נכשלה. אנא נסה שוב.'
        : 'Registration failed. Please try again.';
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = language === 'he'
            ? 'חשבון עם כתובת אימייל זו כבר קיים.'
            : 'An account with this email already exists.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = language === 'he'
            ? 'הסיסמה חלשה מדי. בחר סיסמה חזקה יותר.'
            : 'Password is too weak. Choose a stronger password.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = language === 'he'
            ? 'כתובת האימייל לא תקינה.'
            : 'Invalid email address.';
        }
      }
      
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 ${language === 'he' ? 'rtl' : 'ltr'} relative overflow-hidden`}>
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-32 left-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-1/4 w-80 h-80 bg-blue-200 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          {/* Enhanced EFFINITY Header */}
          <header className="text-center mb-8" role="banner">
            <div className="inline-flex justify-center mb-6">
              <EffinityLogo size="lg" />
            </div>
          </header>
          
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
            {/* Language Toggle */}
            <div className="flex justify-end mb-6">
              <LanguageToggle />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold mb-3 text-gray-900">
                {language === 'he' ? 'יצירת חשבון' : 'Create Your Account'}
              </h1>
              <p className="text-sm font-normal text-gray-600 leading-relaxed">
                {language === 'he' ? 'הצטרף לאלפי עסקים המשתמשים ב-EFFINITY להצלחה' : 'Join thousands of businesses using EFFINITY to accelerate growth'}
              </p>
            </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Full Name */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">
              {language === 'he' ? 'שם מלא' : 'Full Name'} <span className="text-red-500">*</span>
            </span>
            <input
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-normal text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 shadow-sm focus:shadow-md"
              placeholder={language === 'he' ? 'הכנס שם מלא' : 'Enter your full name'}
              value={formData.fullName}
              onChange={e => updateField('fullName', e.target.value)}
              dir={language === 'he' ? 'rtl' : 'ltr'}
            />
            {errors.fullName && <div className="text-xs font-normal text-red-600 mt-1">{errors.fullName}</div>}
          </label>

          {/* Email */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">
              {language === 'he' ? 'אימייל' : 'Email'} <span className="text-red-500">*</span>
            </span>
            <input
              type="email"
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-normal text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 shadow-sm focus:shadow-md"
              placeholder="you@example.com"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
            />
            {errors.email && <div className="text-xs font-normal text-red-600 mt-1">{errors.email}</div>}
          </label>

          {/* Password */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">
              {language === 'he' ? 'סיסמה' : 'Password'} <span className="text-red-500">*</span>
            </span>
            <input
              type="password"
              className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-normal text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 shadow-sm focus:shadow-md"
              placeholder={language === 'he' ? 'בחר סיסמה חזקה' : 'Choose a strong password'}
              value={formData.password}
              onChange={e => updateField('password', e.target.value)}
            />
            {errors.password && <div className="text-xs font-normal text-red-600 mt-1">{errors.password}</div>}
          </label>

          {/* Vertical Selection */}
          <div className="space-y-3">
            <span className="block text-sm font-semibold text-gray-700 mb-3">
              {language === 'he' ? 'בחר את התחום שלך' : 'Choose your industry'} <span className="text-red-500">*</span>
            </span>
            <div className="space-y-2">
              {verticalOptions.map((option) => (
                <label key={option.value} className="block">
                  <div className={`rounded-xl border transition-all duration-300 cursor-pointer p-5 transform hover:-translate-y-1 ${
                    formData.vertical === option.value
                      ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm hover:shadow-md'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="vertical"
                        value={option.value}
                        checked={formData.vertical === option.value}
                        onChange={e => {
                          const newVertical = e.target.value as Vertical;
                          updateField('vertical', newVertical);
                          // Reset account type when changing vertical
                          if (newVertical !== Vertical.PRODUCTION) {
                            updateField('accountType', undefined);
                          }
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-base font-semibold text-gray-900 mb-1">{option.label}</div>
                        <div className="text-sm font-normal text-gray-600">{option.description}</div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Account Type Selection - Only for Production */}
          {formData.vertical === Vertical.PRODUCTION && (
            <div className="space-y-3">
              <span className="block text-sm font-semibold text-gray-700 mb-3">
                {language === 'he' ? 'בחר סוג חשבון' : 'Choose account type'} <span className="text-red-500">*</span>
              </span>
              <div className="space-y-2">
                {accountTypeOptions.map((option) => (
                  <label key={option.value} className="block">
                    <div className={`rounded-xl border transition-all duration-300 cursor-pointer p-5 transform hover:-translate-y-1 ${
                      formData.accountType === option.value
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50 shadow-sm hover:shadow-md'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="accountType"
                          value={option.value}
                          checked={formData.accountType === option.value}
                          onChange={e => updateField('accountType', e.target.value as AccountType)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <div className="text-base font-semibold text-gray-900 mb-1">{option.label}</div>
                          <div className="text-sm font-normal text-gray-600">{option.description}</div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.accountType && <div className="text-xs font-normal text-red-600 mt-1">{errors.accountType}</div>}
            </div>
          )}

          {/* Terms & Conditions */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.termsConsent}
              onChange={e => updateField('termsConsent', e.target.checked)}
              className="mt-0.5 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-normal text-gray-700">
              {language === 'he' 
                ? 'אני מסכים לתנאי השימוש ומדיניות הפרטיות'
                : 'I agree to the Terms of Service and Privacy Policy'} <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.termsConsent && <div className="text-xs font-normal text-red-600">{errors.termsConsent}</div>}

          {/* Server Error */}
          {serverError && (
            <div className="text-sm font-normal text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
              {serverError}
            </div>
          )}

          {/* Enhanced Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold shadow-lg hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700 transform hover:-translate-y-1 disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{language === 'he' ? 'מרשם...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>{language === 'he' ? 'צור חשבון' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>
        
        {/* Enhanced Sign In Link */}
        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs font-normal">
              <span className="px-4 bg-white text-gray-500">
                {language === 'he' ? 'או' : 'or'}
              </span>
            </div>
          </div>
          <p className="text-sm font-normal text-gray-600 mt-6">
            {language === 'he' ? 'כבר יש לך חשבון? ' : 'Already have an account? '}
            <a
              className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:underline hover:underline-offset-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
              href="/login"
            >
              {language === 'he' ? 'התחבר כאן' : 'Sign in here'}
            </a>
          </p>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center gap-6 text-xs font-normal text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{language === 'he' ? 'אבטחה מתקדמת' : 'Enterprise Security'}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{language === 'he' ? 'התחלה חינם' : 'Free Trial'}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    </main>
  );
}

export default function Page() {
  return (
    <LanguageProvider>
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </LanguageProvider>
  );
}
