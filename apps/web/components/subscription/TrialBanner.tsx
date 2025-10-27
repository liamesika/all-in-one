'use client';

import { AlertTriangle, X, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { UniversalButton } from '@/components/shared';

interface TrialBannerProps {
  status: 'active' | 'expiring' | 'expired';
  daysRemaining?: number;
  lang: 'en' | 'he';
  onUpgrade?: () => void;
}

export function TrialBanner({ status, daysRemaining, lang, onUpgrade }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Don't show for active trials with >7 days
  if (status === 'active' && daysRemaining && daysRemaining > 7) {
    return null;
  }

  const bannerConfig = {
    expiring: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-900 dark:text-yellow-100',
      message: lang === 'he'
        ? `תקופת הניסיון שלך מסתיימת בעוד ${daysRemaining} ימים`
        : `Your trial ends in ${daysRemaining} days`,
      cta: lang === 'he' ? 'שדרג עכשיו' : 'Upgrade Now',
    },
    expired: {
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-900 dark:text-red-100',
      message: lang === 'he'
        ? 'תקופת הניסיון שלך הסתיימה. בחר תוכנית כדי להמשיך.'
        : 'Your 30-day trial has ended. Choose a plan to continue.',
      cta: lang === 'he' ? 'בחר תוכנית' : 'Choose Plan',
    },
  };

  const config = status === 'expired' ? bannerConfig.expired : bannerConfig.expiring;

  return (
    <div className={`${config.bg} border-2 rounded-lg p-4 mb-6 animate-fade-in`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertTriangle className={`w-6 h-6 ${config.icon} flex-shrink-0`} />
          <p className={`font-medium ${config.text}`}>{config.message}</p>
        </div>
        <div className="flex items-center gap-2">
          <UniversalButton
            variant={status === 'expired' ? 'primary' : 'secondary'}
            size="sm"
            onClick={onUpgrade}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {config.cta}
          </UniversalButton>
          {status === 'expiring' && (
            <button
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
