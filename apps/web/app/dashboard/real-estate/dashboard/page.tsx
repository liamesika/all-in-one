import { Suspense } from 'react';
import { RealEstateDashboardNewComponent } from './RealEstateDashboardNew';
import { LangProvider } from '@/components/i18n/LangProvider';

export const dynamic = 'force-dynamic';

interface SearchParams {
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  attorneyId?: string;
  practiceArea?: string;
  matterType?: string;
  matterStatus?: string;
  leadSource?: string;
  search?: string;
  lang?: string;
}

async function getDashboardData(params: SearchParams) {
  const apiBase = process.env.API_BASE ?? "http://localhost:4000";
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  
  try {
    const res = await fetch(`${apiBase}/api/real-estate/dashboard?${searchParams}`, {
      cache: 'no-store',
      headers: {
        'x-org-id': 'demo'
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
        newLeads: { 
          value: 45, 
          delta: '+12%', 
          trend: [38, 41, 45],
          hotWarmCold: { hot: 8, warm: 23, cold: 14 }
        },
        conversionRates: { 
          value: '28%', 
          delta: '+3%',
          qualified: '65%',
          viewing: '42%',
          offer: '28%',
          deal: '18%'
        },
        timeToContact: { 
          value: 2.3, 
          delta: '-0.5h',
          slaMetRate: '89%'
        },
        scheduledViewings: { 
          value: 34, 
          delta: '+8%',
          noShowRate: '12%'
        },
        offersCreated: { 
          value: 12, 
          delta: '+4',
          acceptanceRate: '75%'
        },
        avgDOM: { 
          value: 28, 
          delta: '-5d',
          listToSoldRatio: '94%'
        },
        roasCAC: { 
          value: '4.2x', 
          delta: '+0.3x',
          roas: '4.2x',
          cac: 1250
        },
        pipelineValue: { 
          value: 2800000, 
          delta: '+18%',
          expectedCommissions: 84000
        }
      },
      widgets: {
        leadsQuality: [],
        listingsPerformance: [],
        comps: [],
        openHouse: [],
        autoMarketing: [],
        neighborhoodGuides: [],
        revenue: [],
        operations: {
          alerts: [],
          tasks: []
        }
      }
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