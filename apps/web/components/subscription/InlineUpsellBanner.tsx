'use client';

import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { UniversalButton } from '@/components/shared';

interface InlineUpsellBannerProps {
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  featureName: string;
  featureNameHe: string;
  currentPlan?: string;
  requiredPlan: 'PRO' | 'AGENCY' | 'ENTERPRISE';
  lang: 'en' | 'he';
  onUpgrade: () => void;
  variant?: 'compact' | 'full';
}

const PLAN_LABELS = {
  PRO: { en: 'Pro', he: 'פרו' },
  AGENCY: { en: 'Agency', he: 'סוכנות' },
  ENTERPRISE: { en: 'Enterprise', he: 'ארגוני' },
};

export function InlineUpsellBanner({
  title,
  titleHe,
  description,
  descriptionHe,
  featureName,
  featureNameHe,
  requiredPlan,
  lang,
  onUpgrade,
  variant = 'full',
}: InlineUpsellBannerProps) {
  const isRTL = lang === 'he';
  const planLabel = PLAN_LABELS[requiredPlan][lang];

  if (variant === 'compact') {
    return (
      <div
        className={`
          flex items-center justify-between gap-4 p-4 rounded-xl
          bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20
          border-2 border-blue-200 dark:border-blue-800
          ${isRTL ? 'flex-row-reverse' : 'flex-row'}
        `}
      >
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {lang === 'he' ? featureNameHe : featureName}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {lang === 'he'
                ? `זמין בתוכנית ${planLabel} ומעלה`
                : `Available on ${planLabel} plan and above`}
            </p>
          </div>
        </div>
        <UniversalButton
          variant="primary"
          size="sm"
          onClick={onUpgrade}
          className="flex-shrink-0"
        >
          {lang === 'he' ? 'שדרג' : 'Upgrade'}
        </UniversalButton>
      </div>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6 md:p-8
        bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
        dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20
        border-2 border-blue-200 dark:border-blue-800
      `}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

      <div className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Header */}
        <div className={`flex items-start gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {lang === 'he' ? `תוכנית ${planLabel} נדרשת` : `${planLabel} Plan Required`}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {lang === 'he' ? titleHe : title}
            </h3>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {lang === 'he' ? descriptionHe : description}
            </p>
          </div>
        </div>

        {/* Feature Badge */}
        <div className="mb-6">
          <div
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg
              bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              shadow-sm
              ${isRTL ? 'flex-row-reverse' : 'flex-row'}
            `}
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {lang === 'he' ? featureNameHe : featureName}
            </span>
          </div>
        </div>

        {/* CTA */}
        <UniversalButton
          variant="primary"
          size="lg"
          onClick={onUpgrade}
          className="shadow-lg hover:shadow-xl transition-shadow"
        >
          <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <span>{lang === 'he' ? 'שדרג לתוכנית Pro' : 'Upgrade to Pro'}</span>
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </span>
        </UniversalButton>

        {/* Subtext */}
        <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          {lang === 'he'
            ? 'נסיון חינם ל-30 יום • ללא כרטיס אשראי • ביטול בכל עת'
            : '30-day free trial • No credit card required • Cancel anytime'}
        </p>
      </div>
    </div>
  );
}
