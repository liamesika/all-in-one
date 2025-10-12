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
} from 'lucide-react';
import { PropertyAdGenerator } from '@/components/real-estate/PropertyAdGenerator';

interface Property {
  id: string;
  name: string;
  address?: string;
  city?: string;
  price?: number;
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

export function PropertyDetail({ property }: PropertyDetailProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [showAdGenerator, setShowAdGenerator] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    const url = property.slug
      ? `${window.location.origin}/p/${property.slug}`
      : `${window.location.origin}/dashboard/real-estate/properties/${property.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <div className="flex items-center gap-2 mt-1">
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
          </div>

          {/* Right Column - Key Info */}
          <div className="space-y-6">
            {/* Price & Key Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {property.price ? `₪${property.price.toLocaleString()}` : language === 'he' ? 'ליצירת קשר' : 'Contact for price'}
                </div>
                {property.price && property.size && (
                  <div className="text-sm text-gray-500">
                    ₪{Math.round(property.price / property.size).toLocaleString()}/{language === 'he' ? 'מ״ר' : 'sqm'}
                  </div>
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
                {property.slug && (
                  <a
                    href={`/p/${property.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'he' ? 'צפה בדף נחיתה' : 'View Landing Page'}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
                <button
                  onClick={() => setShowAdGenerator(true)}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'he' ? 'צור מודעה שיווקית' : 'Create Marketing Ad'}
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
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
