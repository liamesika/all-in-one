'use client';

import { Suspense, useState, useId } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';
import { signIn, getIdToken } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';
import { EffinityLogo } from '@/components/effinity-header';


function LoginForm() {
  const qp = useSearchParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formId = useId();
  const statusId = useId();

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = language === 'he' ? 'כתובת אימייל לא תקינה' : 'Please provide a valid email address';
    }

    if (password.trim().length === 0) {
      newErrors.password = language === 'he' ? 'סיסמה נדרשת' : 'Password is required';
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
      console.log('🔐 [LOGIN] Starting Firebase sign-in...');

      // Sign in with Firebase - onAuthStateChanged will handle state updates
      await signIn(email.trim(), password.trim());
      console.log('✅ [LOGIN] Firebase sign-in successful');

      // Get the next parameter to redirect to the intended page
      const nextUrl = qp.get('next');
      if (nextUrl) {
        console.log(`🔀 [LOGIN] Redirecting to next URL: ${nextUrl}`);
        router.push(nextUrl);
        return;
      }

      // Get Firebase ID token
      console.log('🔑 [LOGIN] Getting Firebase ID token...');
      const token = await getIdToken();

      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Create backend session
      console.log('📡 [LOGIN] Creating backend session...');
      const sessionResponse = await fetch('/api/auth/firebase/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken: token }),
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        console.error('❌ [LOGIN] Session creation failed:', errorData);
        throw new Error('Failed to create session');
      }
      console.log('✅ [LOGIN] Backend session created');

      // Fetch user profile from backend to get vertical
      console.log('📡 [LOGIN] Fetching user profile from backend...');
      const profileResponse = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      let redirectPath = '/dashboard/e-commerce/dashboard'; // Default fallback

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('📊 [LOGIN] User profile:', profile);

        const vertical = profile.defaultVertical;
        console.log('🎯 [LOGIN] Vertical from profile:', vertical);

        // Map vertical to dashboard path
        const verticalPaths: Record<string, string> = {
          'REAL_ESTATE': '/dashboard/real-estate/dashboard',
          'E_COMMERCE': '/dashboard/e-commerce/dashboard',
          'LAW': '/dashboard/law/dashboard',
          'PRODUCTION': '/dashboard/production/dashboard',
        };

        redirectPath = vertical
          ? (verticalPaths[vertical] || '/dashboard/e-commerce/dashboard')
          : '/dashboard/e-commerce/dashboard';
      } else {
        console.warn('⚠️ [LOGIN] Failed to fetch user profile, using default dashboard');
      }

      console.log(`✅ [LOGIN] Redirecting to: ${redirectPath}`);
      router.push(redirectPath);
    } catch (error: any) {
      console.error('❌ [LOGIN] Error:', error);
      
      let errorMessage = language === 'he'
        ? 'התחברות נכשלה. אנא נסה שוב.'
        : 'Login failed. Please try again.';
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = language === 'he'
            ? 'פרטי הכניסה שגויים. אנא בדוק את האימייל והסיסמה.'
            : 'Invalid credentials. Please check your email and password.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = language === 'he'
            ? 'יותר מדי ניסיונות כניסה. נסה שוב מאוחר יותר.'
            : 'Too many failed attempts. Please try again later.';
        }
      }
      
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50/30 ${language === 'he' ? 'rtl' : 'ltr'} relative overflow-hidden`}>
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-32 left-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-1/4 w-80 h-80 bg-blue-300 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Enhanced EFFINITY Header */}
          <header className="text-center mb-12" role="banner">
            <div className="inline-flex justify-center mb-8">
              <EffinityLogo size="lg" />
            </div>
          </header>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
          {/* Language Toggle */}
          <div className="flex justify-end mb-6">
            <LanguageToggle />
          </div>

          <div className="text-center mb-8">
            <h2 id={`${formId}-title`} className="text-2xl font-semibold text-gray-900 mb-3">
              {language === 'he' ? 'כניסה לחשבון' : 'Welcome Back'}
            </h2>
            <p className="text-sm font-normal text-gray-600 leading-relaxed">
              {language === 'he' ? 'הכנס את פרטי הכניסה שלך לגישה לחשבונך' : 'Enter your credentials to access your personalized dashboard'}
            </p>
          </div>

          {/* Status announcements for screen readers */}
          <div 
            id={statusId}
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            {loading && (language === 'he' ? 'מתחבר...' : 'Signing in...')}
            {Object.keys(errors).length > 0 && (
              language === 'he' 
                ? `נמצאו ${Object.keys(errors).length} שגיאות בטופס`
                : `Found ${Object.keys(errors).length} errors in the form`
            )}
          </div>

          <form 
            onSubmit={onSubmit} 
            className="space-y-6"
            role="form"
            aria-labelledby={`${formId}-title`}
            aria-describedby={loading ? statusId : undefined}
            noValidate
          >
            {/* Email */}
            <div>
              <label 
                htmlFor={`${formId}-email`}
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {language === 'he' ? 'אימייל' : 'Email Address'}
                <span className="text-red-500 ml-1" aria-label={language === 'he' ? 'שדה חובה' : 'required field'}>*</span>
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                className={`
                  w-full rounded-lg border bg-white px-3 py-2 text-sm font-normal text-gray-900 
                  transition-all focus-visible:outline-none focus-visible:ring-2 
                  focus-visible:ring-blue-500 focus-visible:ring-offset-2
                  hover:border-gray-400 min-h-11
                  ${
                    errors.email 
                      ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }
                `}
                placeholder={language === 'he' ? 'example@domain.com' : 'example@domain.com'}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
              />
              {errors.email && (
                <div 
                  id={`${formId}-email-error`}
                  className="flex items-center gap-1 text-xs font-normal text-red-600 mt-1"
                  role="alert"
                  aria-live="polite"
                >
                  <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor={`${formId}-password`}
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {language === 'he' ? 'סיסמה' : 'Password'}
                <span className="text-red-500 ml-1" aria-label={language === 'he' ? 'שדה חובה' : 'required field'}>*</span>
              </label>
              <input
                id={`${formId}-password`}
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? `${formId}-password-error` : undefined}
                className={`
                  w-full rounded-lg border bg-white px-3 py-2 text-sm font-normal text-gray-900 
                  transition-all focus-visible:outline-none focus-visible:ring-2 
                  focus-visible:ring-blue-500 focus-visible:ring-offset-2
                  hover:border-gray-400 min-h-11
                  ${
                    errors.password 
                      ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }
                `}
                placeholder={language === 'he' ? 'הכנס את הסיסמה שלך' : 'Enter your password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
              />
              {errors.password && (
                <div 
                  id={`${formId}-password-error`}
                  className="flex items-center gap-1 text-xs font-normal text-red-600 mt-1"
                  role="alert"
                  aria-live="polite"
                >
                  <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div 
                className="text-sm font-normal text-red-700 bg-red-50 border border-red-200 rounded-lg p-4"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{serverError}</span>
                </div>
              </div>
            )}

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={loading}
              aria-describedby={loading ? statusId : undefined}
              className="
                w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 
                text-white py-4 text-sm font-semibold transition-all duration-300 
                shadow-lg hover:shadow-2xl hover:from-blue-700 hover:to-blue-800
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white 
                focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700
                disabled:opacity-60 disabled:cursor-not-allowed 
                disabled:hover:from-blue-600 disabled:hover:to-blue-700
                transform hover:-translate-y-1 disabled:transform-none
                min-h-12 flex items-center justify-center gap-2
              "
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>
                {loading 
                  ? (language === 'he' ? 'מתחבר...' : 'Logging in...') 
                  : (language === 'he' ? 'התחבר' : 'Sign In')
                }
              </span>
            </button>
          </form>

          {/* Enhanced Sign up Link */}
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
            <p className="mt-6 text-sm font-normal text-gray-600">
              {language === 'he' ? 'אין לך חשבון? ' : "Don't have an account? "}
              <a
                className="
                  text-blue-600 hover:text-blue-700 font-semibold 
                  transition-all duration-200 hover:underline hover:underline-offset-4
                  focus-visible:outline-none focus-visible:ring-2 
                  focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm
                "
                href="/register"
                aria-label={language === 'he' ? 'הירשם לחשבון חדש' : 'Sign up for a new account'}
              >
                {language === 'he' ? 'הירשם כאן' : 'Create an account'}
              </a>
            </p>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex justify-center items-center gap-6 text-xs font-normal text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{language === 'he' ? 'אבטחה מתקדמת' : 'Bank-level Security'}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{language === 'he' ? 'תמיכה 24/7' : '24/7 Support'}</span>
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
        <LoginForm />
      </Suspense>
    </LanguageProvider>
  );
}
