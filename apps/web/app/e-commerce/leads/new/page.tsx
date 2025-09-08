'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

type FormState = {
  name: string;
  email: string;
  phone: string;
  interest: string;
  budget: string;
  source: string;
  notes: string;
  score: string;
};

export default function NewLeadPage() {
  const router = useRouter();
  const [f, setF] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    interest: '',
    budget: '',
    source: 'website',
    notes: '',
    score: '',
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!f.name.trim()) {
      setErr('Name is required');
      return;
    }

    setLoading(true);
    try {
      // נבנה payload נקי; ממירים מספרים אם מולאו
      const payload: any = {
        name: f.name.trim(),
        email: f.email.trim() || null,
        phone: f.phone.trim() || null,
        interest: f.interest.trim() || null,
        source: f.source || 'website',
        notes: f.notes.trim() || undefined,
      };
      if (f.budget.trim()) payload.budget = Number(f.budget);
      if (f.score.trim()) payload.score = Number(f.score);

      // מנסים קודם POST /api/leads (כפי שנהוג),
      // ואם אין — ננסה גם /api/leads/create כגיבוי.
      let res = await fetch(`${apiBase}/api/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 404) {
        res = await fetch(`${apiBase}/api/leads/create`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Create failed');
      }

      // חזרה לרשימת הלידים + רענון SSR כדי לראות את הליד החדש
      router.push('/e-commerce/leads');
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">New Lead</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm mb-1">Name *</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={f.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Full name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={f.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={f.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+9725..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Interest</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={f.interest}
            onChange={(e) => set('interest', e.target.value)}
            placeholder="Product / service"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Budget</label>
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={f.budget}
              onChange={(e) => set('budget', e.target.value)}
              placeholder="e.g. 1500"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Score</label>
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={f.score}
              onChange={(e) => set('score', e.target.value)}
              placeholder="0-100"
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Source</label>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={f.source}
              onChange={(e) => set('source', e.target.value)}
            >
              <option value="website">Website</option>
              <option value="csv">CSV</option>
              <option value="sheet">Google Sheets</option>
              <option value="fb-ig-ads">FB/IG Lead Ads</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Notes</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={4}
            value={f.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Anything useful…"
          />
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Create lead'}
          </button>
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
