'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LanguageToggle } from '@/components/language-toggle';
import { LanguageProvider, useLanguage } from '@/lib/language-context';

// ===== טיפוס ליד נדל״ן =====
type Lead = {
  id: string;
  clientName: string;
  email?: string | null;
  phone?: string | null;
  propertyType?: string | null;
  city?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  source?: string | null;
  status: 'NEW' | 'CONTACTED' | 'MEETING' | 'OFFER' | 'DEAL';
  notes?: string | null;
  createdAt?: string;
};

// ===== פורמט תאריך קבוע ל-IL =====
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
function formatIL(iso?: string | null) {
  if (!iso) return '-';
  return dtIL.format(new Date(iso));
}

// ===== עזר לנרמול טלפון לוואטסאפ =====
function normalizePhone(phone?: string | null) {
  if (!phone) return '';
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('0')) d = '+972' + d.slice(1);
  else if (!d.startsWith('+')) d = '+' + d;
  return d;
}

// ===== עזרי סטטוס =====
const STATUS_OPTIONS = ['All', 'NEW', 'CONTACTED', 'MEETING', 'OFFER', 'DEAL'] as const;
const STATUS_VALUES = ['NEW', 'CONTACTED', 'MEETING', 'OFFER', 'DEAL'] as const;
function statusClasses(s?: string) {
  switch (s) {
    case 'NEW':        return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'CONTACTED':  return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'MEETING':    return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'OFFER':      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'DEAL':       return 'bg-green-100 text-green-700 border-green-300';
    default:           return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}
function tStatusRE(s: string, language: 'he' | 'en') {
  const he: Record<string, string> = {
    NEW: 'חדש',
    CONTACTED: 'יצירת קשר',
    MEETING: 'פגישה',
    OFFER: 'הצעה',
    DEAL: 'עסקה',
  };
  const en: Record<string, string> = {
    NEW: 'NEW',
    CONTACTED: 'CONTACTED',
    MEETING: 'MEETING',
    OFFER: 'OFFER',
    DEAL: 'DEAL',
  };
  return (language === 'he' ? he : en)[s] ?? s;
}

// ===== תפריט סטטוס קטן =====
function StatusMenu({
  onPick, language,
}: {
  onPick: (s: (typeof STATUS_VALUES)[number]) => void;
  language: 'he' | 'en';
}) {
  return (
    <div className="status-menu z-50 mt-2 w-44 overflow-hidden rounded-lg border bg-white shadow-lg">
      {STATUS_VALUES.map((s) => (
        <button
          key={s}
          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
          onClick={() => onPick(s)}
        >
          {tStatusRE(s, language)}
        </button>
      ))}
    </div>
  );
}

// ===== מודאל ייבוא CSV (לנתיב הנדל״ן) =====
function ImportCsvModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (summary: { created?: number; skipped?: number; errors?: number } | null) => void;
}) {
  const { language } = useLanguage();
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
      const res = await fetch('/webapi/real-estate/leads/import', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json().catch(() => ({}));
      onDone(json);
      onClose();
    } catch {
      setErr(language === 'he' ? 'העלאה נכשלה' : 'Upload failed');
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
            {language === 'he' ? 'ייבוא CSV' : 'Import CSV'}
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
              {language === 'he' ? 'גררי לכאן קובץ CSV או' : 'Drag a CSV file here or'}
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              disabled={busy}
            >
              {language === 'he' ? 'בחרי קובץ מהמחשב' : 'Choose file'}
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

          {busy && <div className="mt-3 text-sm text-gray-500">{language === 'he' ? 'מעלה…' : 'Uploading…'}</div>}
          {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

          <div className="mt-4 text-xs text-gray-500">
            {language === 'he'
              ? 'תבנית עמודות מומלצת: clientName,email,phone,propertyType,city,budgetMin,budgetMax,source,status,notes'
              : 'Columns: clientName,email,phone,propertyType,city,budgetMin,budgetMax,source,status,notes'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== מודאל יצירת ליד =====
// Modal component matching campaigns style
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4 z-10">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

function CreateLeadModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { language } = useLanguage();
  const [values, setValues] = useState<Record<string, any>>({
    clientName: '',
    email: '',
    phone: '',
    propertyType: '',
    city: '',
    budgetMin: '',
    budgetMax: '',
    source: '',
    status: 'NEW',
    notes: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_API_BASE) ||
    (globalThis as any)?.NEXT_PUBLIC_API_BASE ||
    'http://localhost:4000';

  function set(name: string, v: any) { 
    setValues((p) => ({ ...p, [name]: v })); 
    setError(null);
  }

  const resetForm = () => {
    setValues({
      clientName: '',
      email: '',
      phone: '',
      propertyType: '',
      city: '',
      budgetMin: '',
      budgetMax: '',
      source: '',
      status: 'NEW',
      notes: '',
    });
    setError(null);
  };

  async function submit() {
    if (!values.clientName.trim()) {
      setError(language === 'he' ? 'שם לקוח חובה' : 'Client name is required');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = {
        clientName: values.clientName.trim(),
        email: values.email || null,
        phone: values.phone || null,
        propertyType: values.propertyType || null,
        city: values.city || null,
        budgetMin: values.budgetMin !== '' ? Number(values.budgetMin) : null,
        budgetMax: values.budgetMax !== '' ? Number(values.budgetMax) : null,
        source: values.source || null,
        status: values.status || 'NEW',
        notes: values.notes || null,
      };
      const res = await fetch(`${apiBase}/api/real-estate/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-org-id': 'demo' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => 'create_failed'));
      onCreated();
      onClose();
      resetForm();
    } catch {
      setError(language === 'he' ? 'יצירת ליד נכשלה' : 'Failed to create lead');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={language === 'he' ? 'ליד חדש — נדל״ן' : 'New Real-Estate Lead'}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          {/* Error display */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'שם לקוח *' : 'Client Name *'}
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
                value={values.clientName}
                onChange={e => set('clientName', e.target.value)}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
                value={values.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'טלפון' : 'Phone'}
              </label>
              <input
                type="tel"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
                value={values.phone}
                onChange={e => set('phone', e.target.value)}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'סוג נכס' : 'Property Type'}
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
                value={values.propertyType}
                onChange={e => set('propertyType', e.target.value)}
              >
                <option value="">{language === 'he' ? 'בחר סוג נכס' : 'Select property type'}</option>
                {['דירה', 'בית', 'מגרש', 'מסחרי', 'אחר'].map(o => 
                  <option key={o} value={o}>{o}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'עיר' : 'City'}
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
                value={values.city}
                onChange={e => set('city', e.target.value)}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'מקור' : 'Source'}
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
                value={values.source}
                onChange={e => set('source', e.target.value)}
                placeholder={language === 'he' ? 'פייסבוק, גוגל, המלצה...' : 'Facebook, Google, referral...'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'תקציב מינימלי' : 'Budget Min'}
              </label>
              <input
                type="number"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
                value={values.budgetMin}
                onChange={e => set('budgetMin', e.target.value)}
                placeholder="₪"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'תקציב מקסימלי' : 'Budget Max'}
              </label>
              <input
                type="number"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
                value={values.budgetMax}
                onChange={e => set('budgetMax', e.target.value)}
                placeholder="₪"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'סטטוס' : 'Status'}
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none"
                value={values.status}
                onChange={e => set('status', e.target.value)}
              >
                {['NEW', 'CONTACTED', 'MEETING', 'OFFER', 'DEAL'].map(s => 
                  <option key={s} value={s}>{tStatusRE(s, language)}</option>
                )}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'הערות' : 'Notes'}
              </label>
              <textarea
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-300 focus:outline-none resize-none"
                value={values.notes}
                onChange={e => set('notes', e.target.value)}
                rows={3}
                placeholder={language === 'he' ? 'הערות נוספות...' : 'Additional notes...'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              disabled={busy}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </button>
            <button
              onClick={submit}
              disabled={busy || !values.clientName.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? (language === 'he' ? 'שומר...' : 'Saving...') : (language === 'he' ? 'שמירה' : 'Save')}
            </button>
          </div>
        </div>

        {/* Preview/Summary */}
        <div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'he' ? 'תצוגה מקדימה' : 'Lead Preview'}
            </h3>
            <div className="space-y-3">
              {values.clientName && (
                <div>
                  <div className="text-sm text-gray-600">{language === 'he' ? 'לקוח' : 'Client'}</div>
                  <div className="font-medium">{values.clientName}</div>
                </div>
              )}
              {values.propertyType && (
                <div>
                  <div className="text-sm text-gray-600">{language === 'he' ? 'סוג נכס' : 'Property Type'}</div>
                  <div className="font-medium">{values.propertyType}</div>
                </div>
              )}
              {values.city && (
                <div>
                  <div className="text-sm text-gray-600">{language === 'he' ? 'עיר' : 'City'}</div>
                  <div className="font-medium">{values.city}</div>
                </div>
              )}
              {(values.budgetMin || values.budgetMax) && (
                <div>
                  <div className="text-sm text-gray-600">{language === 'he' ? 'תקציב' : 'Budget'}</div>
                  <div className="font-medium">
                    {values.budgetMin && values.budgetMax 
                      ? `₪${Number(values.budgetMin).toLocaleString()} - ₪${Number(values.budgetMax).toLocaleString()}`
                      : values.budgetMin 
                        ? `₪${Number(values.budgetMin).toLocaleString()}+`
                        : `Up to ₪${Number(values.budgetMax).toLocaleString()}`
                    }
                  </div>
                </div>
              )}
              {values.source && (
                <div>
                  <div className="text-sm text-gray-600">{language === 'he' ? 'מקור' : 'Source'}</div>
                  <div className="font-medium">{values.source}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600">{language === 'he' ? 'סטטוס' : 'Status'}</div>
                <div className="font-medium">{tStatusRE(values.status, language)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ===== הקומפוננטה הראשית =====
function LeadsClientContent({ items }: { items: Lead[] }) {
  const router = useRouter();
  const { language } = useLanguage();

  // חיפוש + פילטר
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('All');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (items || []).filter((l) => {
      const passStatus = status === 'All' || l.status === status;
      if (!needle) return passStatus;
      const hay = `${l.clientName ?? ''} ${l.email ?? ''} ${l.phone ?? ''} ${l.city ?? ''} ${l.propertyType ?? ''}`.toLowerCase();
      return passStatus && hay.includes(needle);
    });
  }, [items, q, status]);

  // עימוד
  const PAGE_SIZE = 25;
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

  // מודאלים
  const [showImport, setShowImport] = useState(false);
  const [importSummary, setImportSummary] = useState<{ created?: number; skipped?: number; errors?: number } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // בסיס API
  const apiBase =
    (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_API_BASE) ||
    (globalThis as any)?.NEXT_PUBLIC_API_BASE ||
    'http://localhost:4000';

  // === פעולות רשת ===
  async function openLead(id: string) {
    setSelectedId(id);
    setLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`${apiBase}/api/real-estate/leads/${id}`, { cache: 'no-store' });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        setDetail(await res.json());
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    if (selectedId) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

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
    setDetail((d) => (d && d.id === id ? { ...d, status: newStatus as Lead['status'] } : d)); // אופטימי
    try {
      const res = await fetch(`${apiBase}/api/real-estate/leads/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => 'patch_failed'));
      setDetail(await res.json());
      router.refresh();
    } catch {
      alert(language === 'he' ? 'שמירת סטטוס נכשלה' : 'Failed to save status');
    } finally {
      setOpenStatusForId(null);
    }
  }

  async function handleDeleteCurrent() {
    if (!detail?.id || deleting) return;
    try {
      setDeleting(true);
      const r = await fetch(`${apiBase}/api/real-estate/leads/${detail.id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(await r.text().catch(() => ''));
      closeModal();
      router.refresh();
    } catch {
      alert(language === 'he' ? 'מחיקה נכשלה' : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  // ===== רנדר =====
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'he' ? 'לידים' : 'Leads'}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreate(true)}
                className="rounded-xl bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
              >
                {language === 'he' ? '+ ליד חדש' : '+ New lead'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? (language === 'he' ? 'הכל' : 'All') : tStatusRE(s, language)}
                  </option>
                ))}
              </select>

              {/* הורדת תבנית CSV */}
              <a
                href="/webapi/real-estate/leads/template"
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              >
                {language === 'he' ? 'הורדת תבנית CSV' : 'Download CSV template'}
              </a>

              {/* ייבוא CSV */}
              <button
                onClick={() => setShowImport(true)}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              >
                {language === 'he' ? 'ייבוא CSV' : 'Import CSV'}
              </button>
            </div>

            {/* הודעת סיכום אחרי ייבוא */}
            {importSummary && (
              <div className="mb-4 rounded-xl border bg-green-50 p-3 text-sm text-green-700">
                {(language === 'he' ? 'ייבוא הושלם. ' : 'Import complete. ') +
                  `${language === 'he' ? 'נוצרו' : 'Created'}: ${importSummary.created ?? 0}, ` +
                  `${language === 'he' ? 'דילוגים' : 'Skipped'}: ${importSummary.skipped ?? 0}, ` +
                  `${language === 'he' ? 'שגיאות' : 'Errors'}: ${importSummary.errors ?? 0}`}
              </div>
            )}

            {visible.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
                {language === 'he' ? 'אין נתונים' : 'No data'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-semibold text-gray-700">{language==='he'?'לקוח':'Client'}</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">{language==='he'?'טלפון':'Phone'}</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">{language==='he'?'סוג נכס':'Type'}</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">{language==='he'?'עיר':'City'}</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">{language==='he'?'תקציב':'Budget'}</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">{language==='he'?'סטטוס':'Status'}</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">{language==='he'?'מקור':'Source'}</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">{language==='he'?'נוצר':'Created'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {visible.map((l) => (
                        <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            <button onClick={() => openLead(l.id)} className="text-blue-600 hover:underline">
                              {l.clientName || '(—)'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{l.email || '-'}</td>
                          <td className="px-4 py-3 text-gray-900">{l.phone || '-'}</td>
                          <td className="px-4 py-3 text-gray-900">{l.propertyType || '-'}</td>
                          <td className="px-4 py-3 text-gray-900">{l.city || '-'}</td>
                          <td className="px-4 py-3 text-gray-900">
                            {(l.budgetMin ?? null) !== null || (l.budgetMax ?? null) !== null
                              ? `${l.budgetMin ?? ''}${l.budgetMin && l.budgetMax ? ' - ' : ''}${l.budgetMax ?? ''}`
                              : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusClasses(l.status)}`}>
                              {tStatusRE(l.status, language)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{l.source || '-'}</td>
                          <td className="px-4 py-3 text-gray-600" suppressHydrationWarning>{formatIL(l.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* פוטר עימוד */}
                <div className="flex items-center justify-between py-3 text-sm text-gray-600">
                  <span>
                    {language==='he' ? 'מציג' : 'Showing'} {Math.min(shown, filtered.length)} {language==='he' ? 'מתוך' : 'of'} {filtered.length}
                  </span>
                  <button
                    onClick={() => setShown((n) => n + PAGE_SIZE)}
                    disabled={!canLoadMore}
                    className={`rounded-xl border px-3 py-2 ${canLoadMore ? 'hover:bg-gray-50' : 'opacity-50'}`}
                  >
                    {canLoadMore ? (language==='he' ? 'טען עוד' : 'Load more') : (language==='he' ? 'הכל נטען' : 'All loaded')}
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* ▼ Modal Lead */}
      {selectedId && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 transition-opacity duration-200" onClick={closeModal} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-2 text-center">
                <h2 className="text-xl font-semibold">{language==='he'?'פרטי ליד':'Lead details'}</h2>
              </div>
              <button
                onClick={closeModal}
                className="absolute right-3 top-3 rounded-full border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50"
                aria-label="Close"
              >
                ✕
              </button>

              {loading && <div className="p-6 text-center text-gray-500">Loading…</div>}
              {!loading && !detail && <div className="p-6 text-center text-red-600">{language==='he'?'שגיאה בטעינה':'Failed to load lead.'}</div>}
              {!loading && detail && (
                <div className="space-y-3">
                  <p><strong>ID:</strong> {detail.id}</p>
                  <p><strong>{language==='he'?'לקוח':'Client'}:</strong> {detail.clientName ?? '-'}</p>
                  <p><strong>Email:</strong> {detail.email ?? '-'}</p>
                  <p><strong>{language==='he'?'טלפון':'Phone'}:</strong> {detail.phone ?? '-'}</p>
                  <p><strong>{language==='he'?'סוג נכס':'Type'}:</strong> {detail.propertyType ?? '-'}</p>
                  <p><strong>{language==='he'?'עיר':'City'}:</strong> {detail.city ?? '-'}</p>
                  <p><strong>{language==='he'?'תקציב':'Budget'}:</strong> {(detail.budgetMin ?? '') || (detail.budgetMax ?? '') ? `${detail.budgetMin ?? ''}${detail.budgetMin && detail.budgetMax ? ' - ' : ''}${detail.budgetMax ?? ''}` : '-'}</p>

                  {/* סטטוס */}
                  <div className="relative flex items-center gap-3">
                    <button
                      onClick={() => setOpenStatusForId((p) => p === detail.id ? null : detail.id)}
                      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${statusClasses(detail.status)}`}
                      aria-haspopup="menu"
                      aria-expanded={openStatusForId === detail.id}
                    >
                      {tStatusRE(detail.status, language)}
                      <svg className="ml-1 h-3 w-3 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {openStatusForId === detail.id && (
                      <div className="absolute left-0 top-full">
                        <StatusMenu language={language} onPick={(s) => updateLeadStatus(detail.id, s)} />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-3">
                    {(() => {
                      const phoneNorm = normalizePhone(detail.phone);
                      const href = phoneNorm
                        ? `https://wa.me/${phoneNorm}?text=${encodeURIComponent(`שלום ${detail.clientName ?? ''}`)}`
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
                          {language==='he'?'ווטסאפ':'WhatsApp'}
                        </a>
                      );
                    })()}

                    {/* מחיקה */}
                    <button
                      onClick={handleDeleteCurrent}
                      disabled={deleting}
                      className="rounded-lg border border-red-200 text-red-600 px-4 py-2 text-sm hover:bg-red-50 disabled:opacity-60"
                    >
                      {deleting ? (language==='he'?'מוחק…':'Deleting…') : (language==='he'?'מחיקה':'Delete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ▲ Modal Lead */}

      {/* ▼ Import CSV */}
      <ImportCsvModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onDone={(sum) => setImportSummary(sum)}
      />
      {/* ▲ Import CSV */}

      {/* ▼ Create Lead */}
      <CreateLeadModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          try { router.refresh(); } catch {}
        }}
      />
      {/* ▲ Create Lead */}
    </div>
  );
}

export default function LeadsClient({ items }: { items: Lead[] }) {
  return (
    <LanguageProvider>
      <LeadsClientContent items={items} />
    </LanguageProvider>
  );
}
