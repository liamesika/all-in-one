// apps/web/app/e-commerce/leads/LeadsClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import LanguageToggle from '../../../components/LanguageToggle';
import { useLang } from '../../../components/i18n/LangProvider';
import { dict } from '../../../components/i18n/dict';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Lead = {
  id: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  interest?: string | null;
  budget?: number | null;
  score?: number | null;
  status?: 'NOT_RELEVANT' | 'RELEVANT' | 'NO_ANSWER' | 'TRY_AGAIN' | string;
  bucket?: string | null;
  source?: string | null;
  createdAt?: string;
  phoneNorm?: string | null;
};

// ===== תרגום סטטוסים =====
type TKey = keyof typeof dict['en'];

const STATUS_KEYS: Record<'RELEVANT' | 'NOT_RELEVANT' | 'NO_ANSWER' | 'TRY_AGAIN', TKey> = {
  RELEVANT: 'status.RELEVANT',
  NOT_RELEVANT: 'status.NOT_RELEVANT',
  NO_ANSWER: 'status.NO_ANSWER',
  TRY_AGAIN: 'status.TRY_AGAIN',
};

function tStatus(status: string | undefined, t: (k: TKey) => string) {
  const key = status && (STATUS_KEYS as any)[status];
  return t((key ?? 'table.status') as TKey);
}

// ===== תאריך IL עקבי ל-SSR/CSR =====
const dtIL = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jerusalem',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function formatIL(iso?: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  return dtIL.format(d);
}

// ===== קבועים כלליים =====
const STATUS_OPTIONS = ['All', 'RELEVANT', 'NOT_RELEVANT', 'NO_ANSWER', 'TRY_AGAIN'] as const;
const STATUS_VALUES = ['RELEVANT', 'NOT_RELEVANT', 'NO_ANSWER', 'TRY_AGAIN'] as const;
const PAGE_SIZE = 25;

// ===== עזר לנרמול טלפון ל-WhatsApp =====
function normalizePhone(phone?: string | null) {
  if (!phone) return '';
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('0')) d = '+972' + d.slice(1);
  else if (!d.startsWith('+')) d = '+' + d;
  return d;
}

// ===== עזרי עיצוב לסטטוס =====
function statusClasses(s?: string) {
  switch (s) {
    case 'RELEVANT':      return 'bg-green-100 text-green-700 border-green-300';
    case 'NOT_RELEVANT':  return 'bg-red-100 text-red-700 border-red-300';
    case 'NO_ANSWER':     return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'TRY_AGAIN':     return 'bg-blue-100 text-blue-700 border-blue-300';
    default:              return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

// ===== רכיב תפריט סטטוס קטן =====
function StatusMenu({
  onPick, t,
}: {
  onPick: (s: (typeof STATUS_VALUES)[number]) => void;
  t: (k: TKey) => string;
}) {
  return (
    <div className="status-menu z-50 mt-2 w-44 overflow-hidden rounded-lg border bg-white shadow-lg">
      {STATUS_VALUES.map((s) => (
        <button
          key={s}
          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
          onClick={() => onPick(s)}
        >
          {tStatus(s, t)}
        </button>
      ))}
    </div>
  );
}

// ===== מודאל אימפורט CSV =====
function ImportCsvModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (summary: { created?: number; skipped?: number; errors?: number } | null) => void;
}) {
  const { lang } = useLang();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      // מצופה: Route Handler ב־Next: /app/webapi/leads/import/route.ts (POST)
      const res = await fetch('/webapi/leads/import', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json().catch(() => ({}));
      onDone(json);
      onClose();
    } catch (e: any) {
      setErr(lang === 'he' ? 'העלאה נכשלה' : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50"
            aria-label="Close"
            disabled={busy}
          >✕</button>

          <h3 className="mb-4 text-lg font-semibold">
            {lang === 'he' ? 'ייבוא CSV' : 'Import CSV'}
          </h3>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600">
              {lang === 'he' ? 'גררי לכאן קובץ CSV או' : 'Drag a CSV file here or'}
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              disabled={busy}
            >
              {lang === 'he' ? 'בחרי קובץ מהמחשב' : 'Choose file'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={onChange}
              disabled={busy}
              />

          </div>

          {busy && <div className="mt-3 text-sm text-gray-500">{lang === 'he' ? 'מעלה…' : 'Uploading…'}</div>}
          {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

          <div className="mt-4 text-xs text-gray-500">
            {lang === 'he'
              ? 'וודאי שהעמודות בתבנית: name,email,phone,interest,budget,source,notes'
              : 'Make sure columns match the template: name,email,phone,interest,budget,source,notes'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadsClient({ items }: { items: Lead[] }) {
  const { t, lang } = useLang();
  const router = useRouter();

  // חיפוש + פילטר
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('All');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (items || []).filter((l) => {
      const passStatus = status === 'All' || l.status === status;
      if (!needle) return passStatus;
      const hay = `${l.name ?? ''} ${l.email ?? ''} ${l.phone ?? ''}`.toLowerCase();
      return passStatus && hay.includes(needle);
    });
  }, [items, q, status]);

  // עימוד
  const [shown, setShown] = useState(PAGE_SIZE);
  useEffect(() => setShown(PAGE_SIZE), [q, status]);
  const visible = useMemo(() => filtered.slice(0, shown), [filtered, shown]);
  const canLoadMore = shown < filtered.length;

  // מודאל פרטי ליד
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);

  // Popover סטטוס (id פתוח כרגע)
  const [openStatusForId, setOpenStatusForId] = useState<string | null>(null);

  // מודאל אימפורט
  const [showImport, setShowImport] = useState(false);
  const [importSummary, setImportSummary] = useState<{ created?: number; skipped?: number; errors?: number } | null>(null);

  // מחיקה רכה - סטייט קטן
  const [deleting, setDeleting] = useState(false);

  // בסיס API (לשימוש ב־fetch ל־lead details / PATCH / DELETE)
  const apiBase =
    (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_API_BASE) ||
    (globalThis as any)?.NEXT_PUBLIC_API_BASE ||
    'http://localhost:4000';

  async function openLead(id: string) {
    setSelectedId(id);
    setLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`${apiBase}/api/leads/${id}`, { cache: 'no-store' });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const json = await res.json();
        setDetail(json);
      } else {
        setDetail(null);
      }
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setSelectedId(null);
    setDetail(null);
    setOpenStatusForId(null);
  }

  // סגירה ב-Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    if (selectedId) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  // סגירת תפריט סטטוס בלחיצה מחוץ
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (t?.closest('[aria-haspopup="menu"]') || t?.closest('.status-menu')) return;
      setOpenStatusForId(null);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function toggleStatusMenu(id: string) {
    setOpenStatusForId((prev) => (prev === id ? null : id));
  }

  async function updateLeadStatus(id: string, newStatus: string) {
    // עדכון אופטימי במודאל
    setDetail((d) => (d && d.id === id ? { ...d, status: newStatus } : d));

    try {
      const res = await fetch(`${apiBase}/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => 'patch_failed'));

      const updated = await res.json();
      setDetail(updated);        // ודא שמודאל מראה את הערך שחזר מהשרת
      router.refresh();          // רענון ה־SSR לטבלה
    } catch (e) {
      alert(lang === 'he' ? 'שמירת סטטוס נכשלה' : 'Failed to save status');
    } finally {
      setOpenStatusForId(null);
    }
  }

  // ===== מחיקה רכה מתוך המודאל =====
  async function handleDeleteCurrent() {
    if (!detail?.id || deleting) return;
    try {
      setDeleting(true);
      const r = await fetch(`${apiBase}/api/leads/${detail.id}`, { method: 'DELETE' });
      if (!r.ok) {
        const text = await r.text().catch(() => '');
        throw new Error(text || 'Delete failed');
      }
      closeModal();
      router.refresh(); // רענון הרשימה מה-SSR
    } catch (e: any) {
      console.error(e);
      alert(lang === 'he' ? 'מחיקה נכשלה' : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold">{t('leads.title')}</h1>
        <LanguageToggle />

        {/* + ליד חדש */}
        <Link
          href="/e-commerce/leads/new"
          className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
        >
          {lang === 'he' ? '+ ליד חדש' : '+ New lead'}
        </Link>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('leads.search')}
          className="rounded-lg border px-3 py-2 text-sm"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? (lang === 'he' ? 'הכל' : 'All') : tStatus(s, t)}
            </option>
          ))}
        </select>

        {/* הורדת תבנית CSV */}
        <a
          href="/webapi/leads/template"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          {lang === 'he' ? 'הורדת תבנית CSV' : 'Download CSV template'}
        </a>

        {/* ייבוא CSV */}
        <button
          onClick={() => setShowImport(true)}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          {lang === 'he' ? 'ייבוא CSV' : 'Import CSV'}
        </button>

        {/* מקומות לשילובים עתידיים */}
        <button disabled className="rounded-lg border px-3 py-2 text-sm opacity-50">
          {t('leads.connectFbIg')}
        </button>
        <button disabled className="rounded-lg border px-3 py-2 text-sm opacity-50">
          {t('leads.connectSheet')}
        </button>
      </div>

      {/* הודעת סיכום אחרי ייבוא */}
      {importSummary && (
        <div className="mb-4 rounded-lg border bg-green-50 p-3 text-sm text-green-700">
          {(lang === 'he' ? 'ייבוא הושלם. ' : 'Import complete. ') +
            `${lang === 'he' ? 'נוצרו' : 'Created'}: ${importSummary.created ?? 0}, ` +
            `${lang === 'he' ? 'דילוגים' : 'Skipped'}: ${importSummary.skipped ?? 0}, ` +  // ← כאן היה 'ה'
            `${lang === 'he' ? 'שגיאות' : 'Errors'}: ${importSummary.errors ?? 0}`}
        </div>
      )}


      {visible.length === 0 ? (
        <div className="rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          {t('empty')}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-4 py-3">{t('table.name')}</th>
                  <th className="px-4 py-3">{t('table.email')}</th>
                  <th className="px-4 py-3">{t('table.phone')}</th>
                  <th className="px-4 py-3">{t('table.interest')}</th>
                  <th className="px-4 py-3">{t('table.budget')}</th>
                  <th className="px-4 py-3">{t('table.score')}</th>
                  <th className="px-4 py-3">{t('table.status')}</th>
                  <th className="px-4 py-3">{t('table.bucket')}</th>
                  <th className="px-4 py-3">{t('table.created')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <button onClick={() => openLead(l.id)} className="text-blue-600 hover:underline">
                        {l.name || '(no name)'}
                      </button>
                    </td>
                    <td className="px-4 py-3">{l.email || '-'}</td>
                    <td className="px-4 py-3">{l.phone || '-'}</td>
                    <td className="px-4 py-3">{l.interest || '-'}</td>
                    <td className="px-4 py-3">{l.budget ?? '-'}</td>
                    <td className="px-4 py-3">{l.score ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusClasses(l.status)}`}>
                        {tStatus(l.status as string, t)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{l.bucket || '-'}</td>
                    <td className="px-4 py-3" suppressHydrationWarning>
                      {formatIL(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* פוטר עימוד */}
          <div className="flex items-center justify-between py-3 text-sm text-gray-600">
            <span>{t('showing')} {Math.min(shown, filtered.length)} {t('of')} {filtered.length}</span>
            <button
              onClick={() => setShown((n) => n + PAGE_SIZE)}
              disabled={!canLoadMore}
              className={`rounded-lg border px-3 py-2 ${canLoadMore ? 'hover:bg-gray-50' : 'opacity-50'}`}
            >
              {canLoadMore ? t('loadMore') : t('allLoaded')}
            </button>
          </div>
        </>
      )}

      {/* ▼ Modal Lead */}
      {selectedId && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 transition-opacity duration-200" onClick={closeModal} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-2 text-center">
                <h2 className="text-xl font-semibold">{t('modal.title')}</h2>
              </div>
              <button
                onClick={closeModal}
                className="absolute right-3 top-3 rounded-full border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50"
                aria-label="Close"
              >
                ✕
              </button>

              {loading && <div className="p-6 text-center text-gray-500">Loading…</div>}
              {!loading && !detail && <div className="p-6 text-center text-red-600">Failed to load lead.</div>}
              {!loading && detail && (
                <div className="space-y-3">
                  <p><strong>{t('modal.id')}:</strong> {detail.id}</p>
                  <p><strong>{t('table.name')}:</strong> {detail.name ?? '-'}</p>
                  <p><strong>{t('table.email')}:</strong> {detail.email ?? '-'}</p>
                  <p><strong>{t('table.phone')}:</strong> {detail.phone ?? '-'}</p>
                  <p><strong>{t('table.interest')}:</strong> {detail.interest ?? '-'}</p>
                  <p><strong>{t('table.budget')}:</strong> {detail.budget ?? '-'}</p>

                  {/* סטטוס: badge לחיץ + תפריט */}
                  <div className="relative flex items-center gap-3">
                    <button
                      onClick={() => setOpenStatusForId((p) => p === detail.id ? null : detail.id)}
                      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${statusClasses(detail.status)}`}
                      aria-haspopup="menu"
                      aria-expanded={openStatusForId === detail.id}
                    >
                      {tStatus(detail.status as string, t)}
                      <svg className="ml-1 h-3 w-3 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {openStatusForId === detail.id && (
                      <div className="absolute left-0 top-full">
                        <StatusMenu t={t} onPick={(s) => updateLeadStatus(detail.id, s)} />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-3">
                    {(() => {
                      const phoneNorm = detail.phoneNorm || normalizePhone(detail.phone);
                      const href = phoneNorm
                        ? `https://wa.me/${phoneNorm}?text=${encodeURIComponent(`Hello ${detail.name ?? ''}`)}`
                        : '#';
                      const disabled = !phoneNorm;
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-disabled={disabled}
                          className={`rounded-lg px-4 py-2 text-white ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                          {t('modal.whatsapp')}
                        </a>
                      );
                    })()}

                    {/* מחיקה רכה */}
                    <button
                      onClick={handleDeleteCurrent}
                      disabled={deleting}
                      className="rounded-lg border border-red-200 text-red-600 px-4 py-2 text-sm hover:bg-red-50 disabled:opacity-60"
                      title="Soft delete"
                    >
                      {deleting ? (lang === 'he' ? 'מוחק…' : 'Deleting…') : (lang === 'he' ? 'מחיקה' : 'Delete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ▲ Modal Lead */}

      {/* ▼ Modal Import CSV */}
      <ImportCsvModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onDone={(sum) => setImportSummary(sum)}
      />
      {/* ▲ Modal Import CSV */}
    </section>
  );
}
