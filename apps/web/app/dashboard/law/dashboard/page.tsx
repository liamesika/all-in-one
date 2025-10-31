import { Suspense } from 'react';
import { DashboardPageClient } from './DashboardPageClient';

export const dynamic = 'force-dynamic';

export default function LawDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageClient />
    </Suspense>
  );
}