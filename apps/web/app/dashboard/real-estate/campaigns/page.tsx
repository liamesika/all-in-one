import { Suspense } from 'react';
import CampaignsClient from './CampaignsClient';
import { LangProvider } from '@/components/i18n/LangProvider';

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: string;
  platform?: string;
  startDate?: string;
  endDate?: string;
  lang?: string;
}

async function getCampaigns(params: SearchParams) {
  const apiBase = process.env.API_BASE ?? 'http://localhost:4000';

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  try {
    const res = await fetch(`${apiBase}/api/real-estate/campaigns?${searchParams}`, {
      cache: 'no-store',
      headers: {
        'x-org-id': 'demo'
      }
    });

    if (!res.ok) {
      console.error('Failed to fetch campaigns:', res.status);
      return [];
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Campaigns API error:', error);
    return [];
  }
}

export default async function CampaignsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams;
  const campaigns = await getCampaigns(resolvedSearchParams);

  return (
    <LangProvider initialLang={resolvedSearchParams.lang || 'en'}>
      <Suspense fallback={<CampaignsSkeleton />}>
        <CampaignsClient
          initialData={campaigns}
          initialFilters={resolvedSearchParams}
        />
      </Suspense>
    </LangProvider>
  );
}

function CampaignsSkeleton() {
  return (
    <div
      className="min-h-screen animate-pulse"
      style={{ background: '#0E1A2B' }}
    >
      {/* Header Skeleton */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 rounded" style={{ background: '#1A2F4B' }}></div>
          <div className="h-10 w-40 rounded-lg" style={{ background: '#1A2F4B' }}></div>
        </div>

        {/* Filters Skeleton */}
        <div className="rounded-xl h-16 mb-6" style={{ background: '#1A2F4B' }}></div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl h-64"
              style={{ background: '#1A2F4B' }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
