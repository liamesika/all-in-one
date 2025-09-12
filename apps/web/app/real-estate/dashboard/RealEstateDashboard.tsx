'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EffinityHeader } from '@/components/effinity-header';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { useLang } from '@/components/i18n/LangProvider';
import { LeadsQualityWidget } from './components/LeadsQualityWidget';
import { ListingsPerformanceWidget } from './components/ListingsPerformanceWidget';
import { CompsWidget } from './components/CompsWidget';
import { OpenHouseWidget } from './components/OpenHouseWidget';
import { AutoMarketingWidget } from './components/AutoMarketingWidget';
import { NeighborhoodGuideWidget } from './components/NeighborhoodGuideWidget';
import { RevenueWidget } from './components/RevenueWidget';
import { OperationsWidget } from './components/OperationsWidget';
import { Sidebar } from './components/Sidebar';

// Types for Real Estate Automation Hub
interface DashboardFilters {
  dateRange: string;
  startDate?: string;
  endDate?: string;
  agentId?: string;
  city?: string;
  neighborhood?: string;
  propertyType?: string;
  status?: string; // Draft/Listed/Under-Offer/Sold
  leadSource?: string; // Meta/Google/Portal/Organic/Referral
  priceBand?: string;
  bedrooms?: string;
  search?: string;
}

interface KPIData {
  value: number | string;
  delta: string;
  trend?: number[];
  previousPeriod?: number;
  conversion?: string;
  utilization?: string;
  level?: string;
  count?: number;
  overdue?: number;
}

interface DashboardData {
  kpis: {
    newLeads: KPIData & { hotWarmCold: { hot: number; warm: number; cold: number; } };
    conversionRates: KPIData & { qualified: string; viewing: string; offer: string; deal: string; };
    timeToContact: KPIData & { slaMetRate: string; };
    scheduledViewings: KPIData & { noShowRate: string; };
    offersCreated: KPIData & { acceptanceRate: string; };
    avgDOM: KPIData & { listToSoldRatio: string; };
    roasCAC: KPIData & { cac: number; roas: string; };
    pipelineValue: KPIData & { expectedCommissions: number; };
  };
  widgets: {
    leadsQuality: any[];
    listingsPerformance: any[];
    comps: any[];
    openHouse: any[];
    autoMarketing: any[];
    neighborhoodGuides: any[];
    revenue: any[];
    operations: {
      alerts: any[];
      tasks: any[];
    };
  };
}

function RealEstateDashboardContent({ 
  data, 
  initialFilters 
}: { 
  data: DashboardData;
  initialFilters: any;
}) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: initialFilters?.dateRange || 'last-30-days',
    startDate: initialFilters?.startDate,
    endDate: initialFilters?.endDate,
    agentId: initialFilters?.agentId,
    city: initialFilters?.city,
    neighborhood: initialFilters?.neighborhood,
    propertyType: initialFilters?.propertyType,
    status: initialFilters?.status,
    leadSource: initialFilters?.leadSource,
    priceBand: initialFilters?.priceBand,
    bedrooms: initialFilters?.bedrooms,
    search: initialFilters?.search,
  });

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(data);

  // URL sync for filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    
    const newUrl = `/real-estate/dashboard?${params.toString()}`;
    if (newUrl !== window.location.pathname + window.location.search) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, router]);

  // Filter change handler
  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Drill-down handlers
  const handleTaskClick = (taskId: string) => {
    router.push(`/real-estate/tasks/${taskId}`);
  };

  const handleMatterClick = (matterId: string) => {
    router.push(`/real-estate/matters/${matterId}`);
  };

  const handleViewMatterDetails = () => {
    router.push('/real-estate/matters');
  };

  const handleViewFinancialDetails = () => {
    router.push('/real-estate/financial-reports');
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <EffinityHeader 
        title={lang === 'he' ? 'מרכז אוטומציה נדל״ן' : 'Real Estate Automation Hub'}
        subtitle={lang === 'he' ? 'לידים, נכסים, שיווק אוטומטי וניתוח ביצועים' : 'Leads, Properties, Auto-Marketing & Performance Analytics'}
        rightContent={
          <div className="flex gap-3 items-center">
            <button className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white font-medium hover:bg-white/30 transition-all">
              📊 {lang === 'he' ? 'דוח ביצועים' : 'Performance Report'}
            </button>
            <button className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white font-medium hover:bg-white/30 transition-all">
              🎯 {lang === 'he' ? 'קמפיינים חדשים' : 'New Campaigns'}
            </button>
          </div>
        }
      />

      <div className="max-w-8xl mx-auto px-6 py-8">
        {/* Filters Bar */}
        <DashboardFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* KPI Strip */}
        <KPIStrip kpis={dashboardData.kpis} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6 mt-8">
          {/* Sidebar */}
          <Sidebar currentPath="dashboard" />

          {/* Main Content - Real Estate Dashboard Widgets */}
          <div className="col-span-12 md:col-span-10 space-y-6">
            {/* Top Row - Leads & Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeadsQualityWidget 
                data={dashboardData.widgets.leadsQuality}
                onViewDetails={() => router.push('/real-estate/leads')}
                onLeadClick={(leadId) => router.push(`/real-estate/leads/${leadId}`)}
              />
              <ListingsPerformanceWidget 
                data={dashboardData.widgets.listingsPerformance}
                onViewDetails={() => router.push('/real-estate/properties')}
                onListingClick={(listingId) => router.push(`/real-estate/properties/${listingId}`)}
              />
            </div>

            {/* Second Row - Comps & Open Houses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompsWidget 
                data={dashboardData.widgets.comps}
                onViewDetails={() => router.push('/real-estate/comps')}
                onCompClick={(compId) => router.push(`/real-estate/comps/${compId}`)}
              />
              <OpenHouseWidget 
                data={dashboardData.widgets.openHouse}
                onViewDetails={() => router.push('/real-estate/open-houses')}
                onEventClick={(eventId) => router.push(`/real-estate/open-houses/${eventId}`)}
              />
            </div>

            {/* Third Row - Marketing & Guides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AutoMarketingWidget 
                data={dashboardData.widgets.autoMarketing}
                onViewDetails={() => router.push('/real-estate/marketing')}
                onCampaignClick={(campaignId) => router.push(`/real-estate/marketing/${campaignId}`)}
              />
              <NeighborhoodGuideWidget 
                data={dashboardData.widgets.neighborhoodGuides}
                onViewDetails={() => router.push('/real-estate/neighborhood-guides')}
                onGuideClick={(guideId) => router.push(`/real-estate/neighborhood-guides/${guideId}`)}
              />
            </div>

            {/* Bottom Row - Revenue & Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueWidget 
                data={dashboardData.widgets.revenue}
                onViewDetails={() => router.push('/real-estate/revenue')}
                onDealClick={(dealId) => router.push(`/real-estate/deals/${dealId}`)}
              />
              <OperationsWidget 
                alerts={dashboardData.widgets.operations.alerts}
                tasks={dashboardData.widgets.operations.tasks}
                onViewDetails={() => router.push('/real-estate/operations')}
                onAlertClick={(alertId) => router.push(`/real-estate/alerts/${alertId}`)}
                onTaskClick={(taskId) => router.push(`/real-estate/tasks/${taskId}`)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filters Component
function DashboardFilters({ 
  filters, 
  onFilterChange, 
  loading 
}: { 
  filters: DashboardFilters;
  onFilterChange: (key: keyof DashboardFilters, value: string) => void;
  loading: boolean;
}) {
  const { lang } = useLang();
  const { language } = useLanguage();

  const dateRangeOptions = [
    { value: 'last-7-days', label: lang === 'he' ? '7 ימים אחרונים' : 'Last 7 Days' },
    { value: 'last-30-days', label: lang === 'he' ? '30 ימים אחרונים' : 'Last 30 Days' },
    { value: 'last-90-days', label: lang === 'he' ? '90 ימים אחרונים' : 'Last 90 Days' },
    { value: 'last-year', label: lang === 'he' ? 'שנה אחרונה' : 'Last Year' },
    { value: 'custom', label: lang === 'he' ? 'טווח מותאם' : 'Custom Range' }
  ];

  const propertyTypeOptions = [
    { value: '', label: lang === 'he' ? 'כל סוגי הנכסים' : 'All Property Types' },
    { value: 'apartment', label: lang === 'he' ? 'דירה' : 'Apartment' },
    { value: 'house', label: lang === 'he' ? 'בית' : 'House' },
    { value: 'penthouse', label: lang === 'he' ? 'פנטהאוז' : 'Penthouse' },
    { value: 'studio', label: lang === 'he' ? 'סטודיו' : 'Studio' },
    { value: 'office', label: lang === 'he' ? 'משרד' : 'Office' },
    { value: 'commercial', label: lang === 'he' ? 'מסחרי' : 'Commercial' }
  ];

  const statusOptions = [
    { value: '', label: lang === 'he' ? 'כל הסטטוסים' : 'All Statuses' },
    { value: 'draft', label: lang === 'he' ? 'טיוטה' : 'Draft' },
    { value: 'listed', label: lang === 'he' ? 'מפורסם' : 'Listed' },
    { value: 'under-offer', label: lang === 'he' ? 'בהצעה' : 'Under Offer' },
    { value: 'sold', label: lang === 'he' ? 'נמכר' : 'Sold' }
  ];

  const leadSourceOptions = [
    { value: '', label: lang === 'he' ? 'כל המקורות' : 'All Sources' },
    { value: 'meta', label: 'Meta (Facebook/Instagram)' },
    { value: 'google', label: 'Google Ads' },
    { value: 'portal', label: lang === 'he' ? 'פורטלים' : 'Property Portals' },
    { value: 'organic', label: lang === 'he' ? 'אורגני' : 'Organic' },
    { value: 'referral', label: lang === 'he' ? 'המלצה' : 'Referral' }
  ];

  const priceBandOptions = [
    { value: '', label: lang === 'he' ? 'כל הטווחים' : 'All Price Ranges' },
    { value: '0-1000000', label: lang === 'he' ? 'עד מיליון ₪' : 'Up to ₪1M' },
    { value: '1000000-2000000', label: '₪1M - ₪2M' },
    { value: '2000000-3000000', label: '₪2M - ₪3M' },
    { value: '3000000-5000000', label: '₪3M - ₪5M' },
    { value: '5000000-', label: lang === 'he' ? 'מעל 5 מיליון ₪' : '₪5M+' }
  ];

  const bedroomsOptions = [
    { value: '', label: lang === 'he' ? 'כל החדרים' : 'All Bedrooms' },
    { value: '1', label: lang === 'he' ? '1 חדר' : '1 Bedroom' },
    { value: '2', label: lang === 'he' ? '2 חדרים' : '2 Bedrooms' },
    { value: '3', label: lang === 'he' ? '3 חדרים' : '3 Bedrooms' },
    { value: '4', label: lang === 'he' ? '4 חדרים' : '4 Bedrooms' },
    { value: '5+', label: lang === 'he' ? '5+ חדרים' : '5+ Bedrooms' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'טווח תאריכים' : 'Date Range'}
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            disabled={loading}
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Agent/Team */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'סוכן/צוות' : 'Agent/Team'}
          </label>
          <select
            value={filters.agentId || ''}
            onChange={(e) => onFilterChange('agentId', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            disabled={loading}
          >
            <option value="">{lang === 'he' ? 'כל הסוכנים' : 'All Agents'}</option>
            <option value="agent1">Sarah Cohen</option>
            <option value="agent2">David Levi</option>
            <option value="agent3">Rachel Gold</option>
          </select>
        </div>

        {/* City/Neighborhood */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'עיר/שכונה' : 'City/Neighborhood'}
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => onFilterChange('city', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            disabled={loading}
          >
            <option value="">{lang === 'he' ? 'כל הערים' : 'All Cities'}</option>
            <option value="tel-aviv">{lang === 'he' ? 'תל אביב' : 'Tel Aviv'}</option>
            <option value="jerusalem">{lang === 'he' ? 'ירושלים' : 'Jerusalem'}</option>
            <option value="haifa">{lang === 'he' ? 'חיפה' : 'Haifa'}</option>
            <option value="ramat-gan">{lang === 'he' ? 'רמת גן' : 'Ramat Gan'}</option>
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'סוג נכס' : 'Property Type'}
          </label>
          <select
            value={filters.propertyType || ''}
            onChange={(e) => onFilterChange('propertyType', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            disabled={loading}
          >
            {propertyTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'סטטוס' : 'Status'}
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            disabled={loading}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lead Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'מקור ליד' : 'Lead Source'}
          </label>
          <select
            value={filters.leadSource || ''}
            onChange={(e) => onFilterChange('leadSource', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            disabled={loading}
          >
            {leadSourceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Band */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'טווח מחירים' : 'Price Range'}
          </label>
          <select
            value={filters.priceBand || ''}
            onChange={(e) => onFilterChange('priceBand', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            disabled={loading}
          >
            {priceBandOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'חדרי שינה' : 'Bedrooms'}
          </label>
          <select
            value={filters.bedrooms || ''}
            onChange={(e) => onFilterChange('bedrooms', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            disabled={loading}
          >
            {bedroomsOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'חיפוש חופשי' : 'Free Search'}
          </label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder={lang === 'he' ? 'חפש נכסים, לקוחות, כתובות...' : 'Search properties, clients, addresses...'}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            dir={language === 'he' ? 'rtl' : 'ltr'}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}

// KPI Strip Component for Real Estate
function KPIStrip({ kpis }: { kpis: DashboardData['kpis'] }) {
  const { lang } = useLang();

  const kpiItems = [
    {
      key: 'newLeads',
      title: lang === 'he' ? 'לידים חדשים' : 'New Leads',
      value: kpis.newLeads.value,
      delta: kpis.newLeads.delta,
      subtitle: `🔥${kpis.newLeads.hotWarmCold.hot} 🟡${kpis.newLeads.hotWarmCold.warm} 🔵${kpis.newLeads.hotWarmCold.cold}`,
      icon: '🎯',
      color: 'blue'
    },
    {
      key: 'conversionRates',
      title: lang === 'he' ? 'שיעורי המרה' : 'Conversion Rates',
      value: `${kpis.conversionRates.qualified}→${kpis.conversionRates.deal}`,
      delta: kpis.conversionRates.delta,
      subtitle: `${lang === 'he' ? 'ליד→עסקה' : 'Lead→Deal'}`,
      icon: '📈',
      color: 'green'
    },
    {
      key: 'timeToContact',
      title: lang === 'he' ? 'זמן יצירת קשר' : 'Time to Contact',
      value: `${kpis.timeToContact.value}${lang === 'he' ? 'ש' : 'h'}`,
      subtitle: `${kpis.timeToContact.slaMetRate} ${lang === 'he' ? 'עמידה ב-SLA' : 'SLA met'}`,
      icon: '⏱️',
      color: 'purple'
    },
    {
      key: 'scheduledViewings',
      title: lang === 'he' ? 'צפיות מתוכננות' : 'Scheduled Viewings',
      value: kpis.scheduledViewings.value,
      delta: kpis.scheduledViewings.delta,
      subtitle: `${kpis.scheduledViewings.noShowRate} ${lang === 'he' ? 'אי-הגעות' : 'no-shows'}`,
      icon: '🏠',
      color: 'orange'
    },
    {
      key: 'offersCreated',
      title: lang === 'he' ? 'הצעות נוצרו' : 'Offers Created',
      value: kpis.offersCreated.value,
      delta: kpis.offersCreated.delta,
      subtitle: `${kpis.offersCreated.acceptanceRate} ${lang === 'he' ? 'קבלה' : 'acceptance'}`,
      icon: '💼',
      color: 'emerald'
    },
    {
      key: 'avgDOM',
      title: lang === 'he' ? 'ימים ממוצעים בשוק' : 'Avg Days on Market',
      value: `${kpis.avgDOM.value}${lang === 'he' ? 'י' : 'd'}`,
      delta: kpis.avgDOM.delta,
      subtitle: `${kpis.avgDOM.listToSoldRatio} ${lang === 'he' ? 'יחס רשימה→מכירה' : 'list→sold ratio'}`,
      icon: '📅',
      color: 'indigo'
    },
    {
      key: 'roasCAC',
      title: lang === 'he' ? 'ROAS & CAC' : 'ROAS & CAC',
      value: kpis.roasCAC.roas,
      subtitle: `₪${kpis.roasCAC.cac} ${lang === 'he' ? 'CAC' : 'CAC'}`,
      delta: kpis.roasCAC.delta,
      icon: '💰',
      color: 'amber'
    },
    {
      key: 'pipelineValue',
      title: lang === 'he' ? 'ערך צינור מכירות' : 'Pipeline Value',
      value: typeof kpis.pipelineValue.value === 'number' ? `₪${kpis.pipelineValue.value.toLocaleString()}` : kpis.pipelineValue.value,
      delta: kpis.pipelineValue.delta,
      subtitle: `₪${kpis.pipelineValue.expectedCommissions.toLocaleString()} ${lang === 'he' ? 'עמלות צפויות' : 'expected commissions'}`,
      icon: '🚀',
      color: 'rose'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
      {kpiItems.map((item) => (
        <div key={item.key} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-sm font-medium text-gray-600">{item.title}</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {item.value}
              </div>
              {item.subtitle && (
                <div className="text-sm text-gray-500">{item.subtitle}</div>
              )}
            </div>
            {item.delta && (
              <div className={`text-sm font-semibold ${
                item.delta.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.delta}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}



// Export main component with LanguageProvider wrapper
export function RealEstateDashboard({ data, initialFilters }: { data: DashboardData; initialFilters: any }) {
  return (
    <LanguageProvider>
      <RealEstateDashboardContent data={data} initialFilters={initialFilters} />
    </LanguageProvider>
  );
}