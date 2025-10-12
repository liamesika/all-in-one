'use client';

import { KPICard } from '@/components/dashboard/KPICard';
import { BarChart } from '@/components/dashboard/BarChart';
import { useLang } from '@/components/i18n/LangProvider';

interface ClientExperienceData {
  satisfaction: number;
  nps: number;
  reviewsThisMonth: number;
  referrals: number;
  feedbackByRating: Array<{ label: string; value: number; color?: string }>;
  communicationChannels: Array<{ label: string; value: number; color?: string }>;
}

interface ClientExperienceSectionProps {
  data: ClientExperienceData;
}

export function ClientExperienceSection({ data }: ClientExperienceSectionProps) {
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
        {lang === 'he' ? 'חוויית לקוח' : 'Client Experience'}
      </h2>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={lang === 'he' ? 'שביעות רצון' : 'Satisfaction'}
          value={`${data.satisfaction}%`}
          delta="+2%"
          color="#10B981"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'ציון NPS' : 'NPS Score'}
          value={data.nps}
          delta="+5"
          color="#2979FF"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'ביקורות החודש' : 'Reviews This Month'}
          value={data.reviewsThisMonth}
          delta="+8"
          color="#6EA8FE"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'הפניות' : 'Referrals'}
          value={data.referrals}
          delta="+12"
          color="#FFB347"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={data.feedbackByRating}
          title={lang === 'he' ? 'משוב לפי דירוג' : 'Feedback by Rating'}
        />
        <BarChart
          data={data.communicationChannels}
          title={lang === 'he' ? 'ערוצי תקשורת' : 'Communication Channels'}
        />
      </div>
    </section>
  );
}
