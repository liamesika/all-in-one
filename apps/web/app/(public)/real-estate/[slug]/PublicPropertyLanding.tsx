'use client';

import { useState } from 'react';
import {
  MapPin,
  Home,
  Ruler,
  DollarSign,
  Phone,
  Mail,
  MessageCircle,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  transactionType: 'SALE' | 'RENT';
  price?: number;
  rentPriceMonthly?: number;
  rentTerms?: string;
  rooms: number;
  size: number;
  status: string;
  description?: string;
  amenities?: string;
  images?: string[];
  agentName?: string;
  agentPhone?: string;
}

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export default function PublicPropertyLanding({ property }: { property: Property }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200'];

  const isSale = property.transactionType === 'SALE';
  const pricePerSqm = isSale && property.price
    ? Math.round(property.price / property.size)
    : property.rentPriceMonthly
    ? Math.round(property.rentPriceMonthly / property.size)
    : null;
  const amenitiesList = property.amenities?.split(',').map((a) => a.trim()) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/real-estate/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-uid': 'demo-user',
        },
        body: JSON.stringify({
          fullName: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          source: 'Landing Page',
          propertyId: property.id,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Failed to submit lead:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const priceText = isSale && property.price
      ? `listed at ₪${property.price.toLocaleString()}`
      : !isSale && property.rentPriceMonthly
      ? `at ₪${property.rentPriceMonthly.toLocaleString()}/month`
      : '';
    const message = encodeURIComponent(
      `Hi, I'm interested in ${isSale ? 'purchasing' : 'renting'} ${property.name} at ${property.address}${priceText ? ' ' + priceText : ''}. Can you provide more details?`
    );
    const phone = property.agentPhone?.replace(/[^\d+]/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Translations
  const t = {
    forSale: language === 'he' ? 'למכירה' : 'For Sale',
    forRent: language === 'he' ? 'להשכרה' : 'For Rent',
    perMonth: language === 'he' ? '/חודש' : '/month',
    rooms: language === 'he' ? 'חדרים' : 'rooms',
    sqm: language === 'he' ? 'מ"ר' : 'sqm',
    pricePerSqm: language === 'he' ? 'מחיר למ"ר' : 'Price per sqm',
    about: language === 'he' ? 'אודות הנכס' : 'About this property',
    amenities: language === 'he' ? 'שירותים ומתקנים' : 'Amenities',
    interested: language === 'he' ? 'מעוניין בנכס?' : 'Interested?',
    contactUs: language === 'he' ? 'צור קשר' : 'Contact Us',
    name: language === 'he' ? 'שם מלא' : 'Full Name',
    phone: language === 'he' ? 'טלפון' : 'Phone',
    email: language === 'he' ? 'אימייל' : 'Email',
    message: language === 'he' ? 'הודעה' : 'Message',
    messagePlaceholder: language === 'he' ? 'ספר לנו עוד על מה שאתה מחפש...' : 'Tell us more about what you\'re looking for...',
    sendMessage: language === 'he' ? 'שלח הודעה' : 'Send Message',
    sending: language === 'he' ? 'שולח...' : 'Sending...',
    thankYou: language === 'he' ? 'תודה!' : 'Thank you!',
    weWillContact: language === 'he' ? 'ניצור איתך קשר בקרוב' : 'We\'ll be in touch soon',
    whatsapp: language === 'he' ? 'WhatsApp' : 'WhatsApp',
    callAgent: language === 'he' ? 'התקשר לסוכן' : 'Call Agent',
    rentTerms: language === 'he' ? 'תנאי שכירות' : 'Rental Terms',
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'he' ? 'rtl' : 'ltr'}`} dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Hero Section with Image Gallery */}
      <div className="relative h-[60vh] bg-black">
        <img
          src={images[currentImageIndex]}
          alt={property.name}
          className="w-full h-full object-cover opacity-90"
        />

        {/* Gallery Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full hover:bg-white transition-all shadow-lg"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full hover:bg-white transition-all shadow-lg"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Language Toggle */}
        <div className={`absolute top-4 ${language === 'he' ? 'left-4' : 'right-4'}`}>
          <div className="flex items-center gap-1 bg-white/90 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('he')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                language === 'he'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              HE
            </button>
          </div>
        </div>

        {/* Transaction Type Badge */}
        <div className={`absolute top-4 ${language === 'he' ? 'right-4' : 'left-4'}`}>
          <span className={`px-4 py-2 text-white rounded-full text-sm font-semibold shadow-lg ${
            isSale ? 'bg-blue-600' : 'bg-green-600'
          }`}>
            {isSale ? t.forSale : t.forRent}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-5 h-5" />
                <span>{property.address}, {property.city}</span>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-200">
                {isSale ? (
                  // Sale pricing
                  <>
                    <div>
                      <div className="text-sm text-gray-500">{language === 'he' ? 'מחיר' : 'Price'}</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {property.price ? `₪${property.price.toLocaleString()}` : (language === 'he' ? 'פנה למחיר' : 'Contact for price')}
                      </div>
                    </div>
                    {pricePerSqm && (
                      <div>
                        <div className="text-sm text-gray-500">{t.pricePerSqm}</div>
                        <div className="text-xl font-semibold text-gray-900">
                          ₪{pricePerSqm.toLocaleString()}/m²
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Rental pricing
                  <>
                    <div>
                      <div className="text-sm text-gray-500">{language === 'he' ? 'שכירות חודשית' : 'Monthly Rent'}</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                        {property.rentPriceMonthly ? `₪${property.rentPriceMonthly.toLocaleString()}${t.perMonth}` : (language === 'he' ? 'פנה למחיר' : 'Contact for price')}
                      </div>
                    </div>
                    {pricePerSqm && (
                      <div>
                        <div className="text-sm text-gray-500">{language === 'he' ? 'שכירות למ"ר' : 'Rent per sqm'}</div>
                        <div className="text-xl font-semibold text-gray-900">
                          ₪{pricePerSqm.toLocaleString()}/m²{t.perMonth}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Rental Terms */}
              {!isSale && property.rentTerms && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Rental Terms</div>
                  <div className="text-sm text-gray-700">{property.rentTerms}</div>
                </div>
              )}
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{language === 'he' ? 'מאפיינים עיקריים' : 'Key Features'}</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Home className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">{t.rooms}</div>
                    <div className="text-lg font-semibold text-gray-900">{property.rooms}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Ruler className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">{language === 'he' ? 'גודל' : 'Size'}</div>
                    <div className="text-lg font-semibold text-gray-900">{property.size} m²</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">{language === 'he' ? 'סטטוס' : 'Status'}</div>
                    <div className="text-lg font-semibold text-gray-900">{language === 'he' ? 'רשום' : 'Listed'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t.about}</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t.amenities}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenitiesList.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Advantages */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location Advantages</h2>
              <div className="space-y-2 text-gray-700">
                <p>• Prime location in {property.city}</p>
                <p>• Close to public transportation</p>
                <p>• Near shopping centers and restaurants</p>
                <p>• Easy access to main roads</p>
              </div>
            </div>
          </div>

          {/* Right Column - Agent Card and Contact Form */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.contactUs}</h3>

              {property.agentName && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600">{language === 'he' ? 'סוכן' : 'Agent'}</div>
                  <div className="text-lg font-semibold text-gray-900">{property.agentName}</div>
                </div>
              )}

              {/* Quick Contact Buttons */}
              <div className="space-y-3 mb-6">
                {property.agentPhone && (
                  <>
                    <a
                      href={`tel:${property.agentPhone}`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Phone className="w-5 h-5" />
                      {t.callAgent}
                    </a>

                    <button
                      onClick={handleWhatsApp}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {t.whatsapp}
                    </button>
                  </>
                )}
              </div>

              {/* Contact Form */}
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder={t.name}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder={t.phone}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder={t.email}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder={t.messagePlaceholder}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
                  >
                    {submitting ? t.sending : t.sendMessage}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{t.thankYou}</h4>
                  <p className="text-gray-600">{t.weWillContact}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: property.name,
            description: property.description,
            address: {
              '@type': 'PostalAddress',
              streetAddress: property.address,
              addressLocality: property.city,
              addressCountry: 'IL',
            },
            offers: isSale
              ? {
                  '@type': 'Offer',
                  price: property.price,
                  priceCurrency: 'ILS',
                }
              : {
                  '@type': 'Offer',
                  priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    price: property.rentPriceMonthly,
                    priceCurrency: 'ILS',
                    unitCode: 'MON',
                  },
                },
          }),
        }}
      />
    </div>
  );
}
