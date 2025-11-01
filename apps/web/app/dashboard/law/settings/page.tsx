'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';

export const dynamic = 'force-dynamic';

export default function LawSettingsPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'firm' | 'notifications' | 'legal' | 'billing'>('firm');

  const tabs = [
    { id: 'firm' as const, label: language === 'he' ? 'פרטי משרד' : 'Firm Info' },
    { id: 'notifications' as const, label: language === 'he' ? 'התראות' : 'Notifications' },
    { id: 'legal' as const, label: language === 'he' ? 'מדיניות משפטית' : 'Legal Policies' },
    { id: 'billing' as const, label: language === 'he' ? 'חיוב' : 'Billing' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {language === 'he' ? 'הגדרות' : 'Settings'}
      </h1>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-[#2979FF] border-b-2 border-[#2979FF]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <UniversalCard>
        <div className="p-6 space-y-4">
          {activeTab === 'firm' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'he' ? 'שם המשרד' : 'Firm Name'}
                </label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Law Firm LLC" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'he' ? 'כתובת' : 'Address'}
                </label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="123 Main St" />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{language === 'he' ? 'התראות דוא"ל' : 'Email Notifications'}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{language === 'he' ? 'תזכורות דיונים' : 'Hearing Reminders'}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'he' ? 'הגדר מדיניות משפטית כאן' : 'Configure legal policies here'}
              </p>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'he' ? 'תעריף שעתי ברירת מחדל' : 'Default Hourly Rate'}
                </label>
                <input type="number" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="250" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <UniversalButton variant="primary">
              {language === 'he' ? 'שמור שינויים' : 'Save Changes'}
            </UniversalButton>
          </div>
        </div>
      </UniversalCard>
    </div>
  );
}
