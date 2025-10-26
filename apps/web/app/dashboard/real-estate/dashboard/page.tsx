import { Suspense } from 'react';
import { RealEstateDashboardNewComponent } from './RealEstateDashboardNew';
import { LangProvider } from '@/components/i18n/LangProvider';

export const dynamic = 'force-dynamic';

interface SearchParams {
  dateRange?: string;
  agent?: string;
  dealType?: string;
  status?: string;
  source?: string;
  search?: string;
  lang?: string;
}

async function getDashboardData(params: SearchParams, orgId?: string) {
  const apiBase = process.env.API_BASE ?? "http://localhost:4000";

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  try {
    const res = await fetch(`${apiBase}/api/real-estate/dashboard?${searchParams}`, {
      cache: 'no-store',
      headers: {
        'x-org-id': orgId || 'demo',
        'x-user-id': 'current-user'
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Dashboard API error:', error);
    return {
      kpis: {
        totalLeads: 0,
        activeListings: 0,
        dealsClosed: 0,
        revenue: 0,
        conversionRate: 0,
        avgDOM: 0,
        satisfaction: 0,
        automatedTasks: 0,
      },
      leads: {
        leadsToday: 0,
        qualified: 0,
        cpl: 0,
        convRate: 0,
        leadsTrend: [],
        leadsBySource: [],
      },
      isEmpty: true,
    };
  }
}

export default async function RealEstateDashboardPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams;
  const data = await getDashboardData(resolvedSearchParams);
  
  return (
    <LangProvider initialLang="en">
      <Suspense fallback={<DashboardSkeleton />}>
        <RealEstateDashboardNewComponent
          data={data}
          initialFilters={resolvedSearchParams}
        />
      </Suspense>
    </LangProvider>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="min-h-screen animate-pulse"
      style={{ background: 'var(--re-deep-navy)' }}
    >
      {/* Header Skeleton */}
      <div
        className="h-20 w-full"
        style={{
          background: 'var(--re-header-gradient)',
        }}
      ></div>

      {/* Content Skeleton */}
      <div className="px-6 py-8">
        {/* Alerts Banner Skeleton */}
        <div
          className="rounded-lg h-12 mb-6"
          style={{ background: 'var(--re-midnight-blue)' }}
        ></div>

        {/* Filter Bar Skeleton */}
        <div
          className="rounded-xl h-16 mb-6"
          style={{ background: 'var(--re-midnight-blue)' }}
        ></div>

        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl h-32"
              style={{ background: 'var(--re-midnight-blue)' }}
            ></div>
          ))}
        </div>

        {/* Sections Skeleton */}
        <div className="space-y-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl h-96"
              style={{ background: 'var(--re-midnight-blue)' }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}