'use client';

/**
 * Listings & Inventory Section - Redesigned with Design System 2.0
 */

import { Building2, Clock, TrendingDown, Users } from 'lucide-react';
import { KPICard, UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
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
  onViewDetails?: () => void;
}

export function ListingsInventorySection({ data, onViewDetails }: ListingsInventorySectionProps) {
  const { lang } = useLang();

  return (
    <UniversalCard variant="elevated" className="mb-6">
      <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-[#2979FF]/10 rounded-lg">
              <Building2 className="w-6 h-6 text-[#2979FF]" />
            </div>
            <div>
              <h2 className="text-heading-3 text-gray-900 dark:text-white">
                {lang === 'he' ? 'רשימות ומלאי' : 'Listings & Inventory'}
              </h2>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                {lang === 'he' ? 'נהל את תיק הנכסים שלך' : 'Manage your property portfolio'}
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
            icon={<Building2 className="w-5 h-5" />}
            label={lang === 'he' ? 'רשימות פעילות' : 'Active Listings'}
            value={data.activeListings}
            change={{ value: '+5 new', trend: 'up' }}
          />
          <KPICard
            icon={<Clock className="w-5 h-5" />}
            label={lang === 'he' ? 'ימים ממוצעים בשוק' : 'Avg Days on Market'}
            value={data.avgDOM}
            change={{ value: '-3 days', trend: 'up' }}
          />
          <KPICard
            icon={<TrendingDown className="w-5 h-5" />}
            label={lang === 'he' ? 'הפחתות מחיר' : 'Price Reductions'}
            value={data.priceReductions}
            change={{ value: `${data.priceReductions} properties`, trend: 'neutral' }}
          />
          <KPICard
            icon={<Users className="w-5 h-5" />}
            label={lang === 'he' ? 'צפיות מתוכננות' : 'Viewings Scheduled'}
            value={data.viewingsScheduled}
            change={{ value: '+7 this week', trend: 'up' }}
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
      </CardBody>
    </UniversalCard>
  );
}
