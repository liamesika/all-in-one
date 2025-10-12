'use client';

import { KPICard } from '@/components/dashboard/KPICard';
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
}

export function LeadsMarketingSection({ data }: LeadsMarketingSectionProps) {
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
        {lang === 'he' ? 'ביצועי לידים ושיווק' : 'Leads & Marketing Performance'}
      </h2>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={lang === 'he' ? 'לידים היום' : 'Leads Today'}
          value={data.leadsToday}
          delta="+12%"
          color="#2979FF"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'לידים מוסמכים' : 'Qualified Leads'}
          value={data.qualified}
          delta="+8%"
          color="#6EA8FE"
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
          title={lang === 'he' ? 'עלות לליד' : 'Cost per Lead'}
          value={`$${data.cpl}`}
          delta="-5%"
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
          title={lang === 'he' ? 'שיעור המרה' : 'Conversion Rate'}
          value={`${data.convRate}%`}
          delta="+3%"
          color="#6EA8FE"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
    </section>
  );
}
