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
    <main className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-gray-200 dark:bg-[#1A2F4B] rounded"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-[#1A2F4B] rounded"></div>
          </div>
          <div className="h-12 w-40 bg-gray-200 dark:bg-[#1A2F4B] rounded-lg"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="h-20 bg-white dark:bg-[#1A2F4B] rounded-xl border border-gray-200 dark:border-[#2979FF]/20"></div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-white dark:bg-[#1A2F4B] rounded-xl border border-gray-200 dark:border-[#2979FF]/20"
            ></div>
          ))}
        </div>
      </div>
    </main>
  );
}
