'use client';

import CampaignsClient from './CampaignsClient';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AiCoachProvider } from '@/lib/ai-coach-context';
import AiCoachIntegration from '@/components/ai-coach/AiCoachIntegration';

export default function CampaignsPage() {
  const { user, ownerUid, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login?next=/e-commerce/campaigns');
    }
  }, [user, loading, router]);

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user || !ownerUid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Authentication Required</h1>
          <p className="text-gray-600 mt-2">Please log in to view campaigns</p>
          <button
            onClick={() => router.push('/login?next=/e-commerce/campaigns')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <AiCoachProvider ownerUid={ownerUid}>
      <CampaignsClient ownerUid={ownerUid} />
      {ownerUid && (
        <AiCoachIntegration
          ownerUid={ownerUid}
          organizationId={ownerUid}
          enableProactive={true}
          enableChat={true}
        />
      )}
    </AiCoachProvider>
  );
}