import { Suspense } from 'react';
import { BillingPageClient } from './BillingPageClient';

export const dynamic = 'force-dynamic';

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingPageClient />
    </Suspense>
  );
}
