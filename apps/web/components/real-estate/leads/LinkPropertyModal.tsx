'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Link as LinkIcon, Unlink, Home, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface Property {
  id: string;
  name: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  transactionType: 'SALE' | 'RENT';
  price?: number;
  rooms?: number;
}

interface LinkPropertyModalProps {
  isOpen: boolean;
  leadId: string;
  currentPropertyId?: string | null;
  onClose: () => void;
  onSuccess?: (propertyId: string | null) => void;
}

export function LinkPropertyModal({
  isOpen,
  leadId,
  currentPropertyId,
  onClose,
  onSuccess,
}: LinkPropertyModalProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(currentPropertyId || null);

  const t = {
    title: language === 'he' ? 'קישור נכס' : 'Link Property',
    search: language === 'he' ? 'חפש נכס...' : 'Search property...',
    currentlyLinked: language === 'he' ? 'נכס מקושר כעת' : 'Currently linked',
    link: language === 'he' ? 'קשר נכס' : 'Link Property',
    unlink: language === 'he' ? 'נתק קישור' : 'Unlink',
    cancel: language === 'he' ? 'ביטול' : 'Cancel',
    save: language === 'he' ? 'שמור' : 'Save',
    noResults: language === 'he' ? 'לא נמצאו נכסים' : 'No properties found',
    loading: language === 'he' ? 'טוען...' : 'Loading...',
    saving: language === 'he' ? 'שומר...' : 'Saving...',
    sale: language === 'he' ? 'למכירה' : 'For Sale',
    rent: language === 'he' ? 'להשכרה' : 'For Rent',
    rooms: language === 'he' ? 'חדרים' : 'rooms',
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen && searchQuery.trim()) {
        searchProperties();
      } else {
        setProperties([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  const searchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: searchQuery });
      const response = await fetch(`/api/real-estate/properties/search?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error searching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    setLinking(true);
    try {
      const response = await fetch(`/api/real-estate/leads/${leadId}/link-property`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: selectedPropertyId }),
      });

      if (!response.ok) throw new Error('Failed to link property');

      onSuccess?.(selectedPropertyId);
      onClose();
    } catch (error) {
      console.error('Error linking property:', error);
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    setSelectedPropertyId(null);
    setLinking(true);
    try {
      const response = await fetch(`/api/real-estate/leads/${leadId}/link-property`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: null }),
      });

      if (!response.ok) throw new Error('Failed to unlink property');

      onSuccess?.(null);
      onClose();
    } catch (error) {
      console.error('Error unlinking property:', error);
    } finally {
      setLinking(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
        style={{ background: '#FFFFFF' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>
            {t.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: '#D1D5DB',
                background: '#F9FAFB',
                color: '#111827',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
            />
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Currently Linked Property */}
          {currentPropertyId && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <LinkIcon className="w-5 h-5 mt-1" style={{ color: '#2979FF' }} />
                  <div>
                    <p className="font-medium mb-1" style={{ color: '#1E40AF' }}>{t.currentlyLinked}</p>
                    <p className="text-sm" style={{ color: '#3B82F6' }}>ID: {currentPropertyId}</p>
                  </div>
                </div>
                <button
                  onClick={handleUnlink}
                  disabled={linking}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  style={{ background: '#DC2626', color: '#FFFFFF' }}
                  onMouseEnter={(e) => !linking && (e.currentTarget.style.background = '#B91C1C')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#DC2626')}
                >
                  {linking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Unlink className="w-4 h-4" />
                      {t.unlink}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Properties List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2979FF' }} />
              <span className="ml-3" style={{ color: '#6B7280' }}>{t.loading}</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-12 h-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {searchQuery ? t.noResults : 'Start typing to search properties'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((property) => {
                const isSelected = selectedPropertyId === property.id;
                return (
                  <button
                    key={property.id}
                    onClick={() => setSelectedPropertyId(property.id)}
                    className="w-full p-4 rounded-lg border-2 transition-all text-left"
                    style={{
                      borderColor: isSelected ? '#2979FF' : '#E5E7EB',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#E5E7EB';
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Home className="w-5 h-5" style={{ color: isSelected ? '#2979FF' : '#6B7280' }} />
                          <h3 className="font-semibold" style={{ color: isSelected ? '#1E40AF' : '#111827' }}>
                            {property.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              background: property.transactionType === 'SALE' ? '#DBEAFE' : '#FEF3C7',
                              color: property.transactionType === 'SALE' ? '#1E40AF' : '#92400E',
                            }}
                          >
                            {property.transactionType === 'SALE' ? t.sale : t.rent}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm" style={{ color: '#6B7280' }}>
                          {(property.address || property.city) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {property.address && `${property.address}, `}
                                {property.city}
                              </span>
                            </div>
                          )}
                          {property.rooms && (
                            <span>{property.rooms} {t.rooms}</span>
                          )}
                        </div>
                      </div>
                      {property.price && (
                        <div className="flex items-center gap-1 text-right">
                          <DollarSign className="w-4 h-4" style={{ color: '#10B981' }} />
                          <span className="font-semibold" style={{ color: '#10B981' }}>
                            {formatPrice(property.price)}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={linking}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ background: '#F3F4F6', color: '#374151' }}
            onMouseEnter={(e) => !linking && (e.currentTarget.style.background = '#E5E7EB')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleLink}
            disabled={linking || !selectedPropertyId || selectedPropertyId === currentPropertyId}
            className="px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            style={{
              background: linking || !selectedPropertyId || selectedPropertyId === currentPropertyId ? '#9CA3AF' : '#2979FF',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              if (!linking && selectedPropertyId && selectedPropertyId !== currentPropertyId) {
                e.currentTarget.style.background = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!linking && selectedPropertyId && selectedPropertyId !== currentPropertyId) {
                e.currentTarget.style.background = '#2979FF';
              }
            }}
          >
            {linking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                {t.save}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
