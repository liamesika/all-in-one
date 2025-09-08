'use client';
import React, { useState } from 'react';

type Field =
  | { name: string; label: string; required?: boolean; type?: 'text' | 'number' | 'select' | 'textarea'; options?: string[]; defaultValue?: any };

const fieldsByMode: Record<string, Field[]> = {
  'real-estate': [
    { name: 'clientName', label: 'לקוח', required: true },
    { name: 'phone', label: 'טלפון' },
    { name: 'email', label: 'אימייל' },
    { name: 'propertyType', label: 'סוג נכס', type: 'select', options: ['דירה','בית','מגרש','מסחרי','אחר'] },
    { name: 'city', label: 'עיר' },
    { name: 'budgetMin', label: 'תקציב מ־', type: 'number' },
    { name: 'budgetMax', label: 'תקציב עד', type: 'number' },
    { name: 'status', label: 'סטטוס', type: 'select', options: ['NEW','CONTACTED','MEETING','OFFER','DEAL'], defaultValue: 'NEW' },
    { name: 'source', label: 'מקור' },
    { name: 'notes', label: 'הערות', type: 'textarea' },
  ],
  // אפשר להוסיף מצבים נוספים בהמשך (ecommerce וכו')
};

export default function LeadForm({
  mode = 'real-estate',
  onSubmit,
}: {
  mode?: string;
  onSubmit: (payload: Record<string, any>) => Promise<void> | void;
}) {
  const fields = fieldsByMode[mode] || [];
  const initial = Object.fromEntries(fields.map(f => [f.name, f.defaultValue ?? '']));
  const [values, setValues] = useState<Record<string, any>>(initial);
  const [submitting, setSubmitting] = useState(false);

  function set(name: string, val: any) {
    setValues((prev) => ({ ...prev, [name]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      // המרות בסיסיות
      const payload = { ...values };
      if (payload.budgetMin !== '') payload.budgetMin = Number(payload.budgetMin);
      else payload.budgetMin = null;
      if (payload.budgetMax !== '') payload.budgetMax = Number(payload.budgetMax);
      else payload.budgetMax = null;

      await onSubmit(payload);
      setValues(initial); // איפוס טופס
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {fields.map((f) => (
          <label key={f.name} className="flex flex-col gap-1">
            <span className="text-sm text-gray-700">{f.label}{f.required ? ' *' : ''}</span>
            {f.type === 'textarea' ? (
              <textarea
                className="border rounded px-3 py-2"
                required={!!f.required}
                value={values[f.name] ?? ''}
                onChange={(e) => set(f.name, e.target.value)}
              />
            ) : f.type === 'select' ? (
              <select
                className="border rounded px-3 py-2"
                required={!!f.required}
                value={values[f.name] ?? f.defaultValue ?? ''}
                onChange={(e) => set(f.name, e.target.value)}
              >
                <option value="">{f.required ? 'בחרי…' : '—'}</option>
                {(f.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                className="border rounded px-3 py-2"
                required={!!f.required}
                value={values[f.name] ?? ''}
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>

      <div className="flex gap-2 justify-start">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {submitting ? 'שומרת…' : 'שמירה'}
        </button>
      </div>
    </form>
  );
}
