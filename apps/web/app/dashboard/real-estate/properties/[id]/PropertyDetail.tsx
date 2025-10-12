'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import {
  Home,
  MapPin,
  DollarSign,
  Maximize,
  Bed,
  Calendar,
  Edit,
  Archive,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Globe,
} from 'lucide-react';
import { PropertyAdGenerator } from '@/components/real-estate/PropertyAdGenerator';
import { ScoreBadge } from '@/components/real-estate/ScoreBadge';

interface Property {
  id: string;
  name: string;
  address?: string;
  city?: string;
  transactionType?: 'SALE' | 'RENT';
  price?: number;
  rentPriceMonthly?: number;
  rentTerms?: string;
  rooms?: number;
  size?: number;
  status?: string;
  description?: string;
  amenities?: string;
  images?: string[];
  publishedAt?: string | null;
  createdAt?: string;
  slug?: string | null;
}

interface PropertyDetailProps {
  property: Property;
}

interface LandingPage {
  id: string;
  slug: string;
  variant: string;
  language: 'en' | 'he';
  createdAt: string;
}

export function PropertyDetail({ property }: PropertyDetailProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [showAdGenerator, setShowAdGenerator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLandingPage, setCopiedLandingPage] = useState<string | null>(null);

  // Mock landing pages - in real app, fetch from API
  const landingPages: LandingPage[] = property.slug
    ? [
        {
          id: '1',
          slug: property.slug,
          variant: 'Default',
          language: 'en',
          createdAt: property.publishedAt || property.createdAt || new Date().toISOString(),
        },
        {
          id: '2',
          slug: `${property.slug}-he`,
          variant: 'Hebrew',
          language: 'he',
          createdAt: property.publishedAt || property.createdAt || new Date().toISOString(),
        },
        {
          id: '3',
          slug: `${property.slug}-premium`,
          variant: 'Premium Campaign',
          language: 'en',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ]
    : [];

  const handleCopyUrl = () => {
    const url = property.slug
      ? `${window.location.origin}/real-estate/${property.slug}`
      : `${window.location.origin}/dashboard/real-estate/properties/${property.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLandingPageUrl = (slug: string) => {
    const url = `${window.location.origin}/real-estate/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLandingPage(slug);
    setTimeout(() => setCopiedLandingPage(null), 2000);
  };

  const handleArchive = async () => {
    if (!confirm(language === 'he' ? 'האם לארכב את הנכס?' : 'Archive this property?')) {
      return;
    }
    // TODO: Implement archive API call
    console.log('Archiving property:', property.id);
  };

  const getStatusBadge = (status?: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      LISTED: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: language === 'he' ? 'רשום' : 'Listed',
      },
      DRAFT: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        label: language === 'he' ? 'טיוטה' : 'Draft',
      },
      UNDER_OFFER: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: language === 'he' ? 'בהצעה' : 'Under Offer',
      },
      SOLD: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: language === 'he' ? 'נמכר' : 'Sold',
      },
    };

    const badge = badges[status || 'DRAFT'] || badges.DRAFT;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/real-estate/properties')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {/* Transaction Type Badge */}
                  {property.transactionType && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      property.transactionType === 'SALE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {property.transactionType === 'SALE'
                        ? (language === 'he' ? 'למכירה' : 'For Sale')
                        : (language === 'he' ? 'להשכרה' : 'For Rent')
                      }
                    </span>
                  )}
                  <ScoreBadge property={property} language={language as 'en' | 'he'} size="md" showLabel />
                  {getStatusBadge(property.status)}
                  {property.publishedAt && (
                    <span className="text-sm text-gray-500">
                      {language === 'he' ? 'פורסם:' : 'Published:'}{' '}
                      {new Date(property.publishedAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {language === 'he' ? 'העתק קישור' : 'Copy Link'}
              </button>
              <button
                onClick={() => setShowAdGenerator(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {language === 'he' ? 'צור מודעה' : 'Generate Ad'}
              </button>
              <button
                onClick={() => router.push(`/dashboard/real-estate/properties/${property.id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                {language === 'he' ? 'ערוך' : 'Edit'}
              </button>
              <button
                onClick={handleArchive}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Archive className="w-4 h-4" />
                {language === 'he' ? 'ארכב' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 p-4">
                  {property.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${property.name} - ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {language === 'he' ? 'אין תמונות זמינות' : 'No images available'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'he' ? 'תיאור' : 'Description'}
              </h2>
              {property.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
              ) : (
                <p className="text-gray-500 italic">
                  {language === 'he' ? 'אין תיאור זמין' : 'No description available'}
                </p>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'he' ? 'שירותים ומתקנים' : 'Amenities'}
                </h2>
                <p className="text-gray-700 leading-relaxed">{property.amenities}</p>
              </div>
            )}

            {/* Landing Pages */}
            {landingPages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {language === 'he' ? 'דפי נחיתה' : 'Landing Pages'}
                  </h2>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {landingPages.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {landingPages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-gray-900">{page.variant}</span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              page.language === 'he'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {page.language === 'he' ? 'עברית' : 'English'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="truncate">
                            {window.location.origin}/real-estate/{page.slug}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(page.createdAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <a
                          href={`/real-estate/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={language === 'he' ? 'פתח בכרטיסייה חדשה' : 'Open in new tab'}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleCopyLandingPageUrl(page.slug)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={language === 'he' ? 'העתק קישור' : 'Copy link'}
                        >
                          {copiedLandingPage === page.slug ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    {language === 'he'
                      ? '💡 כל דף נחיתה מותאם לקמפיין ושפה ספציפיים. שתף קישורים שונים עם קהלים שונים למעקב מדויק יותר.'
                      : '💡 Each landing page is optimized for specific campaigns and languages. Share different links with different audiences for better tracking.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Key Info */}
          <div className="space-y-6">
            {/* Price & Key Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                {property.transactionType === 'RENT' ? (
                  // Rental pricing
                  <>
                    <div className="text-sm text-gray-500 mb-1">
                      {language === 'he' ? 'שכירות חודשית' : 'Monthly Rent'}
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {property.rentPriceMonthly
                        ? `₪${property.rentPriceMonthly.toLocaleString()}${language === 'he' ? '/חודש' : '/mo'}`
                        : (language === 'he' ? 'ליצירת קשר' : 'Contact for price')
                      }
                    </div>
                    {property.rentPriceMonthly && property.size && (
                      <div className="text-sm text-gray-500">
                        ₪{Math.round(property.rentPriceMonthly / property.size).toLocaleString()}/{language === 'he' ? 'מ״ר/חודש' : 'sqm/mo'}
                      </div>
                    )}
                  </>
                ) : (
                  // Sale pricing
                  <>
                    <div className="text-sm text-gray-500 mb-1">
                      {language === 'he' ? 'מחיר מכירה' : 'Sale Price'}
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {property.price ? `₪${property.price.toLocaleString()}` : language === 'he' ? 'ליצירת קשר' : 'Contact for price'}
                    </div>
                    {property.price && property.size && (
                      <div className="text-sm text-gray-500">
                        ₪{Math.round(property.price / property.size).toLocaleString()}/{language === 'he' ? 'מ״ר' : 'sqm'}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-4">
                {property.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        {language === 'he' ? 'כתובת' : 'Address'}
                      </div>
                      <div className="text-gray-900">
                        {property.address}
                        {property.city && `, ${property.city}`}
                      </div>
                    </div>
                  </div>
                )}

                {property.rooms && (
                  <div className="flex items-start gap-3">
                    <Bed className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        {language === 'he' ? 'חדרים' : 'Rooms'}
                      </div>
                      <div className="text-gray-900">{property.rooms}</div>
                    </div>
                  </div>
                )}

                {property.size && (
                  <div className="flex items-start gap-3">
                    <Maximize className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        {language === 'he' ? 'גודל' : 'Size'}
                      </div>
                      <div className="text-gray-900">
                        {property.size} {language === 'he' ? 'מ״ר' : 'sqm'}
                      </div>
                    </div>
                  </div>
                )}

                {property.rentTerms && property.transactionType === 'RENT' && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        {language === 'he' ? 'תנאי שכירות' : 'Rental Terms'}
                      </div>
                      <div className="text-gray-900 text-sm">{property.rentTerms}</div>
                    </div>
                  </div>
                )}

                {property.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        {language === 'he' ? 'נוצר' : 'Created'}
                      </div>
                      <div className="text-gray-900">
                        {new Date(property.createdAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'he' ? 'פעולות מהירות' : 'Quick Actions'}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAdGenerator(true)}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'he' ? 'צור מודעה שיווקית' : 'Create Marketing Ad'}
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </button>
                <button
                  onClick={handleCopyUrl}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'he' ? 'העתק קישור ראשי' : 'Copy Main Link'}
                  </span>
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Generator Modal */}
      {showAdGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PropertyAdGenerator
            property={property}
            onClose={() => setShowAdGenerator(false)}
          />
        </div>
      )}
    </div>
  );
}
