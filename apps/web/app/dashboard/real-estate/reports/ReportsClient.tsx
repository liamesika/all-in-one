'use client';

/**
 * Reports Client Component (Redesigned with Design System 2.0)
 * Analytics dashboard with KPIs and charts
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { TrendingUp, TrendingDown, Clock, DollarSign, Users, Target, BarChart3, Download } from 'lucide-react';
import { ExportPDFButton } from '@/components/real-estate/reports/ExportPDFButton';
import { ExportExcelButton } from '@/components/real-estate/reports/ExportExcelButton';
import { LeadsOverTimeChart } from '@/components/real-estate/reports/charts/LeadsOverTimeChart';
import { LeadsBySourceChart } from '@/components/real-estate/reports/charts/LeadsBySourceChart';
import { LeadStatusChart } from '@/components/real-estate/reports/charts/LeadStatusChart';
import { PropertiesPerformanceChart } from '@/components/real-estate/reports/charts/PropertiesPerformanceChart';
import { ResponseTimeTrendChart } from '@/components/real-estate/reports/charts/ResponseTimeTrendChart';
import { RevenueByTypeChart } from '@/components/real-estate/reports/charts/RevenueByTypeChart';

// Import unified components
import {
  UniversalCard,
  CardHeader,
  CardBody,
} from '@/components/shared';

interface ReportData {
  kpis: {
    totalLeads: number;
    totalLeadsTrend: number;
    conversionRate: number;
    conversionRateTrend: number;
    avgResponseTime: string;
    avgResponseTimeTrend: number;
    totalRevenue: number;
    totalRevenueTrend: number;
  };
  leadsOverTime: Array<{ date: string; count: number }>;
  leadsBySource: Array<{ source: string; count: number; percentage: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  topProperties: Array<{ name: string; views: number; leads: number }>;
  responseTimeTrend: Array<{ date: string; avgHours: number }>;
  revenueByType: Array<{ type: 'SALE' | 'RENT'; amount: number }>;
}

interface ReportsClientProps {
  initialData: ReportData;
}

export default function ReportsClient({ initialData }: ReportsClientProps) {
  const { language } = useLanguage();
  const [reportData, setReportData] = useState<ReportData>(initialData);
  const [dateRange, setDateRange] = useState('last30');
  const [filters, setFilters] = useState({
    agentId: '',
    propertyType: '',
    transactionType: '',
    source: '',
  });
  const [loading, setLoading] = useState(false);

  const t = {
    title: language === 'he' ? 'דוחות וניתוח' : 'Reports & Analytics',
    dateRange: language === 'he' ? 'טווח תאריכים' : 'Date Range',
    last7Days: language === 'he' ? '7 ימים אחרונים' : 'Last 7 Days',
    last30Days: language === 'he' ? '30 ימים אחרונים' : 'Last 30 Days',
    last90Days: language === 'he' ? '90 ימים אחרונים' : 'Last 90 Days',
    custom: language === 'he' ? 'מותאם אישית' : 'Custom',
    filters: language === 'he' ? 'פילטרים' : 'Filters',
    agent: language === 'he' ? 'סוכן' : 'Agent',
    propertyType: language === 'he' ? 'סוג נכס' : 'Property Type',
    transactionType: language === 'he' ? 'סוג עסקה' : 'Transaction Type',
    source: language === 'he' ? 'מקור' : 'Source',
    all: language === 'he' ? 'הכל' : 'All',
    totalLeads: language === 'he' ? 'סה"כ לידים' : 'Total Leads',
    conversionRate: language === 'he' ? 'שיעור המרה' : 'Conversion Rate',
    avgResponseTime: language === 'he' ? 'זמן תגובה ממוצע' : 'Avg Response Time',
    totalRevenue: language === 'he' ? 'סה"כ הכנסות' : 'Total Revenue',
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange, filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateRange,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
      });

      const response = await fetch(`/api/real-estate/reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch report data');

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const renderTrendText = (trend: number) => {
    const sign = trend > 0 ? '+' : '';
    const color = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400';
    return (
      <span className={`text-sm ${color} flex items-center gap-1`}>
        {renderTrendIcon(trend)}
        {sign}{trend.toFixed(1)}%
      </span>
    );
  };

  const KPICard = ({
    title,
    value,
    trend,
    icon: Icon,
    formatter = (v: any) => v.toString()
  }: {
    title: string;
    value: any;
    trend: number;
    icon: any;
    formatter?: (v: any) => string;
  }) => (
    <UniversalCard variant="default" hoverable>
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-body-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          <div className="flex items-center justify-center w-10 h-10 bg-[#2979FF]/10 rounded-lg">
            <Icon className="w-5 h-5 text-[#2979FF]" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-heading-2 font-bold text-gray-900 dark:text-white">{formatter(value)}</p>
            <div className="mt-1">{renderTrendText(trend)}</div>
          </div>
        </div>
      </CardBody>
    </UniversalCard>
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
              {t.title}
            </h1>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              {language === 'he' ? 'נתח את הביצועים שלך עם דוחות מקיפים' : 'Analyze your performance with comprehensive reports'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportExcelButton
              reportData={reportData}
              dateRange={dateRange}
              language={language}
            />
            <ExportPDFButton
              reportData={reportData}
              dateRange={dateRange}
              language={language}
            />
          </div>
        </div>

        {/* Date Range and Filters */}
        <UniversalCard variant="default">
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="block text-body-sm font-medium text-gray-900 dark:text-white">
                  {t.dateRange}
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                >
                  <option value="last7">{t.last7Days}</option>
                  <option value="last30">{t.last30Days}</option>
                  <option value="last90">{t.last90Days}</option>
                </select>
              </div>

              {/* Property Type Filter */}
              <div className="space-y-2">
                <label className="block text-body-sm font-medium text-gray-900 dark:text-white">
                  {t.propertyType}
                </label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                >
                  <option value="">{t.all}</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="LOT">Land</option>
                </select>
              </div>

              {/* Transaction Type Filter */}
              <div className="space-y-2">
                <label className="block text-body-sm font-medium text-gray-900 dark:text-white">
                  {t.transactionType}
                </label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                >
                  <option value="">{t.all}</option>
                  <option value="SALE">Sale</option>
                  <option value="RENT">Rent</option>
                </select>
              </div>

              {/* Source Filter */}
              <div className="space-y-2">
                <label className="block text-body-sm font-medium text-gray-900 dark:text-white">
                  {t.source}
                </label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
                >
                  <option value="">{t.all}</option>
                  <option value="Website">Website</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Google">Google</option>
                  <option value="Referral">Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </CardBody>
        </UniversalCard>

      {/* Reports Container for PDF Export */}
      <div id="reports-container" className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title={t.totalLeads}
            value={reportData.kpis.totalLeads}
            trend={reportData.kpis.totalLeadsTrend}
            icon={Users}
          />
          <KPICard
            title={t.conversionRate}
            value={reportData.kpis.conversionRate}
            trend={reportData.kpis.conversionRateTrend}
            icon={Target}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
          <KPICard
            title={t.avgResponseTime}
            value={reportData.kpis.avgResponseTime}
            trend={reportData.kpis.avgResponseTimeTrend}
            icon={Clock}
          />
          <KPICard
            title={t.totalRevenue}
            value={reportData.kpis.totalRevenue}
            trend={reportData.kpis.totalRevenueTrend}
            icon={DollarSign}
            formatter={formatCurrency}
          />
        </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads Over Time */}
            <UniversalCard variant="default">
              <CardBody className="p-6">
                <LeadsOverTimeChart data={reportData.leadsOverTime} language={language} />
              </CardBody>
            </UniversalCard>

            {/* Leads by Source */}
            <UniversalCard variant="default">
              <CardBody className="p-6">
                <LeadsBySourceChart data={reportData.leadsBySource} language={language} />
              </CardBody>
            </UniversalCard>

            {/* Lead Status Distribution */}
            <UniversalCard variant="default">
              <CardBody className="p-6">
                <LeadStatusChart data={reportData.leadsByStatus} language={language} />
              </CardBody>
            </UniversalCard>

            {/* Properties Performance */}
            <UniversalCard variant="default">
              <CardBody className="p-6">
                <PropertiesPerformanceChart data={reportData.topProperties} language={language} />
              </CardBody>
            </UniversalCard>

            {/* Response Time Trend */}
            <UniversalCard variant="default">
              <CardBody className="p-6">
                <ResponseTimeTrendChart data={reportData.responseTimeTrend} language={language} />
              </CardBody>
            </UniversalCard>

            {/* Revenue by Type */}
            <UniversalCard variant="default">
              <CardBody className="p-6">
                <RevenueByTypeChart data={reportData.revenueByType} language={language} />
              </CardBody>
            </UniversalCard>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <UniversalCard variant="default">
              <CardBody className="p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF] mx-auto"></div>
                <p className="text-gray-900 dark:text-white mt-4 text-center">
                  {language === 'he' ? 'טוען דוחות...' : 'Loading reports...'}
                </p>
              </CardBody>
            </UniversalCard>
          </div>
        )}
      </div>
    </main>
  );
}
