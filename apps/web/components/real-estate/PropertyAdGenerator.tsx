'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, ExternalLink, DollarSign, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface PropertyAdGeneratorProps {
  property: {
    id: string;
    name: string;
    address?: string;
    price?: number;
    rooms?: number;
    size?: number;
    description?: string;
    amenities?: string;
  };
  onClose?: () => void;
}

export function PropertyAdGenerator({ property, onClose }: PropertyAdGeneratorProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateAd = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/real-estate/property-ad-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ property }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      setGenerated(data);
    } catch (error) {
      console.error('Failed to generate ad:', error);
      alert(language === 'he' ? 'שגיאה ביצירת מודעה' : 'Failed to generate ad');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openLandingPage = () => {
    if (generated?.landingPageUrl) {
      window.open(generated.landingPageUrl, '_blank');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {language === 'he' ? 'מחולל מודעות AI' : 'AI Ad Generator'}
              </h2>
              <p className="text-sm text-white/80">
                {language === 'he' ? 'יצירת מודעה מקצועית בשניות' : 'Professional ad in seconds'}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        {/* Property Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{property.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            {property.address && (
              <div>
                <span className="font-medium">{language === 'he' ? 'כתובת:' : 'Address:'}</span>
                <p>{property.address}</p>
              </div>
            )}
            {property.price && (
              <div>
                <span className="font-medium">{language === 'he' ? 'מחיר:' : 'Price:'}</span>
                <p>₪{property.price.toLocaleString()}</p>
              </div>
            )}
            {property.rooms && (
              <div>
                <span className="font-medium">{language === 'he' ? 'חדרים:' : 'Rooms:'}</span>
                <p>{property.rooms}</p>
              </div>
            )}
            {property.size && (
              <div>
                <span className="font-medium">{language === 'he' ? 'גודל:' : 'Size:'}</span>
                <p>{property.size} {language === 'he' ? 'מ"ר' : 'sqm'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        {!generated && !loading && (
          <div className="text-center py-8">
            <button
              onClick={generateAd}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50"
            >
              <Sparkles className="w-6 h-6" />
              {language === 'he' ? 'צור מודעה עם AI' : 'Generate Ad with AI'}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              {language === 'he'
                ? 'AI יצור תיאור משיכה, המלצת מחיר ודף נחיתה'
                : 'AI will create compelling copy, price recommendation and landing page'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              {language === 'he' ? 'AI עובד על המודעה שלך...' : 'AI is crafting your ad...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {language === 'he' ? 'זה לוקח בערך 10 שניות' : 'This takes about 10 seconds'}
            </p>
          </div>
        )}

        {/* Generated Content */}
        {generated && (
          <div className="space-y-6">
            {/* Marketing Description */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  {language === 'he' ? 'תיאור שיווקי' : 'Marketing Description'}
                </h3>
              </div>

              {/* English Version */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">English</span>
                  <button
                    onClick={() => copyToClipboard(generated.generatedDescription?.english || '', 'english')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    {copiedField === 'english' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedField === 'english' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{generated.generatedDescription?.english}</p>
              </div>

              {/* Hebrew Version */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">עברית</span>
                  <button
                    onClick={() => copyToClipboard(generated.generatedDescription?.hebrew || '', 'hebrew')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    {copiedField === 'hebrew' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedField === 'hebrew' ? 'הועתק!' : 'העתק'}
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap text-right" dir="rtl">
                  {generated.generatedDescription?.hebrew}
                </p>
              </div>
            </div>

            {/* Price Recommendation */}
            {generated.priceRecommendation && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    {language === 'he' ? 'המלצת מחיר' : 'Price Recommendation'}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">{language === 'he' ? 'מחיר נוכחי' : 'Current'}</span>
                      <p className="text-xl font-bold text-gray-900">{generated.priceRecommendation.current}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">{language === 'he' ? 'מחיר מומלץ' : 'Suggested'}</span>
                      <p className="text-xl font-bold text-green-600">{generated.priceRecommendation.suggested}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">{language === 'he' ? 'מחיר למ"ר' : 'Per sqm'}</span>
                      <p className="text-xl font-bold text-blue-600">{generated.priceRecommendation.pricePerSqm}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{language === 'he' ? 'ניתוח:' : 'Analysis:'}</span>{' '}
                      {generated.priceRecommendation.reasoning}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        generated.priceRecommendation.confidence === 'high'
                          ? 'bg-green-100 text-green-700'
                          : generated.priceRecommendation.confidence === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {language === 'he' ? 'רמת ביטחון:' : 'Confidence:'} {generated.priceRecommendation.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Landing Page */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-purple-600" />
                  {language === 'he' ? 'דף נחיתה' : 'Landing Page'}
                </h3>
              </div>
              <div className="p-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {language === 'he' ? 'כתובת URL ייחודית:' : 'Unique URL:'}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm">
                      {window.location.origin}{generated.landingPageUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}${generated.landingPageUrl}`, 'url')}
                      className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      title={language === 'he' ? 'העתק קישור' : 'Copy link'}
                    >
                      {copiedField === 'url' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={openLandingPage}
                      className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                      title={language === 'he' ? 'פתח דף' : 'Open page'}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {generated.seo && (
                  <div className="mt-4 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">{language === 'he' ? 'כותרת SEO:' : 'SEO Title:'}</span>
                      <p className="text-sm text-gray-700">{generated.seo.title}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">{language === 'he' ? 'תיאור SEO:' : 'SEO Description:'}</span>
                      <p className="text-sm text-gray-700">{generated.seo.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setGenerated(null)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {language === 'he' ? 'צור מחדש' : 'Generate Again'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                {language === 'he' ? 'סיום' : 'Done'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
