'use client';

import { useLanguage } from '@/lib/language-context';
import { UniversalCard, KPICard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { Download, FileSpreadsheet, BarChart, TrendingUp } from 'lucide-react';

export default function LawReportsPage() {
  const { language } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'he' ? 'דוחות וניתוח' : 'Reports & Analytics'}
        </h1>
        <UniversalButton variant="primary" icon={<FileSpreadsheet className="w-4 h-4" />}>
          {language === 'he' ? 'ייצא ל-Excel' : 'Export to Excel'}
        </UniversalButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon={<BarChart className="w-6 h-6" />} label={language === 'he' ? 'סה"כ תיקים' : 'Total Cases'} value="87" change={{ value: '+12%', trend: 'up' }} />
        <KPICard icon={<TrendingUp className="w-6 h-6" />} label={language === 'he' ? 'משימות שהושלמו' : 'Tasks Completed'} value="234" change={{ value: '+8%', trend: 'up' }} />
        <KPICard icon={<Download className="w-6 h-6" />} label={language === 'he' ? 'הכנסות חודש' : 'Revenue MTD'} value="$142K" change={{ value: '+15%', trend: 'up' }} />
        <KPICard icon={<BarChart className="w-6 h-6" />} label={language === 'he' ? 'שעות חיוב' : 'Billable Hours'} value="487" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UniversalCard>
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{language === 'he' ? 'תיקים לפי סוג' : 'Cases by Type'}</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">{language === 'he' ? 'תרשים בקרוב' : 'Chart Coming Soon'}</p>
            </div>
          </div>
        </UniversalCard>

        <UniversalCard>
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{language === 'he' ? 'הכנסות לפי חודש' : 'Revenue by Month'}</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">{language === 'he' ? 'תרשים בקרוב' : 'Chart Coming Soon'}</p>
            </div>
          </div>
        </UniversalCard>
      </div>
    </div>
  );
}
