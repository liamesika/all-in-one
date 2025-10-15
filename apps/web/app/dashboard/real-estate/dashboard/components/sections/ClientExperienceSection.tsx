'use client';

import { Star, TrendingUp, MessageSquare, Users } from 'lucide-react';
import { KPICard, UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
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
    <UniversalCard variant="elevated" className="mb-6">
      <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2979FF 0%, #6EA8FE 100%)' }}>
            <Star className="w-6 h-6 text-[#2979FF]" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading-3">{lang === 'he' ? 'חוויית לקוח' : 'Client Experience'}</h2>
            <p className="text-body-sm">{lang === 'he' ? 'מעקב שביעות רצון לקוחות' : 'Monitor client satisfaction'}</p>
          </div>
          <UniversalButton variant="primary" size="sm">{lang === 'he' ? 'צפה בפרטים' : 'View Details'}</UniversalButton>
        </div>
      </CardHeader>

      <CardBody className="p-6 space-y-6">

        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={<Star className="w-5 h-5" />}
            label={lang === 'he' ? 'שביעות רצון' : 'Satisfaction'}
            value={`${data.satisfaction}%`}
            change={{ value: '+2%', trend: 'up' }}
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5" />}
            label={lang === 'he' ? 'ציון NPS' : 'NPS Score'}
            value={data.nps}
            change={{ value: '+5 points', trend: 'up' }}
          />
          <KPICard
            icon={<MessageSquare className="w-5 h-5" />}
            label={lang === 'he' ? 'ביקורות החודש' : 'Reviews This Month'}
            value={data.reviewsThisMonth}
            change={{ value: `${data.reviewsThisMonth} reviews`, trend: 'neutral' }}
          />
          <KPICard
            icon={<Users className="w-5 h-5" />}
            label={lang === 'he' ? 'הפניות' : 'Referrals'}
            value={data.referrals}
            change={{ value: '+3 this week', trend: 'up' }}
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
      </CardBody>
    </UniversalCard>
  );
}
