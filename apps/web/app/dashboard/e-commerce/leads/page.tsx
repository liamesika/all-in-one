'use client';

import LeadsPage from './LeadsClient';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AiCoachProvider } from '@/lib/ai-coach-context';
import AiCoachIntegration from '@/components/ai-coach/AiCoachIntegration';
import { LanguageProvider } from '@/lib/language-context';

export default function LeadsPageWrapper() {
  const { user, ownerUid, loading } = useAuth();
  const router = useRouter();

  console.log('[DEBUG] LeadsPageWrapper render - ownerUid:', ownerUid, 'loading:', loading);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login?next=/e-commerce/leads');
    }
  }, [user, loading, router]);


  // Don't block the UI - let the component handle loading states
  // Development fallback: if still loading after 3 seconds, use test owner
  const effectiveOwnerUid = ownerUid || 'test-owner';

  return (
    <LanguageProvider initialLang="en">
      <AiCoachProvider ownerUid={effectiveOwnerUid}>
        <LeadsPage
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
    </LanguageProvider>
  );
}
