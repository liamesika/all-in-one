'use client';

import { RealEstateHeader } from '@/components/dashboard/RealEstateHeader';
import { NotificationSystem } from '@/components/dashboard/NotificationSystem';
import { KPICard } from '@/components/dashboard/KPICard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { QuickStatsBar } from '@/components/dashboard/QuickStatsBar';
import { FloatingActionButton } from '@/components/dashboard/FloatingActionButton';
import { LeadsMarketingSection } from './components/sections/LeadsMarketingSection';
import { ListingsInventorySection } from './components/sections/ListingsInventorySection';
import { DealsRevenueSection } from './components/sections/DealsRevenueSection';
import { OperationsProductivitySection } from './components/sections/OperationsProductivitySection';
import { ClientExperienceSection } from './components/sections/ClientExperienceSection';
import { MarketIntelligenceSection } from './components/sections/MarketIntelligenceSection';
import { ComplianceRiskSection } from './components/sections/ComplianceRiskSection';
import { AutomationHealthSection } from './components/sections/AutomationHealthSection';
import { useLang } from '@/components/i18n/LangProvider';
import { LanguageProvider } from '@/lib/language-context';
import { useState } from 'react';

// Mock data generator - replace with actual API data
function generateMockData() {
  return {
    notifications: [
      {
        id: '1',
        type: 'warning' as const,
        message: '5 properties need price adjustments based on market trends',
        actionLabel: 'Review',
        onAction: () => console.log('Review properties'),
        autoDismiss: true,
        dismissTime: 8000,
      },
      {
        id: '2',
        type: 'info' as const,
        message: '12 new qualified leads waiting for contact',
        actionLabel: 'View Leads',
        onAction: () => console.log('View leads'),
        autoDismiss: true,
        dismissTime: 8000,
      },
      {
        id: '3',
        type: 'success' as const,
        message: 'Monthly revenue target achieved! $285K closed this month.',
        autoDismiss: true,
        dismissTime: 6000,
      },
    ],
    kpis: {
      totalLeads: 245,
      activeListings: 67,
      dealsClosed: 12,
      revenue: 285000,
      conversionRate: 28,
      avgDOM: 32,
      satisfaction: 94,
      automatedTasks: 156,
    },
    leads: {
      leadsToday: 45,
      qualified: 32,
      cpl: 125,
      convRate: 28,
      leadsTrend: [
        { label: 'Mon', value: 38, date: 'Jan 20, 2025' },
        { label: 'Tue', value: 42, date: 'Jan 21, 2025' },
        { label: 'Wed', value: 45, date: 'Jan 22, 2025' },
        { label: 'Thu', value: 41, date: 'Jan 23, 2025' },
        { label: 'Fri', value: 48, date: 'Jan 24, 2025' },
        { label: 'Sat', value: 35, date: 'Jan 25, 2025' },
        { label: 'Sun', value: 30, date: 'Jan 26, 2025' },
      ],
      leadsBySource: [
        { label: 'Facebook', value: 85, color: '#2979FF' },
        { label: 'Google', value: 62, color: '#6EA8FE' },
        { label: 'Instagram', value: 48, color: '#4A90E2' },
        { label: 'Referral', value: 35, color: '#7B68EE' },
        { label: 'Organic', value: 15, color: '#20B2AA' },
      ],
    },
    listings: {
      activeListings: 67,
      avgDOM: 32,
      priceReductions: 8,
      viewingsScheduled: 24,
      listingsByStatus: [
        { label: 'Active', value: 45, color: '#10B981' },
        { label: 'Pending', value: 12, color: '#FFB347' },
        { label: 'Under Offer', value: 8, color: '#6EA8FE' },
        { label: 'Sold', value: 2, color: '#2979FF' },
      ],
      priceTrend: [
        { label: 'Jan', value: 4500 },
        { label: 'Feb', value: 4600 },
        { label: 'Mar', value: 4750 },
        { label: 'Apr', value: 4850 },
        { label: 'May', value: 4900 },
        { label: 'Jun', value: 5100 },
      ],
    },
    deals: {
      dealsThisMonth: 12,
      totalRevenue: 285000,
      avgCommission: 23750,
      pipelineValue: 1850000,
      revenueTrend: [
        { label: 'Jan', value: 185000 },
        { label: 'Feb', value: 215000 },
        { label: 'Mar', value: 245000 },
        { label: 'Apr', value: 265000 },
        { label: 'May', value: 285000 },
        { label: 'Jun', value: 310000 },
      ],
      dealsByAgent: [
        { label: 'Sarah C.', value: 5, color: '#2979FF' },
        { label: 'David L.', value: 4, color: '#6EA8FE' },
        { label: 'Rachel G.', value: 3, color: '#4A90E2' },
      ],
    },
    operations: {
      tasksCompleted: 156,
      avgResponseTime: 2.3,
      appointmentsToday: 8,
      documentsPending: 12,
      tasksByPriority: [
        { label: 'High', value: 23, color: '#EF4444' },
        { label: 'Medium', value: 45, color: '#FFB347' },
        { label: 'Low', value: 32, color: '#10B981' },
      ],
      agentActivity: [
        { label: 'Sarah', value: 85, color: '#2979FF' },
        { label: 'David', value: 72, color: '#6EA8FE' },
        { label: 'Rachel', value: 68, color: '#4A90E2' },
      ],
    },
    clientExperience: {
      satisfaction: 94,
      nps: 72,
      reviewsThisMonth: 28,
      referrals: 15,
      feedbackByRating: [
        { label: '5 Star', value: 85, color: '#10B981' },
        { label: '4 Star', value: 32, color: '#6EA8FE' },
        { label: '3 Star', value: 8, color: '#FFB347' },
        { label: '2 Star', value: 2, color: '#EF4444' },
      ],
      communicationChannels: [
        { label: 'Email', value: 125, color: '#2979FF' },
        { label: 'Phone', value: 98, color: '#6EA8FE' },
        { label: 'WhatsApp', value: 76, color: '#10B981' },
        { label: 'SMS', value: 45, color: '#FFB347' },
      ],
    },
    market: {
      marketTrend: 'Up',
      avgPricePerSqm: 5250,
      inventoryDays: 45,
      competitorListings: 234,
      marketPriceTrend: [
        { label: 'Jan', value: 4800 },
        { label: 'Feb', value: 4950 },
        { label: 'Mar', value: 5100 },
        { label: 'Apr', value: 5200 },
        { label: 'May', value: 5250 },
      ],
      neighborhoodHotspots: [
        { label: 'Downtown', value: 95, color: '#EF4444' },
        { label: 'Waterfront', value: 88, color: '#FFB347' },
        { label: 'Suburbs', value: 72, color: '#10B981' },
        { label: 'Industrial', value: 45, color: '#6EA8FE' },
      ],
    },
    compliance: {
      complianceScore: 96,
      openIssues: 3,
      documentsExpiring: 7,
      auditsThisMonth: 2,
      issuesByType: [
        { label: 'Documentation', value: 5, color: '#FFB347' },
        { label: 'Licensing', value: 2, color: '#EF4444' },
        { label: 'Disclosure', value: 3, color: '#6EA8FE' },
      ],
      alerts: [
        {
          id: 'c1',
          type: 'warning' as const,
          title: 'License Renewal Due',
          message: '2 agent licenses expire in 30 days',
          actionLabel: 'Review',
          onAction: () => console.log('Review licenses'),
        },
      ],
    },
    automation: {
      automatedTasks: 156,
      timeSaved: 48,
      workflowsActive: 12,
      errorRate: 1.2,
      automationsByType: [
        { label: 'Email Follow-ups', value: 65, color: '#2979FF' },
        { label: 'Lead Scoring', value: 45, color: '#6EA8FE' },
        { label: 'Appointment Reminders', value: 32, color: '#10B981' },
        { label: 'Document Generation', value: 14, color: '#FFB347' },
      ],
      workflowPerformance: [
        { label: 'Lead Nurture', value: 95, color: '#10B981' },
        { label: 'Property Updates', value: 88, color: '#2979FF' },
        { label: 'Client Onboarding', value: 92, color: '#6EA8FE' },
      ],
    },
  };
}

function RealEstateDashboardContent() {
  const { lang } = useLang();
  const [dateRange, setDateRange] = useState('30d');
  const [location, setLocation] = useState('all');
  const [agent, setAgent] = useState('all');
  const [activeView, setActiveView] = useState<'all' | 'leads' | 'listings' | 'deals' | 'operations'>('all');

  const data = generateMockData();

  // Determine which sections to show based on active view
  const shouldShowSection = (sectionId: string) => {
    if (activeView === 'all') return true;

    const sectionMapping: Record<string, string[]> = {
      leads: ['leads', 'clientExperience'],
      listings: ['listings', 'market'],
      deals: ['deals', 'compliance'],
      operations: ['operations', 'automation'],
    };

    return sectionMapping[activeView]?.includes(sectionId) || false;
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--re-deep-navy)' }}
    >
      {/* Fixed Header */}
      <RealEstateHeader />

      {/* Notification System (Top Right) */}
      <NotificationSystem
        notifications={data.notifications}
        onDismiss={(id) => console.log('Dismissed notification:', id)}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddLead={() => console.log('Add Lead')}
        onAddProperty={() => console.log('Add Property')}
        onAddCampaign={() => console.log('Create Campaign')}
      />

      {/* Main Content - Add padding-top to account for fixed header + extra spacing */}
      <div className="pt-20 pb-20">
        {/* Quick Stats Bar with top margin */}
        <div className="px-6 mt-10">
          <QuickStatsBar
            stats={[
              {
                label: 'Total Leads',
                value: data.kpis.totalLeads,
                change: 12,
                changeLabel: 'vs last month',
              },
              {
                label: 'Active Listings',
                value: data.kpis.activeListings,
                change: 5,
                changeLabel: 'this week',
              },
              {
                label: 'Open Deals',
                value: data.kpis.dealsClosed,
                change: -3,
                changeLabel: 'pending',
              },
              {
                label: 'Avg Response Time',
                value: '2.4h',
                change: -15,
                changeLabel: 'improved',
              },
            ]}
          />
        </div>

        {/* Filter Bar */}
        <div className="px-6 mt-6 mb-6">
          <FilterBar
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            location={location}
            onLocationChange={setLocation}
            agent={agent}
            onAgentChange={setAgent}
          />
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="px-6">
          <DashboardNavigation
            defaultTab={activeView}
            onTabChange={(tabId) => setActiveView(tabId as typeof activeView)}
          />
        </div>

        {/* KPI Grid - Top Level Metrics */}
        <div className="px-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title={lang === 'he' ? 'סה"כ לידים' : 'Total Leads'}
              value={data.kpis.totalLeads}
              delta="+12%"
              subtitle={lang === 'he' ? 'החודש' : 'This Month'}
              color="#2979FF"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              }
            />
            <KPICard
              title={lang === 'he' ? 'רשימות פעילות' : 'Active Listings'}
              value={data.kpis.activeListings}
              delta="+5"
              subtitle={lang === 'he' ? 'נכסים' : 'Properties'}
              color="#6EA8FE"
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
              title={lang === 'he' ? 'עסקאות סגורות' : 'Deals Closed'}
              value={data.kpis.dealsClosed}
              delta="+4"
              subtitle={lang === 'he' ? 'החודש' : 'This Month'}
              color="#10B981"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <KPICard
              title={lang === 'he' ? 'הכנסות' : 'Revenue'}
              value={`$${(data.kpis.revenue / 1000).toFixed(0)}K`}
              delta="+15%"
              subtitle={lang === 'he' ? 'החודש' : 'This Month'}
              color="#FFB347"
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
          </div>
        </div>

        {/* Main Dashboard Sections - Conditionally rendered based on active view */}
        <div className="px-6 space-y-8 pb-12">
          {shouldShowSection('leads') && (
            <div className="animate-fade-in">
              <LeadsMarketingSection data={data.leads} />
            </div>
          )}

          {shouldShowSection('listings') && (
            <div className="animate-fade-in">
              <ListingsInventorySection data={data.listings} />
            </div>
          )}

          {shouldShowSection('deals') && (
            <div className="animate-fade-in">
              <DealsRevenueSection data={data.deals} />
            </div>
          )}

          {shouldShowSection('operations') && (
            <div className="animate-fade-in">
              <OperationsProductivitySection data={data.operations} />
            </div>
          )}

          {shouldShowSection('clientExperience') && (
            <div className="animate-fade-in">
              <ClientExperienceSection data={data.clientExperience} />
            </div>
          )}

          {shouldShowSection('market') && (
            <div className="animate-fade-in">
              <MarketIntelligenceSection data={data.market} />
            </div>
          )}

          {shouldShowSection('compliance') && (
            <div className="animate-fade-in">
              <ComplianceRiskSection data={data.compliance} />
            </div>
          )}

          {shouldShowSection('automation') && (
            <div className="animate-fade-in">
              <AutomationHealthSection data={data.automation} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RealEstateDashboardNewComponent({ data, initialFilters }: { data?: any; initialFilters?: any }) {
  return (
    <LanguageProvider>
      <RealEstateDashboardContent />
    </LanguageProvider>
  );
}
