'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface ListingData {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  size: number; // sqm
  listDate: string;
  status: 'draft' | 'listed' | 'under-offer' | 'sold';
  agent: string;
  views: number;
  clickouts: number;
  inquiries: number;
  viewings: number;
  offers: number;
  daysOnMarket: number;
  priceChanges: number;
  photos: number;
}

interface ListingsPerformanceProps {
  data?: ListingData[];
  onViewDetails?: () => void;
  onListingClick?: (listingId: string) => void;
}

export function ListingsPerformanceWidget({ data, onViewDetails, onListingClick }: ListingsPerformanceProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [sortBy, setSortBy] = useState<'views' | 'inquiries' | 'viewings' | 'daysOnMarket'>('views');
  const [showTop, setShowTop] = useState(true);

  // Mock data if no data provided
  const mockListings: ListingData[] = data?.length ? data : [
    {
      id: '1',
      title: 'Luxury Penthouse with Sea View',
      address: 'Rothschild Blvd 15',
      city: 'Tel Aviv',
      price: 4200000,
      propertyType: 'penthouse',
      bedrooms: 4,
      bathrooms: 3,
      size: 180,
      listDate: '2024-01-01T00:00:00Z',
      status: 'under-offer',
      agent: 'Sarah Cohen',
      views: 2847,
      clickouts: 234,
      inquiries: 28,
      viewings: 12,
      offers: 3,
      daysOnMarket: 14,
      priceChanges: 0,
      photos: 18
    },
    {
      id: '2',
      title: 'Modern 3BR Apartment',
      address: 'Ben Gurion St 42',
      city: 'Ramat Gan',
      price: 2800000,
      propertyType: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      size: 110,
      listDate: '2023-12-15T00:00:00Z',
      status: 'listed',
      agent: 'David Levi',
      views: 1956,
      clickouts: 178,
      inquiries: 19,
      viewings: 8,
      offers: 1,
      daysOnMarket: 31,
      priceChanges: 1,
      photos: 12
    },
    {
      id: '3',
      title: 'Family House with Garden',
      address: 'Hacarmel St 28',
      city: 'Jerusalem',
      price: 3500000,
      propertyType: 'house',
      bedrooms: 5,
      bathrooms: 3,
      size: 200,
      listDate: '2023-11-20T00:00:00Z',
      status: 'sold',
      agent: 'Rachel Gold',
      views: 3421,
      clickouts: 312,
      inquiries: 35,
      viewings: 18,
      offers: 7,
      daysOnMarket: 56,
      priceChanges: 2,
      photos: 24
    },
    {
      id: '4',
      title: 'Studio Near University',
      address: 'Einstein St 7',
      city: 'Jerusalem',
      price: 1200000,
      propertyType: 'studio',
      bedrooms: 1,
      bathrooms: 1,
      size: 45,
      listDate: '2023-12-01T00:00:00Z',
      status: 'listed',
      agent: 'Michael Ben-David',
      views: 689,
      clickouts: 45,
      inquiries: 5,
      viewings: 2,
      offers: 0,
      daysOnMarket: 45,
      priceChanges: 0,
      photos: 6
    },
    {
      id: '5',
      title: 'Commercial Space Downtown',
      address: 'Dizengoff St 101',
      city: 'Tel Aviv',
      price: 5500000,
      propertyType: 'commercial',
      bedrooms: 0,
      bathrooms: 2,
      size: 150,
      listDate: '2023-10-15T00:00:00Z',
      status: 'listed',
      agent: 'Sarah Cohen',
      views: 432,
      clickouts: 28,
      inquiries: 3,
      viewings: 1,
      offers: 0,
      daysOnMarket: 92,
      priceChanges: 3,
      photos: 8
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'listed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'under-offer': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'sold': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDOMColor = (days: number) => {
    if (days <= 30) return 'text-green-600';
    if (days <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedListings = [...mockListings].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return showTop ? b.views - a.views : a.views - b.views;
      case 'inquiries':
        return showTop ? b.inquiries - a.inquiries : a.inquiries - b.inquiries;
      case 'viewings':
        return showTop ? b.viewings - a.viewings : a.viewings - b.viewings;
      case 'daysOnMarket':
        return showTop ? a.daysOnMarket - b.daysOnMarket : b.daysOnMarket - a.daysOnMarket;
      default:
        return 0;
    }
  });

  const topListings = sortedListings.slice(0, 3);

  const totalViews = mockListings.reduce((sum, listing) => sum + listing.views, 0);
  const totalInquiries = mockListings.reduce((sum, listing) => sum + listing.inquiries, 0);
  const avgDOM = mockListings.reduce((sum, listing) => sum + listing.daysOnMarket, 0) / mockListings.length;
  const conversionRate = totalViews > 0 ? (totalInquiries / totalViews * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'ביצועי רישומים' : 'Listings Performance'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${totalViews.toLocaleString()} צפיות • ${conversionRate.toFixed(1)}% המרה`
              : `${totalViews.toLocaleString()} views • ${conversionRate.toFixed(1)}% conversion`
            }
          </p>
        </div>
        
        <button 
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {lang === 'he' ? 'הצג פרטים' : 'View Details'}
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setShowTop(true)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              showTop 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {lang === 'he' ? 'מובילים' : 'Top'}
          </button>
          <button
            onClick={() => setShowTop(false)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              !showTop 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {lang === 'he' ? 'נמוכים' : 'Bottom'}
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-300"
        >
          <option value="views">{lang === 'he' ? 'לפי צפיות' : 'By Views'}</option>
          <option value="inquiries">{lang === 'he' ? 'לפי פניות' : 'By Inquiries'}</option>
          <option value="viewings">{lang === 'he' ? 'לפי צפיות נכס' : 'By Viewings'}</option>
          <option value="daysOnMarket">{lang === 'he' ? 'לפי ימים בשוק' : 'By Days on Market'}</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">{avgDOM.toFixed(0)}</div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'ימים ממוצע בשוק' : 'Avg DOM'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">
            {(totalViews / mockListings.length).toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'צפיות ממוצע' : 'Avg Views'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">
            {(totalInquiries / mockListings.length).toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'פניות ממוצע' : 'Avg Inquiries'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-600">
            {conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'המרה' : 'Conversion'}
          </div>
        </div>
      </div>

      {/* Listings List */}
      <div className="space-y-3">
        {topListings.map((listing, index) => (
          <div
            key={listing.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => onListingClick?.(listing.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <h5 className="font-medium text-gray-900">{listing.title}</h5>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(listing.status)}`}>
                    {lang === 'he' 
                      ? listing.status === 'draft' ? 'טיוטה'
                        : listing.status === 'listed' ? 'מפורסם'
                        : listing.status === 'under-offer' ? 'בהצעה'
                        : 'נמכר'
                      : listing.status.replace('-', ' ')
                    }
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  📍 {listing.address}, {listing.city} • {formatCurrency(listing.price)}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  🏠 {listing.bedrooms}BR/{listing.bathrooms}BA • {listing.size}sqm • 👤 {listing.agent}
                </div>

                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'צפיות:' : 'Views:'}</span>
                    <div className="font-medium">{listing.views.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'פניות:' : 'Inquiries:'}</span>
                    <div className="font-medium">{listing.inquiries}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'צפיות נכס:' : 'Viewings:'}</span>
                    <div className="font-medium">{listing.viewings}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'הצעות:' : 'Offers:'}</span>
                    <div className="font-medium">{listing.offers}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className={`text-sm font-medium ${getDOMColor(listing.daysOnMarket)}`}>
                  {listing.daysOnMarket}{lang === 'he' ? 'י' : 'd'} {lang === 'he' ? 'בשוק' : 'on market'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  📸 {listing.photos} {lang === 'he' ? 'תמונות' : 'photos'}
                </div>
                {listing.priceChanges > 0 && (
                  <div className="text-xs text-orange-600 mt-1">
                    {listing.priceChanges} {lang === 'he' ? 'שינויי מחיר' : 'price changes'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockListings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">🏠</div>
          <div className="text-gray-500 font-medium mb-1">
            {lang === 'he' ? 'אין רישומים פעילים' : 'No active listings'}
          </div>
          <div className="text-gray-400 text-sm">
            {lang === 'he' ? 'הוסף רישום ראשון כדי לראות ביצועים' : 'Add your first listing to see performance'}
          </div>
        </div>
      )}
    </div>
  );
}