'use client';

/**
 * Leads & Marketing Section - Redesigned with Design System 2.0
 */

import { TrendingUp, Target, DollarSign, TrendingDown } from 'lucide-react';
import { KPICard, UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
import { LineChart } from '@/components/dashboard/LineChart';
import { PieChart } from '@/components/dashboard/PieChart';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { useLang } from '@/components/i18n/LangProvider';

interface LeadsMarketingData {
  leadsToday: number;
  qualified: number;
  cpl: number;
  convRate: number;
  leadsTrend: Array<{ label: string; value: number }>;
  leadsBySource: Array<{ label: string; value: number; color?: string }>;
  alerts?: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }>;
}

interface LeadsMarketingSectionProps {
  data: LeadsMarketingData;
  onViewDetails?: () => void;
}

export function LeadsMarketingSection({ data, onViewDetails }: LeadsMarketingSectionProps) {
  const { lang } = useLang();

  return (
    <UniversalCard variant="elevated" className="mb-6">
      <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-[#2979FF]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#2979FF]" />
            </div>
            <div>
              <h2 className="text-heading-3 text-gray-900 dark:text-white">
                {lang === 'he' ? 'ביצועי לידים ושיווק' : 'Leads & Marketing Performance'}
              </h2>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                {lang === 'he' ? 'מעקב אחר יצירת לידים ומדדי קמפיין' : 'Track lead generation and campaign metrics'}
              </p>
            </div>
          </div>
          <UniversalButton variant="primary" size="sm" onClick={onViewDetails}>
            {lang === 'he' ? 'צפה בפרטים' : 'View Details'}
          </UniversalButton>
        </div>
      </CardHeader>

      <CardBody className="p-6 space-y-6">

        {/* KPIs Row - Updated with Unified KPICard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={<TrendingUp className="w-5 h-5" />}
            label={lang === 'he' ? 'לידים היום' : 'Leads Today'}
            value={data.leadsToday}
            change={{ value: '+12%', trend: 'up' }}
          />
          <KPICard
            icon={<Target className="w-5 h-5" />}
            label={lang === 'he' ? 'לידים מוסמכים' : 'Qualified Leads'}
            value={data.qualified}
            change={{ value: '+8%', trend: 'up' }}
          />
          <KPICard
            icon={<DollarSign className="w-5 h-5" />}
            label={lang === 'he' ? 'עלות לליד' : 'Cost per Lead'}
            value={`$${data.cpl}`}
            change={{ value: '-5%', trend: 'up' }}
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5" />}
            label={lang === 'he' ? 'שיעור המרה' : 'Conversion Rate'}
            value={`${data.convRate}%`}
            change={{ value: '+3%', trend: 'up' }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart
            data={data.leadsTrend}
            title={lang === 'he' ? 'מגמת לידים לאורך זמן' : 'Leads Over Time'}
          />
          <PieChart
            data={data.leadsBySource}
            title={lang === 'he' ? 'לידים לפי מקור' : 'Leads by Source'}
          />
        </div>

        {/* Alerts */}
        {data.alerts && data.alerts.length > 0 && (
          <AlertCard alerts={data.alerts} />
        )}
      </CardBody>
    </UniversalCard>
  );
}
