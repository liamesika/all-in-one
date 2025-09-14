export const dynamic = 'force-dynamic';

async function getLeads() {
  const apiBase = process.env.API_BASE ?? 'http://localhost:3000';
  const res = await fetch(`${apiBase}/api/real-estate/leads?limit=100`, { cache: 'no-store' });
  if (!res.ok) return { items: [] as any[] };
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return { items: [] as any[] };
  const items = await res.json();
  return { items };
}

import LeadsClient from './LeadsClient';

export default async function LeadsPage() {
  const { items } = await getLeads();
  return <LeadsClient items={items ?? []} />;
}
