import { Suspense } from 'react';
import { RealEstateDashboard } from './RealEstateDashboard';
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
      <div className="min-h-screen bg-white">
        <Suspense fallback={<DashboardSkeleton />}>
          <RealEstateDashboard
            data={data}
            initialFilters={resolvedSearchParams}
          />
        </Suspense>
      </div>
    </LangProvider>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-800"></div>
      <div className="max-w-8xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="bg-white rounded-2xl h-64"></div>
            <div className="bg-white rounded-2xl h-64"></div>
          </div>
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-2xl h-64"></div>
            <div className="bg-white rounded-2xl h-64"></div>
          </div>
        </div>
      </div>
    </div>
  );
}