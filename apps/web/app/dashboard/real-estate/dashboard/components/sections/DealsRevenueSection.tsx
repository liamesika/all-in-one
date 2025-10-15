'use client';

/**
 * Deals & Revenue Section - Redesigned with Design System 2.0
 */

import { CheckCircle, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { KPICard, UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
import { LineChart } from '@/components/dashboard/LineChart';
import { BarChart } from '@/components/dashboard/BarChart';
import { useLang } from '@/components/i18n/LangProvider';

interface DealsRevenueData {
  dealsThisMonth: number;
  totalRevenue: number;
  avgCommission: number;
  pipelineValue: number;
  revenueTrend: Array<{ label: string; value: number }>;
  dealsByAgent: Array<{ label: string; value: number; color?: string }>;
}

interface DealsRevenueSectionProps {
  data: DealsRevenueData;
}

export function DealsRevenueSection({ data }: DealsRevenueSectionProps) {
  const { lang } = useLang();

  return (
    <UniversalCard variant="elevated" className="mb-6">
      <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-[#2979FF]/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-[#2979FF]" />
            </div>
            <div>
              <h2 className="text-heading-3 text-gray-900 dark:text-white">
                {lang === 'he' ? 'עסקאות והכנסות' : 'Deals & Revenue'}
              </h2>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                {lang === 'he' ? 'עקוב אחר ביצועים פיננסיים' : 'Track financial performance'}
              </p>
            </div>
          </div>
          <UniversalButton variant="primary" size="sm">
            {lang === 'he' ? 'צפה בפרטים' : 'View Details'}
          </UniversalButton>
        </div>
      </CardHeader>

      <CardBody className="p-6 space-y-6">
        {/* KPIs Row - Updated with Unified KPICard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={<CheckCircle className="w-5 h-5" />}
            label={lang === 'he' ? 'עסקאות החודש' : 'Deals This Month'}
            value={data.dealsThisMonth}
            change={{ value: '+4 deals', trend: 'up' }}
          />
          <KPICard
            icon={<DollarSign className="w-5 h-5" />}
            label={lang === 'he' ? 'הכנסות כוללות' : 'Total Revenue'}
            value={`$${(data.totalRevenue / 1000).toFixed(0)}K`}
            change={{ value: '+15%', trend: 'up' }}
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5" />}
            label={lang === 'he' ? 'עמלה ממוצעת' : 'Avg Commission'}
            value={`$${data.avgCommission.toFixed(0)}`}
            change={{ value: '+2%', trend: 'up' }}
          />
          <KPICard
            icon={<Briefcase className="w-5 h-5" />}
            label={lang === 'he' ? 'ערך צינור' : 'Pipeline Value'}
            value={`$${(data.pipelineValue / 1000).toFixed(0)}K`}
            change={{ value: '+18%', trend: 'up' }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart
            data={data.revenueTrend}
            title={lang === 'he' ? 'מגמת הכנסות חודשיות' : 'Monthly Revenue Trend'}
          />
          <BarChart
            data={data.dealsByAgent}
            title={lang === 'he' ? 'עסקאות לפי סוכן' : 'Deals by Agent'}
          />
        </div>
      </CardBody>
    </UniversalCard>
  );
}
