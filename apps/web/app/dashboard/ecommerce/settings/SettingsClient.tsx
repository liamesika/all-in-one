'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings as SettingsIcon,
  ChevronRight,
  Check,
  Crown,
  CreditCard,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
} from '@/components/shared';
import { EcommerceHeader } from '@/components/dashboard/EcommerceHeader';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';
import { PricingPanel } from '@/components/pricing/PricingPanel';

interface Subscription {
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELED';
  plan: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  createdAt: string;
}

export function SettingsClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/subscriptions/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const getPlanName = (plan: string) => {
    if (plan === 'PRO') return lang === 'he' ? 'Pro' : 'Pro';
    if (plan === 'STARTER') return lang === 'he' ? 'Starter' : 'Starter';
    if (plan === 'BUSINESS') return lang === 'he' ? 'Business' : 'Business';
    return plan;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Check className="w-4 h-4" />
            {lang === 'he' ? 'פעיל' : 'Active'}
          </span>
        );
      case 'TRIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
            {lang === 'he' ? 'תקופת ניסיון' : 'Trial'}
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {lang === 'he' ? 'פג תוקף' : 'Expired'}
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      <EcommerceHeader />

      <div className="pt-24 pb-16 max-w-full mx-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] mb-4 transition-colors"
          >
            <ChevronRight className={`w-5 h-5 ${lang === 'he' ? '' : 'rotate-180'}`} />
            <span>{lang === 'he' ? 'חזרה' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="w-8 h-8 text-[#2979FF]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {lang === 'he' ? 'הגדרות ומנוי' : 'Settings & Subscription'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {lang === 'he' ? 'נהל את המנוי והתוכנית שלך' : 'Manage your subscription and plan'}
              </p>
            </div>
          </div>

          {/* Current Plan */}
          <UniversalCard variant="elevated" className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {lang === 'he' ? 'תוכנית נוכחית' : 'Current Plan'}
              </h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : subscription ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {getPlanName(subscription.plan)}
                          </h3>
                          {getStatusBadge(subscription.status)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {lang === 'he' ? 'חבילה פעילה שלך' : 'Your active package'}
                        </p>
                      </div>
                    </div>
                    {subscription.status === 'ACTIVE' && subscription.plan !== 'BUSINESS' && (
                      <UniversalButton
                        variant="primary"
                        size="md"
                        onClick={() => setShowUpgrade(true)}
                      >
                        {lang === 'he' ? 'שדרג תוכנית' : 'Upgrade Plan'}
                      </UniversalButton>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {lang === 'he' ? 'סטטוס' : 'Status'}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {subscription.status === 'ACTIVE'
                            ? lang === 'he' ? 'פעיל' : 'Active'
                            : subscription.status === 'TRIAL'
                            ? lang === 'he' ? 'תקופת ניסיון' : 'Trial Period'
                            : lang === 'he' ? 'פג תוקף' : 'Expired'}
                        </p>
                      </div>
                    </div>

                    {subscription.createdAt && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lang === 'he' ? 'תאריך הצטרפות' : 'Start Date'}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(subscription.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {subscription.trialEndsAt && subscription.status === 'TRIAL' && (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lang === 'he' ? 'תוקף הניסיון פוגע' : 'Trial Ends'}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(subscription.trialEndsAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {subscription.status === 'TRIAL' && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {lang === 'he'
                          ? 'אתה כרגע בתקופת ניסיון. שדרג כדי לקבל גישה מלאה לכל התכונות.'
                          : 'You are currently on a trial period. Upgrade to get full access to all features.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    {lang === 'he' ? 'לא נמצא מנוי פעיל' : 'No active subscription found'}
                  </p>
                  <UniversalButton
                    variant="primary"
                    size="md"
                    onClick={() => setShowUpgrade(true)}
                    className="mt-4"
                  >
                    {lang === 'he' ? 'בחר תוכנית' : 'Choose a Plan'}
                  </UniversalButton>
                </div>
              )}
            </CardBody>
          </UniversalCard>

          {/* Upgrade Section */}
          {showUpgrade && (
            <div className="mb-8">
              <PricingPanel
                vertical="ecommerce"
                lang={lang}
                onTrialStart={() => {
                  setShowUpgrade(false);
                  window.location.reload();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
