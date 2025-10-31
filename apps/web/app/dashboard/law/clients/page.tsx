import { Suspense } from 'react';
import { ClientsPageClient } from './ClientsPageClient';

export const metadata = {
  title: 'Clients - Law Management | Effinity',
  description: 'Manage your law firm clients',
};

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading clients...</div>}>
      <ClientsPageClient />
    </Suspense>
  );
}
