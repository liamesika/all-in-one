'use client';

import { useLanguage } from '@/lib/language-context';

type Job = {
  id: string;
  type?: string;               // e.g. 'shopify_csv'
  status: 'PENDING'|'RUNNING'|'SUCCESS'|'FAILED';
  createdAt?: string;
  metrics?: { images?: number };
  outputUrl?: string;          // יש לך גם /api/jobs/:id/output ל-download
};

function StatusBadge({ s }: { s: Job['status'] }) {
  const cls =
    s === 'SUCCESS' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
    s === 'FAILED'  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
    s === 'RUNNING' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                      'bg-white/10 text-white/80 border-white/20';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {s}
    </span>
  );
}

export default function JobsTable({ rows }: { rows: Job[] }) {
  const { language } = useLanguage();
  
  if (!rows?.length) return null;
  const fmt = (s?: string) => (s ? new Date(s).toLocaleString() : '');

  return (
    <div className="rounded-2xl border border-white/10 overflow-x-auto mt-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="p-3">ID</th>
            <th className="p-3">{language === 'he' ? 'סוג' : 'Type'}</th>
            <th className="p-3">{language === 'he' ? 'סטטוס' : 'Status'}</th>
            <th className="p-3">{language === 'he' ? 'נוצר' : 'Created'}</th>
            <th className="p-3">{language === 'he' ? 'תמונות' : 'Images'}</th>
            <th className="p-3">{language === 'he' ? 'פעולות' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/10">
              <td className="p-3 font-mono text-xs opacity-80">{r.id}</td>
              <td className="p-3">{r.type || '-'}</td>
              <td className="p-3"><StatusBadge s={r.status} /></td>
              <td className="p-3">{fmt(r.createdAt)}</td>
              <td className="p-3">{r.metrics?.images ?? ''}</td>
              <td className="p-3">
                {r.status === 'SUCCESS' && r.type === 'shopify_csv' ? (
                  <a
                    href={`/api/jobs/${r.id}/output`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/5"
                  >
                    {language === 'he' ? 'הורד CSV' : 'Download CSV'}
                  </a>
                ) : (
                  <span className="opacity-60 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
