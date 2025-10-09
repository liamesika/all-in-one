'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { useLang } from '@/components/i18n/LangProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

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
    
    const newUrl = `/law/dashboard?${params.toString()}`;
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
    <div className={`min-h-screen bg-white ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12 lg:py-16">
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                {lang === 'he' ? 'דשבורד משפטי' : 'Legal Dashboard'}
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-6">
                {lang === 'he' ? 'ניהול מקרים ופעילות משפטית' : 'Manage cases and legal activities'}
              </p>
            </div>
            <div className="flex gap-4">
              <button className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {lang === 'he' ? 'דוח ביצועים' : 'Performance Report'}
              </button>
              <button className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {lang === 'he' ? 'אוטומציה AI' : 'AI Automation'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-8xl mx-auto px-6 py-8">
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
    </div>
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

        {/* Attorney/Team */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'עורך דין/צוות' : 'Attorney/Team'}
          </label>
          <select
            value={filters.attorneyId || ''}
            onChange={(e) => onFilterChange('attorneyId', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'תחום עיסוק' : 'Practice Area'}
          </label>
          <select
            value={filters.practiceArea || ''}
            onChange={(e) => onFilterChange('practiceArea', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'שלב תיק' : 'Matter Stage'}
          </label>
          <select
            value={filters.matterStage || ''}
            onChange={(e) => onFilterChange('matterStage', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
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

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lang === 'he' ? 'חיפוש חופשי' : 'Free Search'}
          </label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder={lang === 'he' ? 'חפש תיקים, לקוחות, משימות...' : 'Search matters, clients, tasks...'}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
            dir={language === 'he' ? 'rtl' : 'ltr'}
            disabled={loading}
          />
        </div>
      </div>
    </div>
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

// Sidebar Component
function LawSidebar({ currentPath = 'dashboard' }: { currentPath?: string }) {
  const { lang } = useLang();

  const navigationItems = [
    {
      href: '/law/dashboard',
      label: lang === 'he' ? 'דשבורד' : 'Dashboard',
      key: 'dashboard',
      icon: '📊'
    },
    {
      href: '/law/matters', 
      label: lang === 'he' ? 'תיקים' : 'Matters',
      key: 'matters',
      icon: '📁'
    },
    {
      href: '/law/clients',
      label: lang === 'he' ? 'לקוחות' : 'Clients',
      key: 'clients',
      icon: '👥'
    },
    {
      href: '/law/calendar',
      label: lang === 'he' ? 'יומן' : 'Calendar',
      key: 'calendar',
      icon: '📅'
    },
    {
      href: '/law/documents',
      label: lang === 'he' ? 'מסמכים' : 'Documents',
      key: 'documents',
      icon: '📄'
    },
    {
      href: '/law/time-tracking',
      label: lang === 'he' ? 'רישום זמן' : 'Time Tracking',
      key: 'time-tracking',
      icon: '⏱️'
    },
    {
      href: '/law/billing',
      label: lang === 'he' ? 'חיוב' : 'Billing',
      key: 'billing',
      icon: '💳'
    },
    {
      href: '/law/reports',
      label: lang === 'he' ? 'דוחות' : 'Reports',
      key: 'reports',
      icon: '📈'
    }
  ];

  return (
    <aside className="hidden md:block col-span-2">
      <div className="sticky top-6 rounded-2xl bg-white shadow-xl border p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">E</div>
          <div className="font-semibold">EFFINITY</div>
        </div>
        
        <nav className="space-y-1 text-sm">
          {navigationItems.map((item) => (
            <a 
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                currentPath === item.key
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs">
          <div className="font-medium mb-1">
            {lang === 'he' ? 'טיפ מקצועי' : 'Pro Tip'}
          </div>
          <p className="text-blue-700">
            {lang === 'he' 
              ? 'השתמש בפילטרים העליונים לצמצום הנתונים לתקופות או תחומי עיסוק ספציפיים'
              : 'Use the top filters to narrow down data to specific time periods or practice areas'
            }
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">
            {lang === 'he' ? 'גישה מהירה' : 'Quick Actions'}
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              {lang === 'he' ? '+ תיק חדש' : '+ New Matter'}
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              {lang === 'he' ? '+ לקוח חדש' : '+ New Client'}  
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              {lang === 'he' ? 'יצירת דוח' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Placeholder components - will be implemented next
function DeadlinesTimeline({ data, onTaskClick, onMatterClick }: any) {
  const { lang } = useLang();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {lang === 'he' ? 'ציר זמן דדליינים' : 'Deadlines Timeline'}
      </h3>
      <div className="h-48 flex items-center justify-center text-gray-500">
        {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
      </div>
    </div>
  );
}

function AlertsPanel({ data }: any) {
  const { lang } = useLang();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {lang === 'he' ? 'התראות וחריגות' : 'Alerts & Exceptions'}
      </h3>
      <div className="h-48 flex items-center justify-center text-gray-500">
        {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
      </div>
    </div>
  );
}

function IntakeFunnel({ data, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {lang === 'he' ? 'משפך קליטה' : 'Intake Funnel'}
      </h3>
      <div className="h-48 flex items-center justify-center text-gray-500">
        {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
      </div>
    </div>
  );
}

function MatterPipeline({ data, onMatterClick, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {lang === 'he' ? 'פיפליין תיקים' : 'Matter Pipeline'}
      </h3>
      <div className="h-48 flex items-center justify-center text-gray-500">
        {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
      </div>
    </div>
  );
}

function FinancialFlow({ data, onViewDetails, onMatterClick }: any) {
  const { lang } = useLang();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {lang === 'he' ? 'זרימה פיננסית' : 'Financial Flow & A/R'}
      </h3>
      <div className="h-48 flex items-center justify-center text-gray-500">
        {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
      </div>
    </div>
  );
}

function WorkloadHeatmap({ data, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {lang === 'he' ? 'מפת עומסי עבודה' : 'Workload Heatmap'}
      </h3>
      <div className="h-48 flex items-center justify-center text-gray-500">
        {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
      </div>
    </div>
  );
}

function ProductivityMetrics({ data, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {lang === 'he' ? 'פרודוקטיביות ושירות' : 'Productivity & Service'}
      </h3>
      <div className="h-48 flex items-center justify-center text-gray-500">
        {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
      </div>
    </div>
  );
}

function DocumentsAI({ data, onViewDetails }: any) {
  const { lang } = useLang();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {lang === 'he' ? 'מסמכים ושימוש ב-AI' : 'Documents & AI Usage'}
      </h3>
      <div className="h-48 flex items-center justify-center text-gray-500">
        {lang === 'he' ? 'יטען בקרוב...' : 'Loading soon...'}
      </div>
    </div>
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