'use client';

/**
 * Real Estate Dashboard - Redesigned with Design System 2.0
 * Unified component library with consistent visual language
 */

import { useState } from 'react';
import * as React from 'react';
import {
  TrendingUp,
  Home,
  CheckCircle,
  DollarSign,
  Users,
  Building2,
  BarChart3,
  Shield,
  Zap,
} from 'lucide-react';

// Import unified components
import { KPICard } from '@/components/shared';

// Import legacy components (to be updated)
import { RealEstateHeader } from '@/components/dashboard/RealEstateHeader';
import { NotificationSystem } from '@/components/dashboard/NotificationSystem';
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
import { RealEstateFooter } from '@/components/real-estate/RealEstateFooter';
import { useFilters } from '@/hooks/useFilters';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { PrimaryKPICard } from '@/components/dashboard/PrimaryKPICard';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { analytics } from '@/lib/analytics';
import { PricingPanel } from '@/components/pricing/PricingPanel';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { auth } from '@/lib/firebase';

interface Subscription {
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELED';
  trialEndsAt?: string;
  plan: string;
}

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

function RealEstateDashboardContent({ initialFilters }: { initialFilters?: any }) {
  const { lang } = useLang();
  const { userProfile } = useAuth();
  const router = useRouter();
  const { filters, updateFilter } = useFilters(initialFilters);
  const [activeView, setActiveView] = useState<'all' | 'leads' | 'listings' | 'deals' | 'operations'>('all');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const data = generateMockData();

  // Track dashboard view on mount
  React.useEffect(() => {
    analytics.dashboardViewed(null, !data.isEmpty);
  }, [data.isEmpty]);

  // Fetch subscription status
  React.useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/subscriptions/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleTrialStart = async () => {
    // Refresh subscription after trial activation
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    const response = await fetch('/api/subscriptions/status', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setSubscription(data.subscription);
    }
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] overflow-x-hidden">
      {/* Fixed Header */}
      <RealEstateHeader />

      {/* Notification System (Top Right) */}
      <NotificationSystem
        notifications={data.notifications}
        onDismiss={(id) => console.log('Dismissed notification:', id)}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddLead={() => router.push('/dashboard/real-estate/leads?action=new')}
        onAddProperty={() => router.push('/dashboard/real-estate/properties?action=new')}
        onAddCampaign={() => router.push('/dashboard/real-estate/campaigns?action=new')}
      />

      {/* Main Content - Mobile-optimized with centered layout */}
      <div className="pt-20 pb-16 max-w-full mx-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Greeting */}
        <DashboardGreeting
          firstName={userProfile?.displayName || userProfile?.firstName}
          vertical="Real-Estate"
        />

        {/* Trial Banner */}
        {!loadingSubscription && subscription && (
          <>
            {subscription.status === 'EXPIRED' && (
              <div className="mb-6">
                <TrialBanner
                  status="expired"
                  lang={lang}
                  onUpgrade={() => {
                    const pricingSection = document.getElementById('pricing-section');
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
              </div>
            )}
            {subscription.status === 'TRIAL' && subscription.trialEndsAt && (
              (() => {
                const daysRemaining = Math.ceil(
                  (new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return daysRemaining <= 7 ? (
                  <div className="mb-6">
                    <TrialBanner
                      status="expiring"
                      daysRemaining={daysRemaining}
                      lang={lang}
                      onUpgrade={() => {
                        const pricingSection = document.getElementById('pricing-section');
                        if (pricingSection) {
                          pricingSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    />
                  </div>
                ) : null;
              })()
            )}
          </>
        )}

        {/* Pricing Panel */}
        {!loadingSubscription && (!subscription || subscription.status !== 'ACTIVE') && (
          <div id="pricing-section" className="mb-8">
            <PricingPanel
              vertical="realestate"
              lang={lang}
              onTrialStart={handleTrialStart}
            />
          </div>
        )}

        {/* Primary KPI Cards - Emphasized */}
        <div className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <PrimaryKPICard
              icon={<Users size={32} />}
              label="Total Leads"
              value={data.kpis.totalLeads}
              change="+12% from last month"
              trend="up"
              tooltip="Total number of leads across all sources and statuses"
              href="/dashboard/real-estate/leads"
            />
            <PrimaryKPICard
              icon={<Building2 size={32} />}
              label="Active Properties"
              value={data.kpis.activeListings}
              change="+5 this week"
              trend="up"
              tooltip="Properties currently listed and available on the market"
              href="/dashboard/real-estate/properties"
            />
            <PrimaryKPICard
              icon={<BarChart3 size={32} />}
              label="Active Campaigns"
              value={24}
              change="3 scheduled"
              trend="neutral"
              tooltip="Marketing campaigns currently running across all platforms"
              href="/dashboard/real-estate/campaigns"
            />
            <PrimaryKPICard
              icon={<Zap size={32} />}
              label="Active Automations"
              value={data.kpis.automatedTasks}
              change="98% success rate"
              trend="up"
              tooltip="Automated workflows and tasks running to save time"
              href="/dashboard/real-estate/automations"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar
            dateRange={filters.dateRange}
            onDateRangeChange={(value) => updateFilter('dateRange', value)}
            dealType={filters.dealType}
            onDealTypeChange={(value) => updateFilter('dealType', value)}
            status={filters.status}
            onStatusChange={(value) => updateFilter('status', value)}
            source={filters.source}
            onSourceChange={(value) => updateFilter('source', value)}
            agent={filters.agent}
            onAgentChange={(value) => updateFilter('agent', value)}
            search={filters.search}
            onSearchChange={(value) => updateFilter('search', value)}
          />
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="mb-8">
          <DashboardNavigation
            defaultTab={activeView}
            onTabChange={(tabId) => setActiveView(tabId as typeof activeView)}
          />
        </div>

        {/* KPI Grid - Updated with Unified KPICard Component */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <KPICard
              icon={<Users className="w-6 h-6" />}
              label={lang === 'he' ? 'סה"כ לידים' : 'Total Leads'}
              value={data.kpis.totalLeads}
              change={{ value: '+12% from last month', trend: 'up' }}
            />
            <KPICard
              icon={<Building2 className="w-6 h-6" />}
              label={lang === 'he' ? 'רשימות פעילות' : 'Active Listings'}
              value={data.kpis.activeListings}
              change={{ value: '+5 new properties', trend: 'up' }}
            />
            <KPICard
              icon={<CheckCircle className="w-6 h-6" />}
              label={lang === 'he' ? 'עסקאות סגורות' : 'Deals Closed'}
              value={data.kpis.dealsClosed}
              change={{ value: '+4 this month', trend: 'up' }}
            />
            <KPICard
              icon={<DollarSign className="w-6 h-6" />}
              label={lang === 'he' ? 'הכנסות' : 'Revenue'}
              value={`$${(data.kpis.revenue / 1000).toFixed(0)}K`}
              change={{ value: '+15% from last month', trend: 'up' }}
            />
          </div>
        </div>

        {/* Main Dashboard Sections - Conditionally rendered based on active view */}
        <div className="space-y-7 sm:space-y-8 pb-16">
          {data.isEmpty ? (
            <EmptyState
              icon={<Building2 size={32} />}
              title="Welcome to your Real Estate Dashboard"
              description="Start by adding your first property or lead to see your data come to life"
              actionLabel="Add Your First Property"
              actionHref="/dashboard/real-estate/properties/new"
            />
          ) : (
            <>
          {shouldShowSection('leads') && (
            <div className="animate-fade-in">
              <LeadsMarketingSection
                data={data.leads}
                onViewDetails={() => router.push('/dashboard/real-estate/leads')}
              />
            </div>
          )}

          {shouldShowSection('listings') && (
            <div className="animate-fade-in">
              <ListingsInventorySection
                data={data.listings}
                onViewDetails={() => router.push('/dashboard/real-estate/properties')}
              />
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
            </>
          )}
        </div>

        {/* Footer */}
        <RealEstateFooter />
        </div>
      </div>
    </div>
  );
}

export function RealEstateDashboardNewComponent({ data, initialFilters }: { data?: any; initialFilters?: any }) {
  return (
    <LanguageProvider>
      <RealEstateDashboardContent initialFilters={initialFilters} />
    </LanguageProvider>
  );
}
