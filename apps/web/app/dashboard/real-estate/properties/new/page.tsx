'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { Upload, Link as LinkIcon, FileText, ArrowLeft, Loader2, Check } from 'lucide-react';

type CreateMethod = 'manual' | 'yad2' | 'madlan';

export default function NewPropertyPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [method, setMethod] = useState<CreateMethod>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Manual form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    neighborhood: '',
    type: 'APARTMENT',
    transactionType: 'SALE',
    price: '',
    rentPriceMonthly: '',
    rooms: '',
    size: '',
    description: '',
  });

  // Import URL state
  const [importUrl, setImportUrl] = useState('');

  const t = {
    title: language === 'he' ? 'נכס חדש' : 'New Property',
    back: language === 'he' ? 'חזרה' : 'Back',
    manual: language === 'he' ? 'הזנה ידנית' : 'Manual Entry',
    yad2: language === 'he' ? 'ייבוא מיד2' : 'Import from Yad2',
    madlan: language === 'he' ? 'ייבוא ממדלן' : 'Import from Madlan',
    name: language === 'he' ? 'שם הנכס' : 'Property Name',
    address: language === 'he' ? 'כתובת' : 'Address',
    city: language === 'he' ? 'עיר' : 'City',
    neighborhood: language === 'he' ? 'שכונה' : 'Neighborhood',
    type: language === 'he' ? 'סוג נכס' : 'Property Type',
    transactionType: language === 'he' ? 'סוג עסקה' : 'Transaction Type',
    price: language === 'he' ? 'מחיר' : 'Price',
    rentPrice: language === 'he' ? 'מחיר שכירות חודשי' : 'Monthly Rent',
    rooms: language === 'he' ? 'חדרים' : 'Rooms',
    size: language === 'he' ? 'גודל (מ"ר)' : 'Size (sqm)',
    description: language === 'he' ? 'תיאור' : 'Description',
    create: language === 'he' ? 'צור נכס' : 'Create Property',
    import: language === 'he' ? 'ייבא' : 'Import',
    pasteUrl: language === 'he' ? 'הדבק קישור' : 'Paste URL',
    yad2Placeholder: language === 'he' ? 'https://www.yad2.co.il/...' : 'https://www.yad2.co.il/...',
    madlanPlaceholder: language === 'he' ? 'https://www.madlan.co.il/...' : 'https://www.madlan.co.il/...',
    sale: language === 'he' ? 'מכירה' : 'Sale',
    rent: language === 'he' ? 'השכרה' : 'Rent',
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.transactionType === 'SALE' ? parseInt(formData.price) || null : null,
          rentPriceMonthly: formData.transactionType === 'RENT' ? parseInt(formData.rentPriceMonthly) || null : null,
          rooms: parseInt(formData.rooms) || null,
          size: parseInt(formData.size) || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create property');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/real-estate/properties'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (source: 'yad2' | 'madlan') => {
    if (!importUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/properties/import/${source}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to import from ${source}`);
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/real-estate/properties'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white dark:bg-[#1A2F4B] rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'he' ? 'נכס נוצר בהצלחה!' : 'Property Created!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'he' ? 'מעביר לדף הנכסים...' : 'Redirecting to properties...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        </div>

        {/* Method Tabs */}
        <div className="bg-white dark:bg-[#1A2F4B] rounded-xl shadow-lg border border-gray-200 dark:border-[#2979FF]/20">
          <div className="border-b border-gray-200 dark:border-[#2979FF]/20">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setMethod('manual')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  method === 'manual'
                    ? 'border-[#2979FF] text-[#2979FF]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                {t.manual}
              </button>
              <button
                onClick={() => setMethod('yad2')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  method === 'yad2'
                    ? 'border-[#2979FF] text-[#2979FF]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                {t.yad2}
              </button>
              <button
                onClick={() => setMethod('madlan')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  method === 'madlan'
                    ? 'border-[#2979FF] text-[#2979FF]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                {t.madlan}
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Manual Form */}
            {method === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.name} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.address}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.city}
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.neighborhood}
                    </label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.type}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    >
                      <option value="APARTMENT">Apartment</option>
                      <option value="HOUSE">House</option>
                      <option value="VILLA">Villa</option>
                      <option value="PENTHOUSE">Penthouse</option>
                      <option value="DUPLEX">Duplex</option>
                      <option value="OFFICE">Office</option>
                      <option value="COMMERCIAL">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.transactionType}
                    </label>
                    <select
                      value={formData.transactionType}
                      onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    >
                      <option value="SALE">{t.sale}</option>
                      <option value="RENT">{t.rent}</option>
                    </select>
                  </div>

                  {formData.transactionType === 'SALE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.price} (₪)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                      />
                    </div>
                  )}

                  {formData.transactionType === 'RENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.rentPrice} (₪)
                      </label>
                      <input
                        type="number"
                        value={formData.rentPriceMonthly}
                        onChange={(e) => setFormData({ ...formData, rentPriceMonthly: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.rooms}
                    </label>
                    <input
                      type="number"
                      value={formData.rooms}
                      onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.size}
                    </label>
                    <input
                      type="number"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.description}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2979FF] hover:bg-[#1e5bb8] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.create}
                </button>
              </form>
            )}

            {/* Yad2 Import */}
            {method === 'yad2' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.pasteUrl}
                  </label>
                  <input
                    type="url"
                    placeholder={t.yad2Placeholder}
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => handleImport('yad2')}
                  disabled={loading}
                  className="w-full bg-[#2979FF] hover:bg-[#1e5bb8] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.import}
                </button>
              </div>
            )}

            {/* Madlan Import */}
            {method === 'madlan' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.pasteUrl}
                  </label>
                  <input
                    type="url"
                    placeholder={t.madlanPlaceholder}
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => handleImport('madlan')}
                  disabled={loading}
                  className="w-full bg-[#2979FF] hover:bg-[#1e5bb8] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.import}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
