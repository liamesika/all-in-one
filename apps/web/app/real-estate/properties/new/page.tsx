'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

function inputClass(extra = '') {
  return [
    "w-full border rounded-xl px-3 py-2 outline-none",
    "focus:ring focus:ring-gray-200",
    "placeholder:text-gray-400",
    "invalid:border-red-500 invalid:focus:ring-red-200",
    extra,
  ].join(' ');
}

type FileWithPreview = File & { _preview?: string };

export default function NewPropertyPage() {
  const [form, setForm] = useState({
    name: '', address: '', city: '',
    agentName: '', agentPhone: '0587878676',
    price: '', bedrooms: '', bathrooms: '', areaSqm: ''
  });

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onPickFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const addFiles = useCallback((incoming: File[]) => {
    const MAX_FILES = 20;
    const merged = [...files, ...incoming]
      .slice(0, MAX_FILES)
      .map(f => {
        const withPrev = f as FileWithPreview;
        if (!withPrev._preview) withPrev._preview = URL.createObjectURL(f);
        return withPrev;
      });
    setFiles(merged);
  }, [files]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    if (list.length) addFiles(list);
    // reset input value so selecting the same file again still triggers change
    e.currentTarget.value = '';
  }, [addFiles]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (list.length) addFiles(list);
  }, [addFiles]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFiles(prev => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      if (removed?._preview) URL.revokeObjectURL(removed._preview);
      return next;
    });
  }, []);

  const previews = useMemo(() => files.map(f => f._preview!), [files]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 1) create property
      const created = await apiFetch('/real-estate/properties', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address || undefined,
          city: form.city || undefined,
          agentName: form.agentName || undefined,
          agentPhone: form.agentPhone || undefined,
          price: form.price ? Number(form.price) : undefined,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
          areaSqm: form.areaSqm ? Number(form.areaSqm) : undefined,
        }),
      });

      // 2) upload photos if any
      if (files.length) {
        const fd = new FormData();
        files.forEach(f => fd.append('files', f));
        await apiFetch(`/real-estate/properties/${created.id}/photos/upload`, {
          method: 'POST',
          body: fd,
        });
      }

      window.location.href = `/real-estate/properties/${created.id}`;
    } catch (err: any) {
      console.error(err);
      setError('שמירה נכשלה. נסי שוב או בדקי את החיבור לשרת.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-semibold mb-4">נכס חדש</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">שם הנכס *</label>
          <input
            required
            value={form.name}
            onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
            placeholder="לדוגמה: דירת 4 חד׳ ברח׳ ויצמן"
            className={inputClass()}
          />
          <p className="text-xs text-gray-500 mt-1">שדה חובה. השדה יסומן באדום אם חסר.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">כתובת</label>
            <input
              value={form.address}
              onChange={e => setForm(s => ({ ...s, address: e.target.value }))}
              placeholder="לדוגמה: ויצמן 12"
              className={inputClass()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">עיר</label>
            <input
              value={form.city}
              onChange={e => setForm(s => ({ ...s, city: e.target.value }))}
              placeholder="תל אביב / חיפה / ..."
              className={inputClass()}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">שם הסוכן</label>
            <input
              value={form.agentName}
              onChange={e => setForm(s => ({ ...s, agentName: e.target.value }))}
              placeholder="שם מלא"
              className={inputClass()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">טלפון סוכן</label>
            <input
              value={form.agentPhone}
              onChange={e => setForm(s => ({ ...s, agentPhone: e.target.value }))}
              placeholder="לדוגמה: 0587878676"
              className={inputClass()}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">מחיר</label>
            <input
              inputMode="numeric"
              value={form.price}
              onChange={e => setForm(s => ({ ...s, price: e.target.value }))}
              placeholder="מספר"
              className={inputClass()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">חדרים</label>
            <input
              inputMode="numeric"
              value={form.bedrooms}
              onChange={e => setForm(s => ({ ...s, bedrooms: e.target.value }))}
              placeholder="מספר"
              className={inputClass()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">אמבטיות</label>
            <input
              inputMode="numeric"
              value={form.bathrooms}
              onChange={e => setForm(s => ({ ...s, bathrooms: e.target.value }))}
              placeholder="מספר"
              className={inputClass()}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">מ״ר</label>
          <input
            inputMode="numeric"
            value={form.areaSqm}
            onChange={e => setForm(s => ({ ...s, areaSqm: e.target.value }))}
            placeholder="מספר"
            className={inputClass()}
          />
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">תמונות הנכס</label>

          {/* Hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
          />

          {/* Clickable + Dropzone */}
          <div
            onClick={onPickFiles}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="cursor-pointer rounded-2xl border border-dashed p-6 text-center hover:bg-gray-50 select-none"
          >
            <p className="text-sm text-gray-600">
              גררי תמונות לכאן או <span className="underline">לחצי לבחירת קבצים</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">תמכי עד 20 תמונות בבת אחת</p>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  <img
                    src={f._preview}
                    alt=""
                    className="w-full h-28 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-1 left-1 text-xs rounded-full bg-white/90 px-2 py-1 border shadow opacity-0 group-hover:opacity-100 transition"
                    aria-label="הסרה"
                  >
                    הסרה
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <a href="/real-estate/properties" className="text-gray-600 hover:underline">ביטול</a>
          <button
            disabled={saving}
            className="bg-black text-white px-5 py-2 rounded-xl disabled:opacity-60"
          >
            {saving ? 'שומר...' : 'שמור נכס'}
          </button>
        </div>
      </form>
    </div>
  );
}
