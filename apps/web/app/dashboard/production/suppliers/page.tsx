'use client';
import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { EffinityHeader } from '@/components/effinity-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

function ProductionSuppliersContent() {
  const { language } = useLanguage();
  const { user, ownerUid, loading: authLoading } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!ownerUid || authLoading) return;

    // Mock data for suppliers
    setSuppliers([
      {
        id: 1,
        name: 'Sound & Light Pro',
        category: 'AUDIO_VISUAL',
        rating: 4.8,
        totalJobs: 15,
        email: 'contact@soundlight.com',
        phone: '+1-555-0101',
        website: 'www.soundlight.com',
        location: 'New York, NY',
        specialties: ['Sound Systems', 'Lighting', 'Stage Design'],
        priceRange: '$$$',
        lastWorked: '2024-10-15',
        status: 'ACTIVE'
      },
      {
        id: 2,
        name: 'Delicious Catering Co.',
        category: 'CATERING',
        rating: 4.6,
        totalJobs: 23,
        email: 'info@deliciouscatering.com',
        phone: '+1-555-0102',
        website: 'www.deliciouscatering.com',
        location: 'Los Angeles, CA',
        specialties: ['Corporate Catering', 'Wedding Catering', 'Dietary Options'],
        priceRange: '$$',
        lastWorked: '2024-11-02',
        status: 'ACTIVE'
      },
      {
        id: 3,
        name: 'EventSpace Rentals',
        category: 'VENUE',
        rating: 4.9,
        totalJobs: 8,
        email: 'bookings@eventspace.com',
        phone: '+1-555-0103',
        website: 'www.eventspace.com',
        location: 'Chicago, IL',
        specialties: ['Conference Halls', 'Outdoor Venues', 'Tech-Enabled Spaces'],
        priceRange: '$$$$',
        lastWorked: '2024-09-20',
        status: 'ACTIVE'
      },
      {
        id: 4,
        name: 'Creative Visuals Studio',
        category: 'PHOTOGRAPHY',
        rating: 4.7,
        totalJobs: 12,
        email: 'hello@creativevisuals.com',
        phone: '+1-555-0104',
        website: 'www.creativevisuals.com',
        location: 'Miami, FL',
        specialties: ['Event Photography', 'Video Production', 'Live Streaming'],
        priceRange: '$$$',
        lastWorked: '2024-08-15',
        status: 'INACTIVE'
      },
      {
        id: 5,
        name: 'Premium Transport Services',
        category: 'TRANSPORTATION',
        rating: 4.4,
        totalJobs: 19,
        email: 'dispatch@premiumtransport.com',
        phone: '+1-555-0105',
        website: 'www.premiumtransport.com',
        location: 'Seattle, WA',
        specialties: ['Executive Transport', 'Group Shuttles', 'Airport Transfers'],
        priceRange: '$$',
        lastWorked: '2024-10-30',
        status: 'ACTIVE'
      }
    ]);
  }, [ownerUid, authLoading]);

  const filteredSuppliers = suppliers.filter(supplier => {
    if (filter === 'all') return true;
    if (filter === 'active') return supplier.status === 'ACTIVE';
    if (filter === 'inactive') return supplier.status === 'INACTIVE';
    return supplier.category === filter.toUpperCase();
  });

  const getCategoryLabel = (category: string) => {
    const labels = {
      'AUDIO_VISUAL': language === 'he' ? 'אודיו ויזואל' : 'Audio/Visual',
      'CATERING': language === 'he' ? 'קייטרינג' : 'Catering',
      'VENUE': language === 'he' ? 'מקום' : 'Venue',
      'PHOTOGRAPHY': language === 'he' ? 'צילום' : 'Photography',
      'TRANSPORTATION': language === 'he' ? 'הסעות' : 'Transportation',
      'SECURITY': language === 'he' ? 'אבטחה' : 'Security',
      'CLEANING': language === 'he' ? 'ניקיון' : 'Cleaning',
      'OTHER': language === 'he' ? 'אחר' : 'Other'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'AUDIO_VISUAL': 'bg-blue-100 text-blue-700',
      'CATERING': 'bg-green-100 text-green-700',
      'VENUE': 'bg-purple-100 text-purple-700',
      'PHOTOGRAPHY': 'bg-pink-100 text-pink-700',
      'TRANSPORTATION': 'bg-orange-100 text-orange-700',
      'SECURITY': 'bg-red-100 text-red-700',
      'CLEANING': 'bg-gray-100 text-gray-700',
      'OTHER': 'bg-gray-100 text-gray-700'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-gray-50">
      {/* Header */}
      <EffinityHeader
        variant="dashboard"
        className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 shadow-xl border-0"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {language === 'he' ? 'ניהול ספקים' : 'Supplier Management'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'he'
                  ? `מנהל ${filteredSuppliers.length} ספקים`
                  : `Managing ${filteredSuppliers.length} suppliers`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                {language === 'he' ? 'ייצא רשימה' : 'Export List'}
              </button>
              <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {language === 'he' ? 'ספק חדש' : 'New Supplier'}
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
            {[
              { key: 'all', label: language === 'he' ? 'הכל' : 'All' },
              { key: 'active', label: language === 'he' ? 'פעיל' : 'Active' },
              { key: 'audio_visual', label: language === 'he' ? 'אודיו ויזואל' : 'Audio/Visual' },
              { key: 'catering', label: language === 'he' ? 'קייטרינג' : 'Catering' },
              { key: 'venue', label: language === 'he' ? 'מקום' : 'Venue' },
              { key: 'photography', label: language === 'he' ? 'צילום' : 'Photography' },
              { key: 'transportation', label: language === 'he' ? 'הסעות' : 'Transportation' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  filter === tab.key
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {supplier.name}
                      </CardTitle>
                      {supplier.status === 'ACTIVE' ? (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(supplier.category)}`}>
                      {getCategoryLabel(supplier.category)}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Rating & Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(supplier.rating)}</div>
                      <span className="text-sm text-gray-600">{supplier.rating}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {supplier.totalJobs} {language === 'he' ? 'עבודות' : 'jobs'}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">{supplier.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${supplier.email}`} className="text-emerald-600 hover:underline">
                        {supplier.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${supplier.phone}`} className="text-gray-600 hover:underline">
                        {supplier.phone}
                      </a>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{language === 'he' ? 'התמחויות:' : 'Specialties:'}</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.specialties.slice(0, 2).map((specialty: string, idx: number) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {specialty}
                        </span>
                      ))}
                      {supplier.specialties.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          +{supplier.specialties.length - 2} {language === 'he' ? 'נוספות' : 'more'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price Range & Last Worked */}
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-600">{language === 'he' ? 'טווח מחירים:' : 'Price Range:'}</span>
                      <span className="text-gray-900 font-medium ml-1">{supplier.priceRange}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {language === 'he' ? 'עבודה אחרונה:' : 'Last worked:'} {new Date(supplier.lastWorked).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button className="flex-1 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                        {language === 'he' ? 'צפה בפרופיל' : 'View Profile'}
                      </button>
                      <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                        {language === 'he' ? 'צור קשר' : 'Contact'}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'he' ? 'אין ספקים להצגה' : 'No suppliers to show'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'he' ? 'התחל בהוספת ספקים לרשימה שלך' : 'Get started by adding suppliers to your list'}
            </p>
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
              {language === 'he' ? 'הוסף ספק חדש' : 'Add New Supplier'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductionSuppliersPage() {
  return (
    <LanguageProvider>
      <ProductionSuppliersContent />
    </LanguageProvider>
  );
}