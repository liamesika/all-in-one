'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface ImportedProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  price: number;
  currency: string;
  provider: 'YAD2' | 'MADLAN' | 'MANUAL';
  externalUrl?: string;
  aiScore?: number;
  aiCategory?: 'excellent' | 'good' | 'fair' | 'poor';
  createdAt: string;
}

interface ImportBatch {
  id: string;
  source: string;
  totalItems: number;
  importedItems: number;
  status: string;
  createdAt: string;
}

export function ImportedPropertiesWidget() {
  const [properties, setProperties] = useState<ImportedProperty[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'YAD2' | 'MADLAN'>('all');

  useEffect(() => {
    fetchImportedProperties();
    fetchImportBatches();
  }, [filter]);

  const fetchImportedProperties = async () => {
    try {
      const params = new URLSearchParams({
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...(filter !== 'all' && { provider: filter })
      });

      const response = await fetch(`/api/real-estate/properties?${params}`);
      if (response.ok) {
        const data = await response.json();
        const importedProps = data.properties?.filter((p: any) =>
          p.provider !== 'MANUAL'
        ) || [];
        setProperties(importedProps);
      }
    } catch (error) {
      console.error('Error fetching imported properties:', error);
    }
  };

  const fetchImportBatches = async () => {
    try {
      const response = await fetch('/api/real-estate/properties/import/batches?limit=5');
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    } catch (error) {
      console.error('Error fetching import batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (category?: string) => {
    const badges = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return badges[category as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currency === 'ILS' ? 'ILS' : 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            נכסים מיובאים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            נכסים מיובאים
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">כל המקורות</option>
            <option value="YAD2">יד2</option>
            <option value="MADLAN">מדלן</option>
          </select>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Import Stats */}
        {batches.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 p-3 rounded-lg">
            <div>
              <div className="font-semibold text-blue-600">
                {batches.reduce((sum, batch) => sum + batch.totalItems, 0)}
              </div>
              <div className="text-gray-600">סה"כ פריטים</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">
                {batches.reduce((sum, batch) => sum + batch.importedItems, 0)}
              </div>
              <div className="text-gray-600">יובאו</div>
            </div>
            <div>
              <div className="font-semibold text-purple-600">
                {batches.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-gray-600">יבואים הושלמו</div>
            </div>
          </div>
        )}

        {/* Recent Imported Properties */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {properties.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <p>אין נכסים מיובאים עדיין</p>
              <p className="text-xs mt-1">השתמש במודול הייבוא להוספת נכסים</p>
            </div>
          ) : (
            properties.map((property) => (
              <div key={property.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">{property.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {property.address}, {property.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      property.provider === 'YAD2' ? 'bg-blue-100 text-blue-800' :
                      property.provider === 'MADLAN' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.provider}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold text-green-600">
                    {formatPrice(property.price, property.currency)}
                  </div>

                  {property.aiScore && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${getScoreColor(property.aiScore)}`}>
                        ציון: {property.aiScore}
                      </span>
                      {property.aiCategory && (
                        <span className={`px-2 py-1 rounded-full text-xs ${getScoreBadge(property.aiCategory)}`}>
                          {property.aiCategory === 'excellent' ? 'מעולה' :
                           property.aiCategory === 'good' ? 'טוב' :
                           property.aiCategory === 'fair' ? 'בסדר' : 'חלש'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {property.externalUrl && (
                  <div className="mt-2">
                    <a
                      href={property.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      צפה במקור
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-3 space-y-2">
          <button
            onClick={() => window.open('/dashboard/real-estate/properties', '_blank')}
            className="w-full text-center py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            צפה בכל הנכסים
          </button>
          <button
            onClick={() => window.open('/dashboard/real-estate/import', '_blank')}
            className="w-full text-center py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
          >
            יבא נכסים חדשים
          </button>
        </div>
      </CardContent>
    </Card>
  );
}