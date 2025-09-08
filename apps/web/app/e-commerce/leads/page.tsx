// Server Component – fetch only
export const dynamic = 'force-dynamic';

async function getLeads() {
  const apiBase = process.env.API_BASE ?? "http://localhost:4000";
  const res = await fetch(`${apiBase}/api/leads/list?limit=100`, { cache: "no-store" });
  if (!res.ok) return { items: [] as any[] };
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return { items: [] as any[] };
  return res.json();
}

// ✅ נעדכן את הנתיב כך שיתייחס למיקום החדש תחת /app/e-commerce/leads
import LeadsClient from './LeadsClient';

export default async function LeadsPage() {
  const { items } = await getLeads();
  return <LeadsClient items={items ?? []} />;
}
