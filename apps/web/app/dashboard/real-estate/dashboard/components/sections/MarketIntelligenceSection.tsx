'use client';

import { KPICard } from '@/components/dashboard/KPICard';
import { LineChart } from '@/components/dashboard/LineChart';
import { BarChart } from '@/components/dashboard/BarChart';
import { useLang } from '@/components/i18n/LangProvider';

interface MarketIntelligenceData {
  marketTrend: string;
  avgPricePerSqm: number;
  inventoryDays: number;
  competitorListings: number;
  marketPriceTrend: Array<{ label: string; value: number }>;
  neighborhoodHotspots: Array<{ label: string; value: number; color?: string }>;
}

interface MarketIntelligenceSectionProps {
  data: MarketIntelligenceData;
}

export function MarketIntelligenceSection({ data }: MarketIntelligenceSectionProps) {
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
        {lang === 'he' ? 'מודיעין שוק' : 'Market Intelligence'}
      </h2>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={lang === 'he' ? 'מגמת שוק' : 'Market Trend'}
          value={data.marketTrend}
          delta="+2.5%"
          color="#10B981"
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
        <KPICard
          title={lang === 'he' ? 'מחיר ממוצע למ"ר' : 'Avg Price per Sqm'}
          value={`$${data.avgPricePerSqm}`}
          delta="+3.2%"
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
          title={lang === 'he' ? 'ימי מלאי' : 'Inventory Days'}
          value={data.inventoryDays}
          delta="-5"
          color="#6EA8FE"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'רשימות מתחרים' : 'Competitor Listings'}
          value={data.competitorListings}
          color="#FFB347"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={data.marketPriceTrend}
          title={lang === 'he' ? 'מגמת מחירי שוק' : 'Market Price Trend'}
        />
        <BarChart
          data={data.neighborhoodHotspots}
          title={lang === 'he' ? 'נקודות חמות בשכונה' : 'Neighborhood Hotspots'}
        />
      </div>
    </section>
  );
}
