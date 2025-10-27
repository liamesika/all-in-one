'use client';

import { useState } from 'react';
import { Check, Sparkles, Mail } from 'lucide-react';
import { UniversalCard, CardBody, UniversalButton } from '@/components/shared';
import { auth } from '@/lib/firebase';

type Vertical = 'ecommerce' | 'realestate' | 'productions' | 'law';
type PlanPeriod = 'month' | 'year';

interface PricingPanelProps {
  vertical: Vertical;
  lang: 'en' | 'he';
  onTrialStart?: () => void;
}

const PLAN_BENEFITS = {
  ecommerce: {
    starter: {
      en: ['10 AI Product Descriptions', '50 AI Images', '5 Campaign Briefs', 'Email Support', 'Tutorials Access'],
      he: ['10 תיאורי מוצר AI', '50 תמונות AI', '5 תקצירי קמפיין', 'תמיכה במייל', 'גישה להדרכות'],
    },
    pro: {
      en: ['Unlimited AI Descriptions', 'Unlimited AI Images', 'Unlimited Campaigns', 'Priority Support', 'Advanced Analytics', 'CSV Builder', 'Store Structure AI'],
      he: ['תיאורי AI ללא הגבלה', 'תמונות AI ללא הגבלה', 'קמפיינים ללא הגבלה', 'תמיכה עדיפות', 'אנליטיקה מתקדמת', 'בונה CSV', 'מבנה חנות AI'],
    },
    business: {
      en: ['Everything in Pro', 'White Label', 'API Access', 'Dedicated Account Manager', 'Custom Integrations', 'SLA Guarantee'],
      he: ['כל מה שב-Pro', 'White Label', 'גישת API', 'מנהל חשבון ייעודי', 'אינטגרציות מותאמות', 'ערבות SLA'],
    },
  },
  realestate: {
    starter: {
      en: ['50 Properties', '100 Leads', 'Basic Analytics', 'Email Support', 'Property Import'],
      he: ['50 נכסים', '100 לידים', 'אנליטיקה בסיסית', 'תמיכה במייל', 'ייבוא נכסים'],
    },
    pro: {
      en: ['Unlimited Properties', 'Unlimited Leads', 'Advanced Analytics', 'Priority Support', 'Lead Assignment', 'Campaign Management', 'API Access'],
      he: ['נכסים ללא הגבלה', 'לידים ללא הגבלה', 'אנליטיקה מתקדמת', 'תמיכה עדיפות', 'הקצאת לידים', 'ניהול קמפיינים', 'גישת API'],
    },
    business: {
      en: ['Everything in Pro', 'White Label', 'Dedicated Support', 'Custom Reports', 'Multi-Branch', 'SLA Guarantee'],
      he: ['כל מה שב-Pro', 'White Label', 'תמיכה ייעודית', 'דוחות מותאמים', 'רב-סניפים', 'ערבות SLA'],
    },
  },
  productions: {
    starter: {
      en: ['10 Projects', '50 Tasks', 'Basic Scheduling', 'Email Support', 'Resource Management'],
      he: ['10 פרויקטים', '50 משימות', 'תזמון בסיסי', 'תמיכה במייל', 'ניהול משאבים'],
    },
    pro: {
      en: ['Unlimited Projects', 'Unlimited Tasks', 'Advanced Scheduling', 'Priority Support', 'Budget Tracking', 'Client Portal', 'Analytics'],
      he: ['פרויקטים ללא הגבלה', 'משימות ללא הגבלה', 'תזמון מתקדם', 'תמיכה עדיפות', 'מעקב תקציב', 'פורטל לקוחות', 'אנליטיקה'],
    },
    business: {
      en: ['Everything in Pro', 'White Label', 'API Access', 'Dedicated Manager', 'Custom Workflows', 'SLA Guarantee'],
      he: ['כל מה שב-Pro', 'White Label', 'גישת API', 'מנהל ייעודי', 'תהליכי עבודה מותאמים', 'ערבות SLA'],
    },
  },
  law: {
    starter: {
      en: ['20 Clients', '50 Cases', 'Document Templates', 'Email Support', 'Calendar Integration'],
      he: ['20 לקוחות', '50 תיקים', 'תבניות מסמכים', 'תמיכה במייל', 'אינטגרציית לוח שנה'],
    },
    pro: {
      en: ['Unlimited Clients', 'Unlimited Cases', 'Advanced Templates', 'Priority Support', 'Time Tracking', 'Billing System', 'Analytics'],
      he: ['לקוחות ללא הגבלה', 'תיקים ללא הגבלה', 'תבניות מתקדמות', 'תמיכה עדיפות', 'מעקב זמן', 'מערכת חיוב', 'אנליטיקה'],
    },
    business: {
      en: ['Everything in Pro', 'White Label', 'API Access', 'Dedicated Support', 'Multi-Office', 'SLA Guarantee'],
      he: ['כל מה שב-Pro', 'White Label', 'גישת API', 'תמיכה ייעודית', 'רב-משרדים', 'ערבות SLA'],
    },
  },
};

const PRICING = {
  starter: { month: 29, year: 290 },
  pro: { month: 99, year: 990 },
};

export function PricingPanel({ vertical, lang, onTrialStart }: PricingPanelProps) {
  const [period, setPeriod] = useState<PlanPeriod>('month');
  const [loading, setLoading] = useState<string | null>(null);

  const handleStartTrial = async (tier: 'starter' | 'pro') => {
    setLoading(tier);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert(lang === 'he' ? 'יש להתחבר תחילה' : 'Please sign in first');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch('/api/subscriptions/trial', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vertical }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'ACTIVE_SUBSCRIPTION') {
          alert(lang === 'he' ? 'יש לך כבר מנוי פעיל' : 'You already have an active subscription');
        } else if (data.error === 'TRIAL_ALREADY_ACTIVE') {
          alert(lang === 'he' ? 'תקופת הניסיון שלך כבר פעילה' : 'Your trial is already active');
        } else {
          alert(lang === 'he' ? 'שגיאה בהפעלת תקופת ניסיון' : 'Error activating trial');
        }
        return;
      }

      // Fire analytics
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.pricing_click?.({
          vertical,
          tier,
          locale: lang,
          plan_period: period,
          action: 'trial_started',
        });
      }

      alert(
        lang === 'he'
          ? `תקופת ניסיון של 30 יום החלה! מסתיימת ב-${new Date(data.endDateISO).toLocaleDateString('he-IL')}`
          : `30-day trial started! Ends on ${new Date(data.endDateISO).toLocaleDateString('en-US')}`
      );

      onTrialStart?.();
    } catch (error) {
      console.error('Trial activation error:', error);
      alert(lang === 'he' ? 'שגיאה בהפעלת תקופת ניסיון' : 'Error activating trial');
    } finally {
      setLoading(null);
    }
  };

  const handleContactSales = () => {
    const subject = `Effinity ${vertical.charAt(0).toUpperCase() + vertical.slice(1)} - Business Plan`;
    const body = lang === 'he'
      ? `שלום,\n\nאני מעוניין/ת לקבל מידע נוסף על תוכנית Business עבור ${vertical}.\n\nבברכה`
      : `Hello,\n\nI'm interested in learning more about the Business plan for ${vertical}.\n\nBest regards`;

    window.location.href = `mailto:sales@effinity.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Fire analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.pricing_click?.({
        vertical,
        tier: 'business',
        locale: lang,
        plan_period: period,
        action: 'contact_sales',
      });
    }
  };

  const benefits = PLAN_BENEFITS[vertical];
  const isRTL = lang === 'he';

  return (
    <div className="mb-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {lang === 'he' ? 'בחר את התוכנית המתאימה לך' : 'Choose Your Plan'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {lang === 'he' ? 'התחל עם ניסיון חינם ל-30 יום' : 'Start with a 30-day free trial'}
        </p>

        {/* Period Toggle */}
        <div className="inline-flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              period === 'month'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {lang === 'he' ? 'חודשי' : 'Monthly'}
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              period === 'year'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {lang === 'he' ? 'שנתי' : 'Yearly'}
            <span className="ml-2 text-green-600 text-sm">{lang === 'he' ? 'חסוך 17%' : 'Save 17%'}</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Starter */}
        <UniversalCard variant="elevated" className="relative">
          <CardBody>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                {lang === 'he' ? 'ניסיון 30 יום' : '30-Day Trial'}
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">${PRICING.starter[period]}</span>
                <span className="text-gray-600 dark:text-gray-400">/{lang === 'he' ? (period === 'month' ? 'חודש' : 'שנה') : period}</span>
              </div>
              <UniversalButton
                variant="primary"
                fullWidth
                onClick={() => handleStartTrial('starter')}
                disabled={loading === 'starter'}
              >
                {loading === 'starter'
                  ? (lang === 'he' ? 'מפעיל...' : 'Starting...')
                  : (lang === 'he' ? 'התחל ניסיון חינם' : 'Start Free Trial')}
              </UniversalButton>
            </div>
            <ul className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
              {benefits.starter[lang].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className={`w-5 h-5 text-green-600 flex-shrink-0 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </UniversalCard>

        {/* Pro - Most Popular */}
        <UniversalCard variant="elevated" className="relative border-2 border-[#2979FF] shadow-xl">
          <CardBody>
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                {lang === 'he' ? 'הכי פופולרי' : 'Most Popular'}
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                {lang === 'he' ? 'ניסיון 30 יום' : '30-Day Trial'}
              </span>
            </div>
            <div className="text-center mb-6 pt-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">${PRICING.pro[period]}</span>
                <span className="text-gray-600 dark:text-gray-400">/{lang === 'he' ? (period === 'month' ? 'חודש' : 'שנה') : period}</span>
              </div>
              <UniversalButton
                variant="primary"
                fullWidth
                onClick={() => handleStartTrial('pro')}
                disabled={loading === 'pro'}
              >
                {loading === 'pro'
                  ? (lang === 'he' ? 'מפעיל...' : 'Starting...')
                  : (lang === 'he' ? 'התחל ניסיון חינם' : 'Start Free Trial')}
              </UniversalButton>
            </div>
            <ul className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
              {benefits.pro[lang].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className={`w-5 h-5 text-green-600 flex-shrink-0 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </UniversalCard>

        {/* Business */}
        <UniversalCard variant="elevated" className="relative">
          <CardBody>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{lang === 'he' ? 'מותאם' : 'Custom'}</span>
              </div>
              <UniversalButton
                variant="secondary"
                fullWidth
                onClick={handleContactSales}
              >
                <Mail className="w-4 h-4 mr-2" />
                {lang === 'he' ? 'צור קשר למכירות' : 'Contact Sales'}
              </UniversalButton>
            </div>
            <ul className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
              {benefits.business[lang].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className={`w-5 h-5 text-green-600 flex-shrink-0 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </UniversalCard>
      </div>
    </div>
  );
}
