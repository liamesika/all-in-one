'use client';

import { BarChart3, DollarSign, Package, TrendingUp } from 'lucide-react';
import { KPICard, UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
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
    <UniversalCard variant="elevated" className="mb-6">
      <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2979FF 0%, #6EA8FE 100%)' }}>
            <BarChart3 className="w-6 h-6 text-[#2979FF]" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading-3 text-white">{lang === 'he' ? 'מודיעין שוק' : 'Market Intelligence'}</h2>
            <p className="text-body-sm" style={{ color: '#9EA7B3' }}>{lang === 'he' ? 'ניתוח מגמות שוק' : 'Analyze market trends'}</p>
          </div>
          <UniversalButton variant="primary" size="sm">{lang === 'he' ? 'צפה בפרטים' : 'View Details'}</UniversalButton>
        </div>
      </CardHeader>

      <CardBody className="p-6 space-y-6">
        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={lang === 'he' ? 'מגמת שוק' : 'Market Trend'}
          value={data.marketTrend}
          delta="+2.5%"
          color="#10B981"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KPICard
          title={lang === 'he' ? 'מחיר ממוצע למ"ר' : 'Avg Price per Sqm'}
          value={`$${data.avgPricePerSqm}`}
          delta="+3.2%"
          color="#2979FF"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <KPICard
          title={lang === 'he' ? 'ימי מלאי' : 'Inventory Days'}
          value={data.inventoryDays}
          delta="-5"
          color="#6EA8FE"
          icon={<Package className="w-5 h-5" />}
        />
        <KPICard
          title={lang === 'he' ? 'רשימות מתחרים' : 'Competitor Listings'}
          value={data.competitorListings}
          color="#FFB347"
          icon={<BarChart3 className="w-5 h-5" />}
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
      </CardBody>
    </UniversalCard>
  );
}
