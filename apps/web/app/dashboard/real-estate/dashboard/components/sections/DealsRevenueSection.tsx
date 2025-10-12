'use client';

import { KPICard } from '@/components/dashboard/KPICard';
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
    <section
      className="rounded-xl p-6 animate-fade-in"
      style={{
        background: 'var(--re-midnight-blue)',
        boxShadow: 'var(--re-shadow-md)',
      }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--re-white)' }}
      >
        {lang === 'he' ? 'עסקאות והכנסות' : 'Deals & Revenue'}
      </h2>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={lang === 'he' ? 'עסקאות החודש' : 'Deals This Month'}
          value={data.dealsThisMonth}
          delta="+4"
          color="#10B981"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'הכנסות כוללות' : 'Total Revenue'}
          value={`$${(data.totalRevenue / 1000).toFixed(0)}K`}
          delta="+15%"
          color="#2979FF"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'עמלה ממוצעת' : 'Avg Commission'}
          value={`$${data.avgCommission.toFixed(0)}`}
          delta="+2%"
          color="#6EA8FE"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'ערך צינור' : 'Pipeline Value'}
          value={`$${(data.pipelineValue / 1000).toFixed(0)}K`}
          delta="+18%"
          color="#FFB347"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
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
    </section>
  );
}
