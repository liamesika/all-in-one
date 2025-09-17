'use client';

import CampaignsPage from './CampaignsClient';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AiCoachProvider } from '@/lib/ai-coach-context';
import AiCoachIntegration from '@/components/ai-coach/AiCoachIntegration';

export default function CampaignsPageWrapper() {
  const { user, ownerUid, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login?next=/e-commerce/campaigns');
    }
  }, [user, loading, router]);

  // Don't block the UI - let the component handle loading states
  // Development fallback: if still loading after 3 seconds, use test owner
  const effectiveOwnerUid = ownerUid || 'test-owner';

  return (
    <AiCoachProvider ownerUid={effectiveOwnerUid}>
      <CampaignsPage
        ownerUid={effectiveOwnerUid}
        isAuthLoading={loading}
        user={user}
      />
      {effectiveOwnerUid && (
        <AiCoachIntegration
          ownerUid={effectiveOwnerUid}
          organizationId={effectiveOwnerUid}
          enableProactive={true}
          enableChat={true}
        />
      )}
    </AiCoachProvider>
  );
}