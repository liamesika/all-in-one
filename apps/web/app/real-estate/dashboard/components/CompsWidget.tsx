'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface CompData {
  id: string;
  address: string;
  city: string;
  neighborhood: string;
  price: number;
  size: number; // sqm
  pricePerSqm: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  saleDate: string;
  daysOnMarket: number;
  agent: string;
  distanceKm: number;
  similarity: number; // 0-100%
  adjustments: {
    sizeAdjustment: number;
    conditionAdjustment: number;
    locationAdjustment: number;
    dateAdjustment: number;
    totalAdjustment: number;
  };
}

interface CompsWidgetProps {
  data?: CompData[];
  subjectProperty?: {
    address: string;
    size: number;
    bedrooms: number;
    bathrooms: number;
    propertyType: string;
  };
  onViewDetails?: () => void;
  onCompClick?: (compId: string) => void;
}

export function CompsWidget({ data, subjectProperty, onViewDetails, onCompClick }: CompsWidgetProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [sortBy, setSortBy] = useState<'similarity' | 'distance' | 'date' | 'price'>('similarity');
  const [showAdjustments, setShowAdjustments] = useState(false);

  const mockSubject = subjectProperty || {
    address: 'Rothschild Blvd 25, Tel Aviv',
    size: 120,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'apartment'
  };

  const mockComps: CompData[] = data?.length ? data : [
    {
      id: '1',
      address: 'Rothschild Blvd 20',
      city: 'Tel Aviv',
      neighborhood: 'City Center',
      price: 2800000,
      size: 115,
      pricePerSqm: 24348,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: 'apartment',
      saleDate: '2024-01-10',
      daysOnMarket: 28,
      agent: 'Sarah Cohen',
      distanceKm: 0.1,
      similarity: 95,
      adjustments: {
        sizeAdjustment: 20000,
        conditionAdjustment: -15000,
        locationAdjustment: 10000,
        dateAdjustment: 5000,
        totalAdjustment: 20000
      }
    },
    {
      id: '2',
      address: 'Ben Gurion St 15',
      city: 'Tel Aviv',
      neighborhood: 'City Center',
      price: 2650000,
      size: 110,
      pricePerSqm: 24091,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: 'apartment',
      saleDate: '2023-12-22',
      daysOnMarket: 35,
      agent: 'David Levi',
      distanceKm: 0.3,
      similarity: 88,
      adjustments: {
        sizeAdjustment: 30000,
        conditionAdjustment: 0,
        locationAdjustment: -10000,
        dateAdjustment: 15000,
        totalAdjustment: 35000
      }
    },
    {
      id: '3',
      address: 'Dizengoff St 45',
      city: 'Tel Aviv',
      neighborhood: 'City Center',
      price: 2900000,
      size: 125,
      pricePerSqm: 23200,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: 'apartment',
      saleDate: '2024-01-05',
      daysOnMarket: 42,
      agent: 'Rachel Gold',
      distanceKm: 0.5,
      similarity: 82,
      adjustments: {
        sizeAdjustment: -25000,
        conditionAdjustment: 20000,
        locationAdjustment: -5000,
        dateAdjustment: 8000,
        totalAdjustment: -2000
      }
    },
    {
      id: '4',
      address: 'King George St 30',
      city: 'Tel Aviv',
      neighborhood: 'City Center',
      price: 2750000,
      size: 118,
      pricePerSqm: 23305,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: 'apartment',
      saleDate: '2023-11-28',
      daysOnMarket: 56,
      agent: 'Michael Ben-David',
      distanceKm: 0.7,
      similarity: 78,
      adjustments: {
        sizeAdjustment: 15000,
        conditionAdjustment: -8000,
        locationAdjustment: -12000,
        dateAdjustment: 25000,
        totalAdjustment: 20000
      }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600 bg-green-50';
    if (similarity >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const sortedComps = [...mockComps].sort((a, b) => {
    switch (sortBy) {
      case 'similarity':
        return b.similarity - a.similarity;
      case 'distance':
        return a.distanceKm - b.distanceKm;
      case 'date':
        return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();
      case 'price':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const avgPrice = mockComps.reduce((sum, comp) => sum + comp.price, 0) / mockComps.length;
  const avgPricePerSqm = mockComps.reduce((sum, comp) => sum + comp.pricePerSqm, 0) / mockComps.length;
  const avgDOM = mockComps.reduce((sum, comp) => sum + comp.daysOnMarket, 0) / mockComps.length;
  const estimatedValue = avgPrice + (mockComps.reduce((sum, comp) => sum + comp.adjustments.totalAdjustment, 0) / mockComps.length);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'השוואת מחירים והערכה' : 'Comps & Pricing'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `הערכה: ${formatCurrency(estimatedValue)} • ${mockComps.length} השוואות`
              : `Est. Value: ${formatCurrency(estimatedValue)} • ${mockComps.length} comps`
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

      {/* Subject Property */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">
          {lang === 'he' ? 'נכס נושא' : 'Subject Property'}
        </h4>
        <div className="text-sm text-blue-800">
          <div>📍 {mockSubject.address}</div>
          <div className="mt-1">
            🏠 {mockSubject.bedrooms}BR/{mockSubject.bathrooms}BA • {mockSubject.size}sqm • {mockSubject.propertyType}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-300"
          >
            <option value="similarity">{lang === 'he' ? 'לפי דמיון' : 'By Similarity'}</option>
            <option value="distance">{lang === 'he' ? 'לפי מרחק' : 'By Distance'}</option>
            <option value="date">{lang === 'he' ? 'לפי תאריך' : 'By Date'}</option>
            <option value="price">{lang === 'he' ? 'לפי מחיר' : 'By Price'}</option>
          </select>
        </div>

        <button
          onClick={() => setShowAdjustments(!showAdjustments)}
          className={`text-sm px-3 py-2 rounded-lg transition-colors ${
            showAdjustments 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {lang === 'he' ? 'הצג התאמות' : 'Show Adjustments'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">{formatCurrency(avgPrice)}</div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'מחיר ממוצע' : 'Avg Price'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">
            ₪{avgPricePerSqm.toFixed(0)}/sqm
          </div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'מחיר למ״ר' : 'Price/Sqm'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">{avgDOM.toFixed(0)}</div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'ימים ממוצע בשוק' : 'Avg DOM'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-600">
            {formatCurrency(estimatedValue)}
          </div>
          <div className="text-xs text-gray-600">
            {lang === 'he' ? 'הערכה' : 'Est. Value'}
          </div>
        </div>
      </div>

      {/* Comps List */}
      <div className="space-y-3">
        {sortedComps.map((comp) => (
          <div
            key={comp.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => onCompClick?.(comp.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium text-gray-900">{comp.address}</h5>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSimilarityColor(comp.similarity)}`}>
                    {comp.similarity}% {lang === 'he' ? 'דמיון' : 'match'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  📍 {comp.neighborhood} • 🏠 {comp.bedrooms}BR/{comp.bathrooms}BA • {comp.size}sqm
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  💰 {formatCurrency(comp.price)} • ₪{comp.pricePerSqm.toFixed(0)}/sqm • 📅 {formatDate(comp.saleDate)}
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'מרחק:' : 'Distance:'}</span>
                    <div className="font-medium">{comp.distanceKm.toFixed(1)}km</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'ימים בשוק:' : 'DOM:'}</span>
                    <div className="font-medium">{comp.daysOnMarket}d</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'סוכן:' : 'Agent:'}</span>
                    <div className="font-medium">{comp.agent}</div>
                  </div>
                </div>

                {showAdjustments && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">
                      {lang === 'he' ? 'התאמות:' : 'Adjustments:'}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>{lang === 'he' ? 'גודל:' : 'Size:'}</span>
                        <span className={comp.adjustments.sizeAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {comp.adjustments.sizeAdjustment >= 0 ? '+' : ''}{formatCurrency(comp.adjustments.sizeAdjustment)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'he' ? 'מצב:' : 'Condition:'}</span>
                        <span className={comp.adjustments.conditionAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {comp.adjustments.conditionAdjustment >= 0 ? '+' : ''}{formatCurrency(comp.adjustments.conditionAdjustment)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'he' ? 'מיקום:' : 'Location:'}</span>
                        <span className={comp.adjustments.locationAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {comp.adjustments.locationAdjustment >= 0 ? '+' : ''}{formatCurrency(comp.adjustments.locationAdjustment)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'he' ? 'תאריך:' : 'Date:'}</span>
                        <span className={comp.adjustments.dateAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {comp.adjustments.dateAdjustment >= 0 ? '+' : ''}{formatCurrency(comp.adjustments.dateAdjustment)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between font-medium">
                      <span>{lang === 'he' ? 'סה״כ התאמה:' : 'Total Adj:'}</span>
                      <span className={comp.adjustments.totalAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {comp.adjustments.totalAdjustment >= 0 ? '+' : ''}{formatCurrency(comp.adjustments.totalAdjustment)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockComps.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <div className="text-gray-500 font-medium mb-1">
            {lang === 'he' ? 'אין השוואות זמינות' : 'No comps available'}
          </div>
          <div className="text-gray-400 text-sm">
            {lang === 'he' ? 'הוסף כתובת לחיפוש השוואות' : 'Add an address to search for comps'}
          </div>
        </div>
      )}
    </div>
  );
}