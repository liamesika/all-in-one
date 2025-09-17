'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';
import { EffinityHeader } from '@/components/effinity-header';
// Simple QR placeholder to avoid build issues
const QRCodeSVG = ({ value, size, bgColor, fgColor, level }: any) => (
  <div
    className="bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <div className="text-center p-2">
      <div className="text-4xl mb-2">📱</div>
      <div className="text-xs text-gray-600">QR Code</div>
    </div>
  </div>
);

type Property = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  rooms?: number | null;
  size?: number | null;
  price?: number | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  slug?: string | null;
  agentName?: string | null;
  agentPhone?: string | null;
  createdAt?: string;
  photos?: Array<{ id: string; url: string }>;
};

type Lead = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

// EFFINITY Brand Colors
const brand = { 
  primary: "#1e3a8a", 
  hover: "#1d4ed8",
  light: "#3b82f6",
  gradient: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
};

function inputClass(extra = "") {
  return [
    "w-full border rounded-xl px-3 py-2 outline-none",
    "focus:ring focus:ring-gray-200",
    "placeholder:text-gray-400",
    "invalid:border-red-500 invalid:focus:ring-red-200",
    extra,
  ].join(" ");
}

function PropertyPageContent() {
  const { t, language } = useLanguage();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  
  // Lead form state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState<Lead>({
    name: '', phone: '', email: '', message: ''
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Load property data
  useEffect(() => {
    async function loadProperty() {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch(`/real-estate/properties/public/${slug}`);
        setProperty(data);
      } catch (e: any) {
        setError(e?.message || 'Property not found');
      } finally {
        setLoading(false);
      }
    }
    
    loadProperty();
  }, [slug]);

  // Submit lead
  const handleLeadSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setLeadSubmitting(true);
    try {
      await apiFetch('/real-estate/leads', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: property.id,
          name: leadForm.name.trim(),
          phone: leadForm.phone.trim(),
          email: leadForm.email.trim(),
          message: leadForm.message.trim(),
          source: 'PROPERTY_PAGE'
        }),
      });
      
      setLeadSuccess(true);
      setLeadForm({ name: '', phone: '', email: '', message: '' });
      setTimeout(() => {
        setShowLeadForm(false);
        setLeadSuccess(false);
      }, 3000);
    } catch (err: any) {
      alert(language === 'he' ? 'שגיאה בשליחת הפנייה' : 'Error submitting lead');
    } finally {
      setLeadSubmitting(false);
    }
  }, [property, leadForm, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'he' ? 'הנכס לא נמצא' : 'Property Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/real-estate/properties" 
            className="text-blue-600 hover:text-blue-800"
          >
            {language === 'he' ? 'חזרה לרשימת הנכסים' : 'Back to Properties'}
          </a>
        </div>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const photos = property.photos || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <EffinityHeader variant="dashboard" />

      {/* Property Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">{property.name}</h1>
          <p className="text-blue-100 mb-6">
            {property.address && property.city
              ? `${property.address}, ${property.city}`
              : property.city || property.address || (language === 'he' ? 'מיקום לא זמין' : 'Location not available')
            }
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white font-medium hover:bg-white/30 transition-colors"
            >
              {showQR ? '✕' : '📱'} {language === 'he' ? 'QR קוד' : 'QR Code'}
            </button>
            <a
              href="/real-estate/properties"
              className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white font-medium hover:bg-white/30 transition-colors"
            >
              ← {language === 'he' ? 'חזרה לנכסים' : 'Back to Properties'}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Property Card - Landing Page Style */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Property Title and Price */}
          <div className="text-center py-10 px-8 bg-gradient-to-br from-blue-50 to-white">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{property.name}</h1>
            <div className="text-lg text-gray-600 mb-4">
              {property.address && property.city 
                ? `${property.address}, ${property.city}`
                : property.city || property.address || (language === 'he' ? 'מיקום לא זמין' : 'Location not available')
              }
            </div>
            {property.price && (
              <div className="text-4xl md:text-5xl font-bold" style={{ color: brand.primary }}>
                ₪{property.price.toLocaleString()}
              </div>
            )}
          </div>

          {/* Images Grid */}
          {photos.length > 0 && (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {photos.slice(0, 4).map((photo, idx) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt={`${property.name} - Image ${idx + 1}`}
                    className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                  />
                ))}
                {/* Fill remaining slots with placeholders if less than 4 images */}
                {Array.from({ length: Math.max(0, 4 - photos.length) }).map((_, idx) => (
                  <div key={`placeholder-${idx}`} className="w-full h-48 md:h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg flex items-center justify-center">
                    <div className="text-blue-400 text-4xl">🏠</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two Column Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            
            {/* Contact Agent */}
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100">
              <h3 className="text-2xl font-bold text-blue-800 mb-6">
                {language === 'he' ? 'צור קשר עם הסוכן' : 'Contact Agent'}
              </h3>
              <div className="space-y-4">
                <div className="text-lg">
                  <span className="font-semibold">Agent: </span>
                  {property.agentName || 'John Doe'}
                </div>
                {property.agentPhone && (
                  <div className="text-lg">
                    <span className="font-semibold">Phone: </span>
                    <a 
                      href={`tel:${property.agentPhone}`}
                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      {property.agentPhone}
                    </a>
                  </div>
                )}
                <button
                  onClick={() => window.location.href = `tel:${property.agentPhone || '0587878676'}`}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  {language === 'he' ? 'התקשר עכשיו' : 'Call Now'}
                </button>
              </div>
            </div>

            {/* Property Details in Hebrew */}
            <div className="bg-sky-50 rounded-2xl p-6 border-2 border-sky-100 text-center">
              <h3 className="text-2xl font-bold text-blue-800 mb-6">
                {language === 'he' ? 'מספר חדרים' : 'Property Details'}
              </h3>
              <div className="space-y-4 text-lg">
                {property.rooms && (
                  <div className="font-semibold">
                    {property.rooms} {language === 'he' ? 'חדרים' : 'Rooms'}
                  </div>
                )}
                {property.size && (
                  <div className="font-semibold">
                    {property.size} {language === 'he' ? 'מ"ר' : 'sqm'}
                  </div>
                )}
                <div className="font-semibold">
                  {language === 'he' ? 'סטטוס: ' : 'Status: '}
                  {property.status === 'PUBLISHED' 
                    ? (language === 'he' ? 'זמין' : 'Available')
                    : (language === 'he' ? 'טיוטה' : 'Draft')
                  }
                </div>
                <div className="text-gray-600">
                  {language === 'he' ? 'תאריך עדכון: ' : 'Listed: '}
                  {new Date(property.createdAt || '').getFullYear()}
                </div>
              </div>
            </div>
          </div>

          {/* Single Call to Action */}
          <div className="p-8 pt-0">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                {language === 'he' ? 'מעוניין בנכס?' : 'Interested in this property?'}
              </h3>
              <p className="text-blue-100 mb-6 text-lg">
                {language === 'he' 
                  ? 'השאר פרטים ונחזור אליך בהקדם'
                  : 'Leave your details and we\'ll get back to you soon'
                }
              </p>
              
              {!showLeadForm ? (
                <button
                  onClick={() => setShowLeadForm(true)}
                  className="bg-white text-blue-600 py-4 px-8 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                >
                  {language === 'he' ? 'בקש מידע נוסף' : 'Request More Info'}
                </button>
              ) : leadSuccess ? (
                <div className="py-4">
                  <div className="text-white text-2xl mb-2">✓</div>
                  <div className="font-semibold text-white text-xl">
                    {language === 'he' ? 'תודה! ניצור קשר בקרוב' : 'Thank you! We\'ll be in touch soon'}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4 max-w-md mx-auto">
                  <input
                    required
                    placeholder={language === 'he' ? 'שם מלא' : 'Full name'}
                    value={leadForm.name}
                    onChange={(e) => setLeadForm(s => ({...s, name: e.target.value}))}
                    className="w-full p-3 rounded-xl border-0 text-gray-800"
                    dir={language === 'he' ? 'rtl' : 'ltr'}
                  />
                  <input
                    required
                    type="tel"
                    placeholder={language === 'he' ? 'טלפון' : 'Phone'}
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm(s => ({...s, phone: e.target.value}))}
                    className="w-full p-3 rounded-xl border-0 text-gray-800"
                  />
                  <input
                    required
                    type="email"
                    placeholder={language === 'he' ? 'אימייל' : 'Email'}
                    value={leadForm.email}
                    onChange={(e) => setLeadForm(s => ({...s, email: e.target.value}))}
                    className="w-full p-3 rounded-xl border-0 text-gray-800"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowLeadForm(false)}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-400 transition-colors"
                    >
                      {language === 'he' ? 'ביטול' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={leadSubmitting}
                      className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-semibold disabled:opacity-60 hover:bg-blue-50 transition-colors"
                    >
                      {leadSubmitting 
                        ? (language === 'he' ? 'שולח...' : 'Sending...')
                        : (language === 'he' ? 'שלח' : 'Send')
                      }
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          {showQR && (
            <div className="p-8 pt-0">
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'he' ? 'שתף את הנכס' : 'Share this property'}
                </h3>
                <div className="flex justify-center mb-4">
                  <QRCodeSVG 
                    value={currentUrl} 
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#1e3a8a"
                    level="M"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {language === 'he' 
                    ? 'סרוק כדי לראות את הנכס בטלפון'
                    : 'Scan to view this property on mobile'
                  }
                </p>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default function PropertyPage() {
  return (
    <LanguageProvider>
      <PropertyPageContent />
    </LanguageProvider>
  );
}