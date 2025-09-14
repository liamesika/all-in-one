import { Suspense } from 'react';
import { LawDashboard } from './LawDashboard';

export const dynamic = 'force-dynamic';

interface SearchParams {
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  attorneyId?: string;
  practiceArea?: string;
  matterStage?: string;
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
    const res = await fetch(`${apiBase}/api/law/dashboard?${searchParams}`, {
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
        activeMatters: { 
          value: 127, 
          delta: '+8', 
          trend: [119, 123, 127],
          breakdown: { litigation: 45, corporate: 38, family: 26, criminal: 18 }
        },
        newIntakes: { 
          value: 23, 
          delta: '+15%',
          conversionRate: '68%',
          sourceBreakdown: { referral: 12, google: 6, social: 3, direct: 2 }
        },
        billableHours: { 
          value: 1847, 
          delta: '+12%',
          utilization: '78%',
          target: 2000
        },
        realizationRate: { 
          value: '94%', 
          delta: '+2%',
          collectionRate: '91%',
          writeOffs: 34000
        },
        netRevenue: { 
          value: 485000, 
          delta: '+18%',
          wip: 124000,
          growth: 'monthly'
        },
        upcomingDeadlines: { 
          value: 42, 
          delta: '+6',
          overdue: 8,
          next7Days: 18
        },
        deadlineRisk: { 
          value: 73, 
          delta: '+5',
          level: 'medium',
          criticalCount: 12
        }
      },
      widgets: {
        deadlinesTimeline: [],
        alerts: [],
        intakeFunnel: [],
        matterPipeline: [],
        financialFlow: [],
        workloadHeatmap: [],
        productivity: [],
        documentsAI: []
      }
    };
  }
}

export default async function LawDashboardPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const data = await getDashboardData(searchParams);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<DashboardSkeleton />}>
        <LawDashboard 
          data={data} 
          initialFilters={searchParams}
        />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      <div className="max-w-8xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(7)].map((_, i) => (
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