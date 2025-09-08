'use client';
import { useEffect, useState } from 'react';

// ====== helpers: tiny charts (inline SVG, בלי תלות חיצונית) ======
function Sparkline({ points }: { points: number[] }) {
  const W = 120, H = 36;
  const max = Math.max(...points), min = Math.min(...points);
  const d = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * (W - 4) + 2;
      const y = H - 2 - ((v - min) / (max - min || 1)) * (H - 6);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80" />
    </svg>
  );
}

function Donut({ value, label }: { value: number; label: string }) {
  const R = 36, C = 2 * Math.PI * R, pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-4">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={R} stroke="currentColor" strokeWidth="10" className="opacity-15 fill-none" />
        <circle
          cx="45" cy="45" r={R} stroke="currentColor" strokeWidth="10" className="fill-none"
          strokeDasharray={`${(pct / 100) * C} ${C}`} strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="50" textAnchor="middle" className="text-sm font-semibold fill-current">{pct}%</text>
      </svg>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

// ====== types ======
type Job = {
  id: string;
  type?: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  createdAt?: string;
  metrics?: { images?: number };
};

// ====== page ======
export default function EcomDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetch('/api/jobs/summary', { credentials: 'include' }).then(r => r.json()).then(setSummary).catch(() => {});
    fetch('/api/jobs?limit=6', { credentials: 'include' }).then(r => r.json()).then(setJobs).catch(() => {});
  }, []);

  // רעיונות דיפולטיים ל-KPIs — אפשר להחליף במידע אמיתי כשיהיה:
  const kpis = [
    { label: 'GMV (30d)', value: '$84,200', trend: [12, 14, 18, 16, 20, 24, 28] },
    { label: 'Orders', value: '1,124', trend: [8, 9, 7, 11, 10, 13, 15] },
    { label: 'AOV', value: '$74.9', trend: [60, 62, 65, 66, 71, 73, 75] },
    { label: 'Conv. Rate', value: '2.4%', trend: [1.6, 1.7, 1.8, 2.1, 2.0, 2.3, 2.4] },
  ];

  return (
    <div className="min-h-dvh bg-[#F4F6FF] text-[#0B1020]">
      {/* ===== shell ===== */}
      <div className="mx-auto max-w-[1200px] px-4 py-6 grid grid-cols-12 gap-6">
        {/* ===== sidebar ===== */}
        <aside className="hidden md:block col-span-2">
          <div className="sticky top-6 rounded-2xl bg-white shadow-sm border border-black/5 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">AI</div>
              <div className="font-semibold">All-in-One</div>
            </div>
            <nav className="space-y-1 text-sm">
              <a className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-medium" href="/e-commerce/dashboard">Dashboard</a>
              <a className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5" href="/e-commerce/shopify-csv">Shopify CSV</a>
              <a className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5" href="/e-commerce/leads">Leads (soon)</a>
              <a className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5" href="/e-commerce/jobs">Jobs (soon)</a>
              <a className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5" href="/settings">Settings</a>
            </nav>
            <div className="mt-6 rounded-xl bg-indigo-600/5 border border-indigo-100 p-3 text-xs">
              <div className="font-medium mb-1">Tip</div>
              Upload a ZIP and auto-generate titles & descriptions with AI.
            </div>
          </div>
        </aside>

        {/* ===== main ===== */}
        <main className="col-span-12 md:col-span-7">
          {/* top bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <input
                placeholder="Search products, jobs, leads…"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              />
            </div>
            <a href="/e-commerce/shopify-csv" className="rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm hover:opacity-90">
              + Add New
            </a>
          </div>

          {/* hero */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6 mb-6 shadow-sm">
            <div className="text-xl font-semibold">Good morning!</div>
            <p className="opacity-90 text-sm mt-1">
              You have {summary?.csvsGenerated ?? 0} CSVs generated and {summary?.success ?? 0} successful jobs.
            </p>
            <div className="mt-4 flex gap-2">
              <a href="/e-commerce/shopify-csv" className="rounded-xl bg-white text-indigo-700 px-4 py-2 text-sm font-medium">Review CSVs</a>
              <a href="/e-commerce/leads" className="rounded-xl border border-white/30 px-4 py-2 text-sm">Open Leads</a>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-2xl bg-white border border-black/5 p-4">
                <div className="text-xs opacity-60">{k.label}</div>
                <div className="text-2xl font-semibold mt-0.5">{k.value}</div>
                <div className="mt-1 text-indigo-700">
                  <Sparkline points={k.trend} />
                </div>
              </div>
            ))}
          </div>

          {/* quick actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <a href="/e-commerce/shopify-csv" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-700 grid place-items-center mb-2">⬆️</div>
              <div className="font-medium">Upload ZIP → CSV</div>
              <div className="text-xs opacity-70">Auto titles/tags with AI</div>
            </a>
            <a href="/e-commerce/shopify-csv" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-violet-600/10 text-violet-700 grid place-items-center mb-2">✍️</div>
              <div className="font-medium">Generate Copy</div>
              <div className="text-xs opacity-70">SEO titles & descriptions</div>
            </a>
            <a href="/e-commerce/leads" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-700 grid place-items-center mb-2">💬</div>
              <div className="font-medium">Leads Inbox</div>
              <div className="text-xs opacity-70">Score + tag + reply</div>
            </a>
            <a href="/e-commerce/jobs" className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-700 grid place-items-center mb-2">⚙️</div>
              <div className="font-medium">Jobs History</div>
              <div className="text-xs opacity-70">Status, logs, retry</div>
            </a>
          </div>

          {/* progress / jobs table */}
          <div className="rounded-2xl bg-white border border-black/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
              <div className="font-semibold">Recent Jobs</div>
              <a href="/e-commerce/jobs" className="text-sm opacity-70 hover:opacity-100">View all</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs opacity-60">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Created</th>
                    <th className="px-4 py-2">Images</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((r) => (
                    <tr key={r.id} className="border-t border-black/5">
                      <td className="px-4 py-2 font-mono text-[11px] opacity-80">{r.id}</td>
                      <td className="px-4 py-2">{r.type || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={
                          `text-xs px-2 py-1 rounded-full border ${
                            r.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            r.status === 'FAILED'  ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            r.status === 'RUNNING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                     'bg-black/5 text-black/70 border-black/10'
                          }`
                        }>{r.status}</span>
                      </td>
                      <td className="px-4 py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</td>
                      <td className="px-4 py-2">{r.metrics?.images ?? ''}</td>
                      <td className="px-4 py-2">
                        {r.status === 'SUCCESS' && r.type === 'shopify_csv'
                          ? <a className="text-indigo-700 hover:underline" href={`/api/jobs/${r.id}/output`}>Download CSV</a>
                          : <span className="opacity-50">—</span>}
                      </td>
                    </tr>
                  ))}
                  {!jobs.length && (
                    <tr><td className="px-4 py-6 text-center opacity-60" colSpan={6}>No jobs yet — upload a ZIP to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* ===== right rail ===== */}
        <aside className="col-span-12 md:col-span-3">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl bg-white border border-black/5 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white grid place-items-center font-semibold">SA</div>
                <div>
                  <div className="font-semibold">Sara Abraham</div>
                  <div className="text-xs opacity-60">Store owner</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-black/5 p-3">
                  <div className="text-xs opacity-60">Leads</div>
                  <div className="font-semibold">18</div>
                </div>
                <div className="rounded-xl bg-black/5 p-3">
                  <div className="text-xs opacity-60">Jobs</div>
                  <div className="font-semibold">{summary?.total ?? 0}</div>
                </div>
                <div className="rounded-xl bg-black/5 p-3">
                  <div className="text-xs opacity-60">CSV</div>
                  <div className="font-semibold">{summary?.csvsGenerated ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-black/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Efficiency</div>
              </div>
              <Donut value={68} label="Contribution margin trend (est.)" />
            </div>

            <div className="rounded-2xl bg-white border border-black/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Recent activities</div>
              </div>
              <ul className="text-sm space-y-2">
                <li className="flex items-center justify-between">
                  <span>CSV export completed</span><span className="opacity-60">3m ago</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>10 new leads from landing</span><span className="opacity-60">Today</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Ad spend synced (Meta)</span><span className="opacity-60">Yesterday</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
