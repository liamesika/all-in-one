'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { useLang } from '@/components/i18n/LangProvider';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  StatusBadge,
} from '@/components/shared';
import { BarChart3, Lightbulb, ArrowLeft, Plus, FileText, Users, TrendingUp } from 'lucide-react';

// Types for LawTech AI Hub
interface LawDashboardFilters {
  dateRange: string;
  startDate?: string;
  endDate?: string;
  attorneyId?: string;
  practiceArea?: string;
  matterStage?: string;
  matterStatus?: string;
  leadSource?: string;
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

interface LawDashboardData {
  kpis: {
    activeMatters: KPIData & { breakdown: { litigation: number; corporate: number; family: number; criminal: number; } };
    newIntakes: KPIData & { conversionRate: string; sourceBreakdown: { referral: number; google: number; social: number; direct: number; } };
    billableHours: KPIData & { utilization: string; target: number; };
    realizationRate: KPIData & { collectionRate: string; writeOffs: number; };
    netRevenue: KPIData & { wip: number; growth: string; };
    upcomingDeadlines: KPIData & { overdue: number; next7Days: number; };
    deadlineRisk: KPIData & { level: string; criticalCount: number; };
  };
  widgets: {
    deadlinesTimeline: any[];
    alerts: any[];
    intakeFunnel: any[];
    matterPipeline: any[];
    financialFlow: any[];
    workloadHeatmap: any[];
    productivity: any[];
    documentsAI: any[];
  };
}

function LawDashboardContent({
  data,
  initialFilters
}: {
  data: LawDashboardData;
  initialFilters: any;
}) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [filters, setFilters] = useState<LawDashboardFilters>({
    dateRange: initialFilters?.dateRange || 'last-30-days',
    startDate: initialFilters?.startDate,
    endDate: initialFilters?.endDate,
    attorneyId: initialFilters?.attorneyId,
    practiceArea: initialFilters?.practiceArea,
    matterStage: initialFilters?.matterStage,
    matterStatus: initialFilters?.matterStatus,
    leadSource: initialFilters?.leadSource,
    search: initialFilters?.search,
  });

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<LawDashboardData>(data);

  // URL sync for filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });

    const newUrl = `/dashboard/law/dashboard?${params.toString()}`;
    if (newUrl !== window.location.pathname + window.location.search) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, router]);

  // Filter change handler
  const handleFilterChange = (key: keyof LawDashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Drill-down handlers
  const handleTaskClick = (taskId: string) => {
    router.push(`/law/tasks/${taskId}`);
  };

  const handleMatterClick = (matterId: string) => {
    router.push(`/law/matters/${matterId}`);
  };

  const handleViewMatterDetails = () => {
    router.push('/dashboard/law/matters');
  };

  const handleViewFinancialDetails = () => {
    router.push('/dashboard/law/financial-reports');
  };

  return (
    <main className={`min-h-screen bg-gray-50 dark:bg-[#0E1A2B] ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {lang === 'he' ? 'דשבורד משפטי' : 'Legal Dashboard'}
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-6">
                {lang === 'he' ? 'ניהול מקרים ופעילות משפטית' : 'Manage cases and legal activities'}
              </p>
            </div>
            <div className="flex gap-4">
              <UniversalButton
                variant="outline"
                leftIcon={<BarChart3 className="w-5 h-5" />}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                {lang === 'he' ? 'דוח ביצועים' : 'Performance Report'}
              </UniversalButton>
              <UniversalButton
                variant="outline"
                leftIcon={<Lightbulb className="w-5 h-5" />}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                {lang === 'he' ? 'אוטומציה AI' : 'AI Automation'}
              </UniversalButton>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Bar */}
        <LawDashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* KPI Strip */}
        <LawKPIStrip kpis={dashboardData.kpis} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6 mt-8">
          {/* Sidebar */}
          <LawSidebar currentPath="dashboard" />

          {/* Main Content - Law Dashboard Widgets */}
          <div className="col-span-12 md:col-span-10 space-y-6">
            {/* Top Row - Deadlines & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DeadlinesTimeline
                  data={dashboardData.widgets.deadlinesTimeline}
                  onTaskClick={handleTaskClick}
                  onMatterClick={handleMatterClick}
                />
              </div>
              <div className="lg:col-span-1">
                <AlertsPanel data={dashboardData.widgets.alerts} />
              </div>
            </div>

            {/* Second Row - Intake & Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IntakeFunnel
                data={dashboardData.widgets.intakeFunnel}
                onViewDetails={() => router.push('/dashboard/law/intake')}
              />
              <MatterPipeline
                data={dashboardData.widgets.matterPipeline}
                onMatterClick={handleMatterClick}
                onViewDetails={handleViewMatterDetails}
              />
            </div>

            {/* Third Row - Financial & Workload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FinancialFlow
                data={dashboardData.widgets.financialFlow}
                onViewDetails={handleViewFinancialDetails}
                onMatterClick={handleMatterClick}
              />
              <WorkloadHeatmap
                data={dashboardData.widgets.workloadHeatmap}
                onViewDetails={() => router.push('/dashboard/law/workload')}
              />
            </div>

            {/* Bottom Row - Productivity & AI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductivityMetrics
                data={dashboardData.widgets.productivity}
                onViewDetails={() => router.push('/dashboard/law/productivity')}
              />
              <DocumentsAI
                data={dashboardData.widgets.documentsAI}
                onViewDetails={() => router.push('/dashboard/law/documents')}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Filters Component
function LawDashboardFilters({
  filters,
  onFilterChange,
  loading
}: {
  filters: LawDashboardFilters;
  onFilterChange: (key: keyof LawDashboardFilters, value: string) => void;
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

  const practiceAreaOptions = [
    { value: '', label: lang === 'he' ? 'כל תחומי העיסוק' : 'All Practice Areas' },
    { value: 'litigation', label: lang === 'he' ? 'ליטיגציה' : 'Litigation' },
    { value: 'corporate', label: lang === 'he' ? 'תאגידי' : 'Corporate' },
    { value: 'family', label: lang === 'he' ? 'משפחה' : 'Family Law' },
    { value: 'criminal', label: lang === 'he' ? 'פלילי' : 'Criminal Law' },
    { value: 'real-estate', label: lang === 'he' ? 'נדל״ן' : 'Real Estate' },
    { value: 'employment', label: lang === 'he' ? 'עבודה' : 'Employment' }
  ];

  const matterStageOptions = [
    { value: '', label: lang === 'he' ? 'כל השלבים' : 'All Stages' },
    { value: 'intake', label: lang === 'he' ? 'קליטה' : 'Intake' },
    { value: 'open', label: lang === 'he' ? 'פתוח' : 'Open' },
    { value: 'discovery', label: lang === 'he' ? 'חקירה' : 'Discovery' },
    { value: 'negotiation', label: lang === 'he' ? 'משא ומתן' : 'Negotiation' },
    { value: 'trial', label: lang === 'he' ? 'משפט' : 'Trial' },
    { value: 'settlement', label: lang === 'he' ? 'פשרה' : 'Settlement' },
    { value: 'closed', label: lang === 'he' ? 'סגור' : 'Closed' }
  ];

  const matterStatusOptions = [
    { value: '', label: lang === 'he' ? 'כל הסטטוסים' : 'All Statuses' },
    { value: 'active', label: lang === 'he' ? 'פעיל' : 'Active' },
    { value: 'on-hold', label: lang === 'he' ? 'בהמתנה' : 'On Hold' },
    { value: 'closed', label: lang === 'he' ? 'סגור' : 'Closed' },
    { value: 'cancelled', label: lang === 'he' ? 'בוטל' : 'Cancelled' }
  ];

  const leadSourceOptions = [
    { value: '', label: lang === 'he' ? 'כל המקורות' : 'All Sources' },
    { value: 'referral', label: lang === 'he' ? 'המלצה' : 'Referral' },
    { value: 'google', label: 'Google' },
    { value: 'social', label: lang === 'he' ? 'רשתות חברתיות' : 'Social Media' },
    { value: 'direct', label: lang === 'he' ? 'ישיר' : 'Direct' },
    { value: 'advertising', label: lang === 'he' ? 'פרסום' : 'Advertising' }
  ];

  return (
    <UniversalCard variant="default" className="mb-6">
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'he' ? 'טווח תאריכים' : 'Date Range'}
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              disabled={loading}
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Attorney/Team */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'he' ? 'עורך דין/צוות' : 'Attorney/Team'}
            </label>
            <select
              value={filters.attorneyId || ''}
              onChange={(e) => onFilterChange('attorneyId', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              disabled={loading}
            >
              <option value="">{lang === 'he' ? 'כל עורכי הדין' : 'All Attorneys'}</option>
              <option value="attorney1">יעקב כהן</option>
              <option value="attorney2">שרה לוי</option>
              <option value="attorney3">דוד רוזנברג</option>
            </select>
          </div>

          {/* Practice Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'he' ? 'תחום עיסוק' : 'Practice Area'}
            </label>
            <select
              value={filters.practiceArea || ''}
              onChange={(e) => onFilterChange('practiceArea', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              disabled={loading}
            >
              {practiceAreaOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Matter Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'he' ? 'שלב תיק' : 'Matter Stage'}
            </label>
            <select
              value={filters.matterStage || ''}
              onChange={(e) => onFilterChange('matterStage', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              disabled={loading}
            >
              {matterStageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'he' ? 'מקור ליד' : 'Lead Source'}
            </label>
            <select
              value={filters.leadSource || ''}
              onChange={(e) => onFilterChange('leadSource', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              disabled={loading}
            >
              {leadSourceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'he' ? 'חיפוש חופשי' : 'Free Search'}
            </label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder={lang === 'he' ? 'חפש תיקים, לקוחות, משימות...' : 'Search matters, clients, tasks...'}
              className="w-full px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50"
              dir={language === 'he' ? 'rtl' : 'ltr'}
              disabled={loading}
            />
          </div>
        </div>
      </CardBody>
    </UniversalCard>
  );
}

// KPI Strip Component for Law
function LawKPIStrip({ kpis }: { kpis: LawDashboardData['kpis'] }) {
  const { lang } = useLang();

  const kpiItems = [
    {
      key: 'activeMatters',
      title: lang === 'he' ? 'תיקים פעילים' : 'Active Matters',
      value: kpis.activeMatters.value,
      delta: kpis.activeMatters.delta,
      subtitle: `${Object.values(kpis.activeMatters.breakdown).reduce((a, b) => a + b, 0)} ${lang === 'he' ? 'סך הכל' : 'total'}`,
      icon: '📁',
      color: 'blue'
    },
    {
      key: 'newIntakes',
      title: lang === 'he' ? 'קליטות חדשות' : 'New Intakes',
      value: kpis.newIntakes.value,
      delta: kpis.newIntakes.delta,
      subtitle: `${kpis.newIntakes.conversionRate} ${lang === 'he' ? 'המרה' : 'conversion'}`,
      icon: '🎯',
      color: 'green'
    },
    {
      key: 'billableHours',
      title: lang === 'he' ? 'שעות חיוב' : 'Billable Hours',
      value: kpis.billableHours.value,
      delta: kpis.billableHours.delta,
      subtitle: `${kpis.billableHours.utilization} ${lang === 'he' ? 'ניצול' : 'utilization'}`,
      icon: '⏰',
      color: 'purple'
    },
    {
      key: 'realizationRate',
      title: lang === 'he' ? 'שיעור מימוש' : 'Realization Rate',
      value: kpis.realizationRate.value,
      delta: kpis.realizationRate.delta,
      subtitle: `${kpis.realizationRate.collectionRate} ${lang === 'he' ? 'גביה' : 'collection'}`,
      icon: '💰',
      color: 'emerald'
    },
    {
      key: 'netRevenue',
      title: lang === 'he' ? 'הכנסה נטו' : 'Net Revenue',
      value: typeof kpis.netRevenue.value === 'number' ? `₪${kpis.netRevenue.value.toLocaleString()}` : kpis.netRevenue.value,
      delta: kpis.netRevenue.delta,
      subtitle: `₪${kpis.netRevenue.wip.toLocaleString()} WIP`,
      icon: '📈',
      color: 'amber'
    },
    {
      key: 'upcomingDeadlines',
      title: lang === 'he' ? 'דדליינים קרובים' : 'Upcoming Deadlines',
      value: kpis.upcomingDeadlines.value,
      delta: kpis.upcomingDeadlines.delta,
      subtitle: `${kpis.upcomingDeadlines.overdue} ${lang === 'he' ? 'באיחור' : 'overdue'}`,
      icon: '⚠️',
      color: 'orange'
    },
    {
      key: 'deadlineRisk',
      title: lang === 'he' ? 'ציון סיכון דדליין' : 'Deadline Risk Score',
      value: kpis.deadlineRisk.value,
      delta: kpis.deadlineRisk.delta,
      subtitle: `${kpis.deadlineRisk.level} ${lang === 'he' ? 'רמה' : 'level'}`,
      icon: '🚨',
      color: 'red'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiItems.map((item) => (
        <UniversalCard key={item.key} variant="default" hoverable>
          <CardBody>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.title}</h3>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {item.value}
                </div>
                {item.subtitle && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.subtitle}</div>
                )}
              </div>
              {item.delta && (
                <div className={`text-sm font-semibold ${
                  item.delta.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {item.delta}
                </div>
              )}
            </div>
          </CardBody>
        </UniversalCard>
      ))}
    </div>
  );
}

// Sidebar Component
function LawSidebar({ currentPath = 'dashboard' }: { currentPath?: string }) {
  const { lang } = useLang();

  const navigationItems = [
    {
      href: '/dashboard/law/dashboard',
      label: lang === 'he' ? 'דשבורד' : 'Dashboard',
      key: 'dashboard',
      icon: '📊'
    },
    {
      href: '/dashboard/law/matters',
      label: lang === 'he' ? 'תיקים' : 'Matters',
      key: 'matters',
      icon: '📁'
    },
    {
      href: '/dashboard/law/clients',
      label: lang === 'he' ? 'לקוחות' : 'Clients',
      key: 'clients',
      icon: '👥'
    },
    {
      href: '/dashboard/law/calendar',
      label: lang === 'he' ? 'יומן' : 'Calendar',
      key: 'calendar',
      icon: '📅'
    },
    {
      href: '/dashboard/law/documents',
      label: lang === 'he' ? 'מסמכים' : 'Documents',
      key: 'documents',
      icon: '📄'
    },
    {
      href: '/dashboard/law/time-tracking',
      label: lang === 'he' ? 'רישום זמן' : 'Time Tracking',
      key: 'time-tracking',
      icon: '⏱️'
    },
    {
      href: '/dashboard/law/billing',
      label: lang === 'he' ? 'חיוב' : 'Billing',
      key: 'billing',
      icon: '💳'
    },
    {
      href: '/dashboard/law/reports',
      label: lang === 'he' ? 'דוחות' : 'Reports',
      key: 'reports',
      icon: '📈'
    }
  ];

  return (
    <aside className="hidden md:block col-span-2">
      <UniversalCard variant="default" className="sticky top-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">E</div>
            <div className="font-semibold text-gray-900 dark:text-white">EFFINITY</div>
          </div>

          <nav className="space-y-1 text-sm">
            {navigationItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  currentPath === item.key
                    ? 'bg-[#2979FF]/10 text-[#2979FF] font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-[#1A2F4B] text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="mt-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-3 text-xs">
            <div className="font-medium mb-1 text-gray-900 dark:text-white">
              {lang === 'he' ? 'טיפ מקצועי' : 'Pro Tip'}
            </div>
            <p className="text-blue-700 dark:text-blue-300">
              {lang === 'he'
                ? 'השתמש בפילטרים העליונים לצמצום הנתונים לתקופות או תחומי עיסוק ספציפיים'
                : 'Use the top filters to narrow down data to specific time periods or practice areas'
              }
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {lang === 'he' ? 'גישה מהירה' : 'Quick Actions'}
            </div>
            <div className="space-y-2">
              <UniversalButton
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
              >
                {lang === 'he' ? '+ תיק חדש' : '+ New Matter'}
              </UniversalButton>
              <UniversalButton
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
              >
                {lang === 'he' ? '+ לקוח חדש' : '+ New Client'}
              </UniversalButton>
              <UniversalButton
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
              >
                {lang === 'he' ? 'יצירת דוח' : 'Generate Report'}
              </UniversalButton>
            </div>
          </div>
        </CardBody>
      </UniversalCard>
    </aside>
  );
}

// Placeholder components - will be implemented next
function DeadlinesTimeline({ data, onTaskClick, onMatterClick }: any) {
  const { lang } = useLang();
  return (
    <UniversalCard variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {lang === 'he' ? 'ציר זמן דדליינים' : 'Deadlines Timeline'}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
        </div>
      </CardBody>
    </UniversalCard>
  );
}

function AlertsPanel({ data }: any) {
  const { lang } = useLang();
  return (
    <UniversalCard variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {lang === 'he' ? 'התראות וחריגות' : 'Alerts & Exceptions'}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
        </div>
      </CardBody>
    </UniversalCard>
  );
}

function IntakeFunnel({ data, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <UniversalCard variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {lang === 'he' ? 'משפך קליטה' : 'Intake Funnel'}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
        </div>
      </CardBody>
    </UniversalCard>
  );
}

function MatterPipeline({ data, onMatterClick, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <UniversalCard variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {lang === 'he' ? 'פיפליין תיקים' : 'Matter Pipeline'}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
        </div>
      </CardBody>
    </UniversalCard>
  );
}

function FinancialFlow({ data, onViewDetails, onMatterClick }: any) {
  const { lang } = useLang();
  return (
    <UniversalCard variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {lang === 'he' ? 'זרימה פיננסית' : 'Financial Flow & A/R'}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
        </div>
      </CardBody>
    </UniversalCard>
  );
}

function WorkloadHeatmap({ data, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <UniversalCard variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {lang === 'he' ? 'מפת עומסי עבודה' : 'Workload Heatmap'}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
        </div>
      </CardBody>
    </UniversalCard>
  );
}

function ProductivityMetrics({ data, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <UniversalCard variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {lang === 'he' ? 'פרודוקטיביות ושירות' : 'Productivity & Service'}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
        </div>
      </CardBody>
    </UniversalCard>
  );
}

function DocumentsAI({ data, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <UniversalCard variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {lang === 'he' ? 'מסמכים ושימוש ב-AI' : 'Documents & AI Usage'}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
        </div>
      </CardBody>
    </UniversalCard>
  );
}

// Export main component with LanguageProvider wrapper
export function LawDashboard({ data, initialFilters }: { data: LawDashboardData; initialFilters: any }) {
  return (
    <LanguageProvider>
      <LawDashboardContent data={data} initialFilters={initialFilters} />
    </LanguageProvider>
  );
}
