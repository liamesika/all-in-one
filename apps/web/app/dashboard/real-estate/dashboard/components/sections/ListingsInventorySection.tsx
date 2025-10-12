'use client';

import { KPICard } from '@/components/dashboard/KPICard';
import { BarChart } from '@/components/dashboard/BarChart';
import { LineChart } from '@/components/dashboard/LineChart';
import { useLang } from '@/components/i18n/LangProvider';

interface ListingsInventoryData {
  activeListings: number;
  avgDOM: number;
  priceReductions: number;
  viewingsScheduled: number;
  listingsByStatus: Array<{ label: string; value: number; color?: string }>;
  priceTrend: Array<{ label: string; value: number }>;
}

interface ListingsInventorySectionProps {
  data: ListingsInventoryData;
}

export function ListingsInventorySection({ data }: ListingsInventorySectionProps) {
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
        {lang === 'he' ? 'רשימות ומלאי' : 'Listings & Inventory'}
      </h2>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={lang === 'he' ? 'רשימות פעילות' : 'Active Listings'}
          value={data.activeListings}
          delta="+5"
          color="#2979FF"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'ימים ממוצעים בשוק' : 'Avg Days on Market'}
          value={data.avgDOM}
          delta="-3"
          subtitle={lang === 'he' ? 'ימים' : 'days'}
          color="#6EA8FE"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'הפחתות מחיר' : 'Price Reductions'}
          value={data.priceReductions}
          color="#FFB347"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          }
        />
        <KPICard
          title={lang === 'he' ? 'צפיות מתוכננות' : 'Viewings Scheduled'}
          value={data.viewingsScheduled}
          delta="+7"
          color="#10B981"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={data.listingsByStatus}
          title={lang === 'he' ? 'רשימות לפי סטטוס' : 'Listings by Status'}
        />
        <LineChart
          data={data.priceTrend}
          title={lang === 'he' ? 'מגמת מחיר ממוצע' : 'Average Price Trend'}
        />
      </div>
    </section>
  );
}
