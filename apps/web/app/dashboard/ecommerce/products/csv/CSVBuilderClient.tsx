'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Sparkles,
  Download,
  ChevronRight,
  Image as ImageIcon,
  DollarSign,
  Check,
  X,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
} from '@/components/shared';
import { EcommerceHeader } from '@/components/dashboard/RealEstateHeader';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface PricingRule {
  type: 'fixed' | 'percent' | 'multiplier';
  value: number;
  rounding: 'none' | '.90' | '.99';
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tags: string;
  imageUrl: string;
  status: 'pending' | 'generated' | 'error';
}

export function CSVBuilderClient() {
  const router = useRouter();
  const { lang } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [pricingRule, setPricingRule] = useState<PricingRule>({
    type: 'fixed',
    value: 50,
    rounding: '.99',
  });
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'he' | 'both'>('en');
  const [aliExpressUrl, setAliExpressUrl] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const handleUploadImages = async () => {
    if (images.length === 0) return;

    setUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const formData = new FormData();
      images.forEach(img => formData.append('images', img));

      const response = await fetch('/api/ecommerce/csv/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newProducts = data.uploadedUrls.map((url: string, i: number) => ({
          id: `product-${Date.now()}-${i}`,
          name: '',
          description: '',
          price: 0,
          tags: '',
          imageUrl: url,
          status: 'pending' as const,
        }));
        setProducts(newProducts);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (products.length === 0) return;

    setGenerating(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/ecommerce/csv/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: products.map(p => p.imageUrl),
          targetLanguage,
          pricingRule,
          aliExpressUrl: aliExpressUrl || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(prev =>
          prev.map((p, i) => ({
            ...p,
            name: data.products[i]?.name || p.name,
            description: data.products[i]?.description || p.description,
            price: applyPricingRule(data.products[i]?.basePrice || 0),
            tags: data.products[i]?.tags || p.tags,
            status: 'generated' as const,
          }))
        );
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const applyPricingRule = (basePrice: number): number => {
    let price = basePrice;

    if (pricingRule.type === 'fixed') {
      price = pricingRule.value;
    } else if (pricingRule.type === 'percent') {
      price = basePrice * (1 + pricingRule.value / 100);
    } else if (pricingRule.type === 'multiplier') {
      price = basePrice * pricingRule.value;
    }

    if (pricingRule.rounding === '.90') {
      price = Math.floor(price) + 0.9;
    } else if (pricingRule.rounding === '.99') {
      price = Math.floor(price) + 0.99;
    }

    return Math.round(price * 100) / 100;
  };

  const handleExportCSV = () => {
    const headers = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 'Image Src', 'Variant Price'];
    const rows = products.map(p => [
      p.name.toLowerCase().replace(/\s+/g, '-'),
      p.name,
      `<p>${p.description}</p>`,
      'Your Store',
      'Physical',
      p.tags,
      'TRUE',
      p.imageUrl,
      p.price.toString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopify-products-${Date.now()}.csv`;
    a.click();
  };

  const handlePushToShopify = async () => {
    // Feature flagged - only works if ECOM_SHOPIFY_PUSH is enabled
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ecommerce/csv/push-shopify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });

      if (response.ok) {
        alert(lang === 'he' ? 'המוצרים הועלו ל-Shopify בהצלחה!' : 'Products pushed to Shopify successfully!');
      }
    } catch (error) {
      console.error('Push to Shopify failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      <EcommerceHeader />

      <div className="pt-24 pb-16 max-w-full mx-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] mb-4 transition-colors"
          >
            <ChevronRight className={`w-5 h-5 ${lang === 'he' ? '' : 'rotate-180'}`} />
            <span>{lang === 'he' ? 'חזרה' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <Upload className="w-8 h-8 text-[#2979FF]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {lang === 'he' ? 'בונה CSV למוצרים' : 'Product CSV Builder'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {lang === 'he'
                  ? 'יצירת מוצרים אוטומטית עם AI והעלאה ל-Shopify'
                  : 'Automatically create products with AI and upload to Shopify'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Upload Section */}
            <UniversalCard variant="elevated">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lang === 'he' ? '1. העלה תמונות' : '1. Upload Images'}
                </h3>
              </CardHeader>
              <CardBody>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#2979FF] transition-colors"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {images.length > 0
                      ? `${images.length} ${lang === 'he' ? 'תמונות נבחרו' : 'images selected'}`
                      : lang === 'he'
                      ? 'לחץ לבחירת תמונות'
                      : 'Click to select images'}
                  </span>
                </button>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {lang === 'he' ? 'קישור AliExpress (אופציונלי)' : 'AliExpress URL (Optional)'}
                  </label>
                  <input
                    type="url"
                    value={aliExpressUrl}
                    onChange={e => setAliExpressUrl(e.target.value)}
                    placeholder="https://www.aliexpress.com/item/..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <UniversalButton
                  onClick={handleUploadImages}
                  disabled={images.length === 0 || uploading}
                  className="w-full mt-4"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {lang === 'he' ? 'מעלה...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {lang === 'he' ? 'העלה ל-S3' : 'Upload to S3'}
                    </>
                  )}
                </UniversalButton>
              </CardBody>
            </UniversalCard>

            {/* AI Generation Settings */}
            <UniversalCard variant="elevated">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lang === 'he' ? '2. הגדרות AI' : '2. AI Settings'}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {lang === 'he' ? 'שפת תוכן' : 'Content Language'}
                    </label>
                    <select
                      value={targetLanguage}
                      onChange={e => setTargetLanguage(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="en">{lang === 'he' ? 'אנגלית' : 'English'}</option>
                      <option value="he">{lang === 'he' ? 'עברית' : 'Hebrew'}</option>
                      <option value="both">{lang === 'he' ? 'שניהם' : 'Both'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {lang === 'he' ? 'כלל תמחור' : 'Pricing Rule'}
                    </label>
                    <select
                      value={pricingRule.type}
                      onChange={e => setPricingRule(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
                    >
                      <option value="fixed">{lang === 'he' ? 'מחיר קבוע' : 'Fixed Price'}</option>
                      <option value="percent">{lang === 'he' ? 'אחוז תוספת' : 'Percent Markup'}</option>
                      <option value="multiplier">{lang === 'he' ? 'מכפיל' : 'Multiplier'}</option>
                    </select>
                    <input
                      type="number"
                      value={pricingRule.value}
                      onChange={e => setPricingRule(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
                    />
                    <select
                      value={pricingRule.rounding}
                      onChange={e => setPricingRule(prev => ({ ...prev, rounding: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="none">{lang === 'he' ? 'ללא עיגול' : 'No Rounding'}</option>
                      <option value=".90">{lang === 'he' ? 'עיגול ל-.90' : 'Round to .90'}</option>
                      <option value=".99">{lang === 'he' ? 'עיגול ל-.99' : 'Round to .99'}</option>
                    </select>
                  </div>
                </div>

                <UniversalButton
                  onClick={handleGenerateWithAI}
                  disabled={products.length === 0 || generating}
                  className="w-full mt-4"
                  variant="primary"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {lang === 'he' ? 'מייצר...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {lang === 'he' ? 'ייצר עם AI' : 'Generate with AI'}
                    </>
                  )}
                </UniversalButton>
              </CardBody>
            </UniversalCard>

            {/* Export Actions */}
            <UniversalCard variant="elevated">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lang === 'he' ? '3. ייצוא' : '3. Export'}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <UniversalButton
                    onClick={handleExportCSV}
                    disabled={products.length === 0}
                    className="w-full"
                  >
                    <Download className="w-4 h-4" />
                    {lang === 'he' ? 'הורד CSV' : 'Download CSV'}
                  </UniversalButton>

                  <UniversalButton
                    onClick={handlePushToShopify}
                    disabled={products.length === 0}
                    className="w-full"
                    variant="secondary"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {lang === 'he' ? 'העלה ל-Shopify' : 'Push to Shopify'}
                  </UniversalButton>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {lang === 'he' ? 'מוצרים' : 'Products'}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{products.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      {lang === 'he' ? 'מוכן לייצוא' : 'Ready to Export'}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {products.filter(p => p.status === 'generated').length}
                    </span>
                  </div>
                </div>
              </CardBody>
            </UniversalCard>
          </div>

          {/* Products Table */}
          {products.length > 0 && (
            <UniversalCard variant="elevated">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lang === 'he' ? 'מוצרים שנוצרו' : 'Generated Products'}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {lang === 'he' ? 'תמונה' : 'Image'}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {lang === 'he' ? 'שם' : 'Name'}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {lang === 'he' ? 'תיאור' : 'Description'}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {lang === 'he' ? 'מחיר' : 'Price'}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {lang === 'he' ? 'סטטוס' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4">
                            <img src={product.imageUrl} alt="" className="w-16 h-16 object-cover rounded" />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={product.name}
                              onChange={e =>
                                setProducts(prev =>
                                  prev.map(p => (p.id === product.id ? { ...p, name: e.target.value } : p))
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={product.description}
                              onChange={e =>
                                setProducts(prev =>
                                  prev.map(p => (p.id === product.id ? { ...p, description: e.target.value } : p))
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <input
                                type="number"
                                value={product.price}
                                onChange={e =>
                                  setProducts(prev =>
                                    prev.map(p =>
                                      p.id === product.id ? { ...p, price: parseFloat(e.target.value) } : p
                                    )
                                  )
                                }
                                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {product.status === 'generated' ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : product.status === 'error' ? (
                              <X className="w-5 h-5 text-red-500" />
                            ) : (
                              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </UniversalCard>
          )}
        </div>
      </div>
    </div>
  );
}
