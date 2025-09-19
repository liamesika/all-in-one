'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';
import { EffinityHeader } from '@/components/effinity-header';

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

function NewPropertyPageContent() {
  const { t, language } = useLanguage();
  const [form, setForm] = useState({
    name: '', address: '', city: '',
    agentName: '', agentPhone: '050-1234567',
    price: '', rooms: '', size: ''
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
          rooms: form.rooms ? Number(form.rooms) : undefined,
          size: form.size ? Number(form.size) : undefined,
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
      setError('Failed to save. Please try again or check connection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EffinityHeader variant="dashboard" />

      {/* Page Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">{t('newProperty.title')}</h1>
          <p className="text-blue-100 mb-6">
            {language === 'he' ? 'הוספת נכס חדש למערכת' : 'Add a new property to the system'}
          </p>
          <a
            href="/real-estate/properties"
            className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white font-medium hover:bg-white/30 transition-colors"
          >
            ← {language === 'he' ? 'חזרה לנכסים' : 'Back to Properties'}
          </a>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.propertyName')} *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
              placeholder={t('newProperty.propertyNamePlaceholder')}
              className={inputClass()}
              dir={language === 'he' ? 'rtl' : 'ltr'}
            />
            <p className="text-xs text-gray-500 mt-1">{t('newProperty.propertyNameRequired')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.address')}</label>
              <input
                value={form.address}
                onChange={e => setForm(s => ({ ...s, address: e.target.value }))}
                placeholder={t('newProperty.addressPlaceholder')}
                className={inputClass()}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.city')}</label>
              <input
                value={form.city}
                onChange={e => setForm(s => ({ ...s, city: e.target.value }))}
                placeholder={t('newProperty.cityPlaceholder')}
                className={inputClass()}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.agentName')}</label>
              <input
                value={form.agentName}
                onChange={e => setForm(s => ({ ...s, agentName: e.target.value }))}
                placeholder={t('newProperty.agentNamePlaceholder')}
                className={inputClass()}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.agentPhone')}</label>
              <input
                value={form.agentPhone}
                onChange={e => setForm(s => ({ ...s, agentPhone: e.target.value }))}
                placeholder={t('newProperty.agentPhonePlaceholder')}
                className={inputClass()}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.price')}</label>
              <input
                inputMode="numeric"
                value={form.price}
                onChange={e => setForm(s => ({ ...s, price: e.target.value }))}
                placeholder={t('newProperty.pricePlaceholder')}
                className={inputClass()}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.rooms')}</label>
              <input
                inputMode="numeric"
                value={form.rooms}
                onChange={e => setForm(s => ({ ...s, rooms: e.target.value }))}
                placeholder={t('newProperty.roomsPlaceholder')}
                className={inputClass()}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.size')}</label>
              <input
                inputMode="numeric"
                value={form.size}
                onChange={e => setForm(s => ({ ...s, size: e.target.value }))}
                placeholder={t('newProperty.sizePlaceholder')}
                className={inputClass()}
              />
            </div>
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold mb-2 text-gray-700">{t('newProperty.photos')}</label>

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
                {t('newProperty.photosDropText')}
              </p>
              <p className="text-xs text-gray-400 mt-1">{t('newProperty.photosSupport')}</p>
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
                      aria-label={t('newProperty.removePhoto')}
                    >
                      {t('newProperty.removePhoto')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              disabled={saving}
              className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-6 py-2 rounded-xl disabled:opacity-60 hover:from-blue-900 hover:to-blue-700 transition-all"
            >
              {saving ? t('newProperty.saving') : t('newProperty.save')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

export default function NewPropertyPage() {
  return (
    <LanguageProvider>
      <NewPropertyPageContent />
    </LanguageProvider>
  );
}
