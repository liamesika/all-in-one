'use client';
import { useEffect, useMemo, useState } from 'react';
import { EffinityHeader } from '@/components/effinity-header';
import { LanguageProvider, useLanguage } from '@/lib/language-context';

type JobStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELED';
type LogLevel = 'info' | 'error';
type LogEntry = { ts: string; level: LogLevel; msg: string };
type Job = {
  id: string;
  type: string;
  status: JobStatus;
  createdAt?: string;
  progress?: number;           // 0..100
  logs?: LogEntry[];
  metrics?: Record<string, any>;
};

const ORG_HEADERS: Record<string, string> = { 'x-org-id': 'demo' };

type Mode = 'zip2csv' | 'shopify';
type Defaults = {
  vendor?: string;
  price?: number | '';
  inventoryQty?: number | '';
  inventoryPolicy?: 'deny' | 'continue';
  requiresShipping?: boolean;
  taxable?: boolean;
  fulfillment?: 'manual';
  status?: 'active' | 'draft' | 'archived';
  weightUnit?: 'g' | 'kg' | 'lb' | 'oz';
  productType?: string;
  productCategory?: string;
  tags?: string;
  published?: boolean;
};

function parseChatToDefs(text: string): Partial<Defaults> {
  const out: Partial<Defaults> = {};
  const lc = text.toLowerCase();
  const num = (re: RegExp) => { const m = lc.match(re); return m ? Number(m[1]) : undefined; };
  const str = (re: RegExp) => { const m = text.match(re); return m ? m[1].trim() : undefined; };
  const bool = (re: RegExp) => { const m = lc.match(re); if (!m) return undefined; return ['true','1','yes','on'].includes(m[1]); };

  const p = num(/price\s+(\d+(?:\.\d+)?)/); if (p !== undefined) out.price = p;
  const q = (() => { const m = lc.match(/(?:inventory\s+qty|qty)\s+(\d+)/); return m ? Number(m[1]) : undefined; })(); if (q !== undefined) out.inventoryQty = q;

  const st = str(/status\s+(active|draft|archived)/i); if (st) out.status = st.toLowerCase() as any;
  const pol = str(/(?:policy|inventory\s+policy)\s+(deny|continue)/i); if (pol) out.inventoryPolicy = pol.toLowerCase() as any;
  const wu = str(/weight\s*unit\s+(g|kg|lb|oz)/i); if (wu) out.weightUnit = wu.toLowerCase() as any;

  const pub = bool(/published\s+(true|false|1|0|yes|no|on|off)/); if (pub !== undefined) out.published = pub;
  const ship = bool(/requires?\s+shipping\s+(true|false|1|0|yes|no|on|off)/); if (ship !== undefined) out.requiresShipping = ship;
  const tax = bool(/taxable\s+(true|false|1|0|yes|no|on|off)/); if (tax !== undefined) out.taxable = tax;

  const vendor = str(/vendor\s+(.+)/i); if (vendor) out.vendor = vendor;
  const tags = str(/tags?\s+(.+)/i); if (tags) out.tags = tags;
  const ptype = str(/(?:type|product\s*type)\s+(.+)/i); if (ptype) out.productType = ptype;
  const pcat = str(/(?:category|product\s*category)\s+(.+)/i); if (pcat) out.productCategory = pcat;

  return out;
}
function mergeFormWithChat(form: Defaults, chatDefs: Partial<Defaults>): Defaults {
  const merged: Defaults = { ...form };
  (Object.keys(chatDefs) as (keyof Defaults)[]).forEach((k) => {
    const formVal = merged[k];
    const chatVal = chatDefs[k];
    const isEmpty =
      formVal === undefined ||
      formVal === null ||
      (typeof formVal === 'string' && formVal.trim() === '') ||
      (typeof formVal === 'number' && Number.isNaN(formVal as any)) ||
      formVal === '';
    if (isEmpty && chatVal !== undefined) (merged as any)[k] = chatVal;
  });
  return merged;
}

function ShopifyCsvToolContent() {
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [mode, setMode] = useState<Mode>('shopify');
  const [defs, setDefs] = useState<Defaults>({
    vendor: '',
    price: 99.9,
    inventoryQty: 100,
    inventoryPolicy: 'continue',
    requiresShipping: true,
    taxable: true,
    fulfillment: 'manual',
    status: 'active',
    weightUnit: 'g',
    productType: '',
    productCategory: '',
    tags: '',
    published: true,
  });

  const [chat, setChat] = useState('');
  const [openLogs, setOpenLogs] = useState<Record<string, boolean>>({});

  // --------- data loading + auto refresh while running ----------
  const anyRunning = useMemo(
    () => jobs.some(j => j.status === 'PENDING' || j.status === 'RUNNING'),
    [jobs]
  );

  async function load() {
    setErr(null);
    try {
      const res = await fetch('/api/jobs', { headers: ORG_HEADERS });
      if (!res.ok) throw new Error(`GET /api/jobs failed: ${res.status} ${res.statusText}`);
      setJobs(await res.json());
    } catch (e: any) {
      console.error('Load jobs error:', e);
      setErr(e?.message || 'Failed loading jobs');
      setJobs([]);
    }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!anyRunning) return;
    const t = setTimeout(load, 1500); // פולינג רך
    return () => clearTimeout(t);
  }, [anyRunning, jobs]);

  async function createJobDummy() {
    setBusy(true); setErr(null);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ORG_HEADERS },
        body: JSON.stringify({ type: 'dummy' }),
      });
      if (!res.ok) throw new Error(`POST /api/jobs failed: ${res.status} ${res.statusText}`);
      await load();
    } catch (e: any) {
      console.error('Create job error:', e);
      setErr(e?.message || 'Failed creating job');
      alert(e?.message || 'Failed');
    } finally { setBusy(false); }
  }

  async function uploadShopify(merged: Defaults) {
    if (!file) { alert('בחרי קובץ ZIP'); return; }
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(merged).forEach(([k, v]) => {
        if (v !== '' && v !== undefined && v !== null) fd.append(k, String(v));
      });
      const res = await fetch('/api/uploads?mode=shopify&ai=1', {
        method: 'POST',
        headers: ORG_HEADERS, // מה שיש לך היום
        body: fd,             // FormData עם ה-ZIP והטופס
      });
      if (!res.ok) throw new Error(`POST /api/uploads?mode=shopify failed: ${res.status} ${res.statusText}`);
      await load();
      alert('Shopify CSV נוצר בהצלחה!');
      setFile(null);
    } catch (e: any) {
      console.error('Upload(shopify) error:', e);
      setErr(e?.message || 'Upload failed');
      alert(e?.message || 'Upload failed');
    } finally { setBusy(false); }
  }

  async function uploadZip() {
    if (!file) { alert('בחרי קובץ'); return; }
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      let url = '/api/uploads';
      if (mode === 'shopify') {
        url += '?mode=shopify';
        Object.entries(defs).forEach(([k, v]) => {
          if (v !== '' && v !== undefined && v !== null) fd.append(k, String(v));
        });
      }
      const res = await fetch(url, { method: 'POST', headers: ORG_HEADERS, body: fd });
      if (!res.ok) throw new Error(`POST ${url} failed: ${res.status} ${res.statusText}`);
      await load();
      alert(mode === 'shopify' ? 'Shopify CSV נוצר בהצלחה!' : 'הקובץ הועלה ונוצר Job!');
      setFile(null);
    } catch (e: any) {
      console.error('Upload error:', e);
      setErr(e?.message || 'Upload failed');
      alert(e?.message || 'Upload failed');
    } finally { setBusy(false); }
  }

  function applyChat() {
    const patch = parseChatToDefs(chat.trim());
    setDefs(prev => ({ ...prev, ...patch }));
    alert('הטופס עודכן מהצ׳אט.');
  }
  async function applyChatAndUpload() {
    if (!file) { alert('בחרי קובץ ZIP'); return; }
    const patch = parseChatToDefs(chat.trim());
    const merged = mergeFormWithChat(defs, patch);
    await uploadShopify(merged);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EffinityHeader variant="dashboard" />
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {language === 'he' ? 'Shopify CSV כלים' : 'Shopify CSV Tools'}
              </h1>
              <p className="text-blue-100 mt-2">
                {language === 'he' ? 'ייצור מוצרים ל-Shopify באמצעות AI' : 'AI-powered Shopify product generation'}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={uploadZip}
                disabled={busy || !file}
                className="bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-2 rounded-xl text-white font-semibold hover:bg-white/30 transition-all transform hover:scale-105 disabled:opacity-60"
              >
                {busy ? (language === 'he' ? 'עובד...' : 'Working...') : (language === 'he' ? 'יצירת CSV' : 'Generate CSV')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="hidden md:block col-span-2">
            <div className="sticky top-6 rounded-2xl bg-white shadow-xl border p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">E</div>
                <div className="font-semibold">EFFINITY</div>
              </div>
              <nav className="space-y-1 text-sm">
                <a className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50" href="/e-commerce/dashboard">
                  {language === 'he' ? 'דשבורד' : 'Dashboard'}
                </a>
                <a className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-medium" href="/e-commerce/shopify-csv">
                  Shopify CSV
                </a>
                <a className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50" href="/e-commerce/leads">
                  {language === 'he' ? 'לידים' : 'Leads'}
                </a>
                <a className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50" href="/e-commerce/campaigns">
                  {language === 'he' ? 'קמפיינים' : 'Campaigns'}
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 md:col-span-10">
            <div className="grid gap-6 md:grid-cols-3">
              {/* שמאל: העלאה והגדרות */}
              <div className="md:col-span-2 space-y-6">
                <div className="rounded-2xl bg-white shadow-xl border p-6">
                  <h2 className="mb-3 text-lg font-semibold text-gray-900">Upload → {mode === 'shopify' ? 'Shopify CSV' : 'ZIP → CSV'}</h2>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="mode" value="shopify" checked={mode === 'shopify'} onChange={() => setMode('shopify')} />
              Shopify CSV
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="mode" value="zip2csv" checked={mode === 'zip2csv'} onChange={() => setMode('zip2csv')} />
              ZIP → CSV (פלט טכני)
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
            <button
              onClick={uploadZip}
              disabled={busy || !file}
              className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-60 mr-2"
            >
              {busy ? 'Working…' : (mode === 'shopify' ? 'Upload as Shopify' : 'Upload ZIP & Create Job')}
            </button>
            <button
              onClick={createJobDummy}
              disabled={busy}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60 mr-2"
            >
              Create Dummy Job
            </button>
            <button
              onClick={load}
              disabled={busy}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          {file && <div className="mt-2 text-xs opacity-70">Selected: {file.name}</div>}

          {mode === 'shopify' && (
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs opacity-70">Vendor</label>
                <input className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm focus:border-blue-300 focus:outline-none" value={defs.vendor ?? ''} onChange={e => setDefs({ ...defs, vendor: e.target.value })}/>
              </div>
              <div>
                <label className="text-xs opacity-70">Price</label>
                <input type="number" step="0.01" className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm focus:border-blue-300 focus:outline-none" value={defs.price as any ?? ''} onChange={e => setDefs({ ...defs, price: e.target.value === '' ? '' : Number(e.target.value) })}/>
              </div>
              <div>
                <label className="text-xs opacity-70">Inventory Qty</label>
                <input type="number" className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm focus:border-blue-300 focus:outline-none" value={defs.inventoryQty as any ?? ''} onChange={e => setDefs({ ...defs, inventoryQty: e.target.value === '' ? '' : Number(e.target.value) })}/>
              </div>
              <div>
                <label className="text-xs opacity-70">Inventory Policy</label>
                <select className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm focus:border-blue-300 focus:outline-none" value={defs.inventoryPolicy ?? 'continue'} onChange={e => setDefs({ ...defs, inventoryPolicy: e.target.value as any })}>
                  <option value="continue">continue</option>
                  <option value="deny">deny</option>
                </select>
              </div>
              <div>
                <label className="text-xs opacity-70">Status</label>
                <select className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm focus:border-blue-300 focus:outline-none" value={defs.status ?? 'active'} onChange={e => setDefs({ ...defs, status: e.target.value as any })}>
                  <option value="active">active</option>
                  <option value="draft">draft</option>
                  <option value="archived">archived</option>
                </select>
              </div>
              <div>
                <label className="text-xs opacity-70">Weight Unit</label>
                <select className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm focus:border-blue-300 focus:outline-none" value={defs.weightUnit ?? 'g'} onChange={e => setDefs({ ...defs, weightUnit: e.target.value as any })}>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </select>
              </div>
              <div>
                <label className="text-xs opacity-70">Product Type</label>
                <input className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm focus:border-blue-300 focus:outline-none" value={defs.productType ?? ''} onChange={e => setDefs({ ...defs, productType: e.target.value })}/>
              </div>
              <div>
                <label className="text-xs opacity-70">Product Category</label>
                <input className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm focus:border-blue-300 focus:outline-none" value={defs.productCategory ?? ''} onChange={e => setDefs({ ...defs, productCategory: e.target.value })}/>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs opacity-70">Tags (comma separated)</label>
                <input className="w-full rounded-xl border border-gray-200 bg-white p-2 text-sm focus:border-blue-300 focus:outline-none" value={defs.tags ?? ''} onChange={e => setDefs({ ...defs, tags: e.target.value })}/>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!defs.published} onChange={e => setDefs({ ...defs, published: e.target.checked })}/>
                  Published
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!defs.requiresShipping} onChange={e => setDefs({ ...defs, requiresShipping: e.target.checked })}/>
                  Requires Shipping
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!defs.taxable} onChange={e => setDefs({ ...defs, taxable: e.target.checked })}/>
                  Taxable
                </label>
              </div>
            </div>
          )}

          {err && <div className="mt-3 text-sm text-red-400">Error: {err}</div>}
                </div>

                <div className="rounded-2xl bg-white shadow-xl border p-6">
                  <h3 className="mb-3 text-base font-semibold text-gray-900">Jobs</h3>
                  <ul className="space-y-2">
            {jobs.map((j) => {
              const running = j.status === 'PENDING' || j.status === 'RUNNING';
              const p = j.progress ?? (running ? 1 : j.status === 'SUCCESS' ? 100 : 0);
              return (
                    <li key={j.id} className="rounded-xl bg-gray-50 border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{j.type}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{j.id}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {running && (
                        <div className="w-40 h-2 rounded bg-gray-200 overflow-hidden">
                          <div className="h-2 bg-blue-500" style={{ width: `${p}%` }} />
                        </div>
                      )}
                      <span className="text-xs uppercase text-gray-600 font-medium">{j.status}</span>
                      {j.status === 'SUCCESS' && (
                        <a href={`/api/jobs/${j.id}/output`} className="text-xs text-blue-600 hover:text-blue-700 underline" download rel="noopener noreferrer">
                          Download CSV
                        </a>
                      )}
                      <button
                        className="text-xs text-gray-600 hover:text-gray-800 underline"
                        onClick={() => setOpenLogs(prev => ({ ...prev, [j.id]: !prev[j.id] }))}
                      >
                        {openLogs[j.id] ? 'Hide logs' : 'Logs'}
                      </button>
                    </div>
                  </div>

                  {openLogs[j.id] && (
                    <div className="mt-2 rounded-xl bg-gray-100 border p-2 text-xs leading-relaxed">
                      {(j.logs || []).slice(-50).map((l, idx) => (
                        <div key={idx} className={l.level === 'error' ? 'text-red-600' : 'text-gray-700'}>
                          <span className="text-gray-500">{new Date(l.ts).toLocaleTimeString()} · </span>
                          <span>{l.msg}</span>
                        </div>
                      ))}
                      {!j.logs?.length && <div className="text-gray-500">No logs yet…</div>}
                    </div>
                  )}

                  {j.metrics && (
                    <div className="mt-2 text-[11px] text-gray-500">
                      {Object.entries(j.metrics).map(([k, v]) => (
                        <span key={k} className="mr-3">{k}: {String(v)}</span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
                    {!jobs.length && <div className="text-gray-500 text-center py-4">No jobs yet.</div>}
                  </ul>
                </div>
              </div>

              {/* ימין: "צ'אט AI" */}
              <div className="space-y-4">
                <div className="rounded-2xl bg-white shadow-xl border p-6">
                  <h3 className="mb-2 text-base font-semibold text-gray-900">AI Chat</h3>
                  <p className="mb-2 text-xs text-gray-600">
                    {language === 'he' ? 'כתבי הוראות חופשיות. דוגמאות: "vendor Zara", "price 129.9", "status draft", "tags summer, swimwear"' : 'Write free-form instructions. Examples: "vendor Zara", "price 129.9", "status draft", "tags summer, swimwear"'}
                  </p>
                  <textarea
                    className="h-40 w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-blue-300 focus:outline-none"
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    placeholder={language === 'he' ? 'תני הוראות...' : 'Enter instructions...'}
                    dir={language === 'he' ? 'rtl' : 'ltr'}
                  />
                  <div className="mt-2 flex flex-wrap gap-3">
                    <button 
                      onClick={applyChat} 
                      disabled={busy}
                      className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-60"
                    >
                      {language === 'he' ? 'החל על הטופס' : 'Apply to form'}
                    </button>
                    <button 
                      onClick={async () => { await applyChatAndUpload(); }} 
                      disabled={busy || !file}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                    >
                      {language === 'he' ? 'החל והעלה (Shopify)' : 'Apply & Upload (Shopify)'}
                    </button>
                  </div>
                  {!file && (
                    <div className="mt-2 text-xs text-gray-500">
                      {language === 'he' ? '* לביצוע העלאה צריך לבחור ZIP (אפשר לבחור בצד שמאל).' : '* Upload requires a ZIP file (can be selected on the left).'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ShopifyCsvTool() {
  return (
    <LanguageProvider>
      <ShopifyCsvToolContent />
    </LanguageProvider>
  );
}
