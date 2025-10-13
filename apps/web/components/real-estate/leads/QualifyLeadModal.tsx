'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, Home, MapPin, DollarSign, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface Property {
  id: string;
  name: string;
  address?: string;
  city?: string;
  transactionType: 'SALE' | 'RENT';
  price?: number;
  rooms?: number;
}

interface QualifyResult {
  insights: string;
  recommendedProperties: Property[];
}

interface QualifyLeadModalProps {
  isOpen: boolean;
  leadId: string;
  onClose: () => void;
  onPropertyLink?: (propertyId: string) => void;
}

export function QualifyLeadModal({ isOpen, leadId, onClose, onPropertyLink }: QualifyLeadModalProps) {
  const { language } = useLanguage();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QualifyResult | null>(null);
  const [linkingPropertyId, setLinkingPropertyId] = useState<string | null>(null);

  const t = {
    title: language === 'he' ? 'סיווג AI ללקוח' : 'AI Qualify Lead',
    notes: language === 'he' ? 'הערות נוספות (אופציונלי)' : 'Additional Notes (Optional)',
    notesPlaceholder: language === 'he' ? 'הוסף הערות לגבי הלקוח, העדפות, תקציב...' : 'Add notes about the lead, preferences, budget...',
    analyze: language === 'he' ? 'נתח לקוח' : 'Analyze Lead',
    analyzing: language === 'he' ? 'מנתח...' : 'Analyzing...',
    insights: language === 'he' ? 'ניתוח AI' : 'AI Insights',
    recommended: language === 'he' ? 'נכסים מומלצים' : 'Recommended Properties',
    linkProperty: language === 'he' ? 'קשר נכס' : 'Link Property',
    linking: language === 'he' ? 'מקשר...' : 'Linking...',
    close: language === 'he' ? 'סגור' : 'Close',
    noProperties: language === 'he' ? 'לא נמצאו נכסים מומלצים' : 'No recommended properties',
    sale: language === 'he' ? 'למכירה' : 'For Sale',
    rent: language === 'he' ? 'להשכרה' : 'For Rent',
    rooms: language === 'he' ? 'חדרים' : 'rooms',
    error: language === 'he' ? 'שגיאה בניתוח' : 'Analysis failed',
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/real-estate/leads/${leadId}/qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() || undefined }),
      });

      if (!response.ok) throw new Error('Qualification failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error qualifying lead:', error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkProperty = async (propertyId: string) => {
    setLinkingPropertyId(propertyId);
    try {
      const response = await fetch(`/api/real-estate/leads/${leadId}/link-property`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      if (!response.ok) throw new Error('Failed to link property');

      onPropertyLink?.(propertyId);
      // Show success feedback
      setTimeout(() => {
        setLinkingPropertyId(null);
      }, 1000);
    } catch (error) {
      console.error('Error linking property:', error);
      setLinkingPropertyId(null);
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

  const handleClose = () => {
    setNotes('');
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: '#FFFFFF' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#111827' }}>
            <Sparkles className="w-7 h-7" style={{ color: '#8B5CF6' }} />
            {t.title}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input Section */}
          {!result && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                {t.notes}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                style={{
                  borderColor: '#D1D5DB',
                  background: '#F9FAFB',
                  color: '#111827',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#8B5CF6')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
              />
            </div>
          )}

          {/* Analyze Button */}
          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all text-lg"
              style={{
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  {t.analyze}
                </>
              )}
            </button>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {/* AI Insights */}
              <div className="rounded-xl p-6" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                  {t.insights}
                </h3>
                <div className="prose prose-sm max-w-none" style={{ color: '#374151' }}>
                  <p className="whitespace-pre-wrap">{result.insights}</p>
                </div>
              </div>

              {/* Recommended Properties */}
              <div className="rounded-xl p-6" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
                  <Home className="w-5 h-5" style={{ color: '#2979FF' }} />
                  {t.recommended}
                </h3>

                {result.recommendedProperties.length === 0 ? (
                  <p className="text-center py-8 text-sm" style={{ color: '#9CA3AF' }}>
                    {t.noProperties}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {result.recommendedProperties.map((property) => (
                      <div
                        key={property.id}
                        className="p-4 rounded-lg border"
                        style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Home className="w-5 h-5" style={{ color: '#6B7280' }} />
                              <h4 className="font-semibold" style={{ color: '#111827' }}>
                                {property.name}
                              </h4>
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
                            <div className="flex items-center gap-4 text-sm mb-3" style={{ color: '#6B7280' }}>
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
                            {property.price && (
                              <div className="flex items-center gap-1 mb-3">
                                <DollarSign className="w-4 h-4" style={{ color: '#10B981' }} />
                                <span className="font-semibold text-lg" style={{ color: '#10B981' }}>
                                  {formatPrice(property.price)}
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleLinkProperty(property.id)}
                            disabled={linkingPropertyId === property.id}
                            className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all whitespace-nowrap"
                            style={{
                              background: linkingPropertyId === property.id ? '#9CA3AF' : '#2979FF',
                              color: '#FFFFFF',
                            }}
                            onMouseEnter={(e) => {
                              if (linkingPropertyId !== property.id) {
                                e.currentTarget.style.background = '#1d4ed8';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (linkingPropertyId !== property.id) {
                                e.currentTarget.style.background = '#2979FF';
                              }
                            }}
                          >
                            {linkingPropertyId === property.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t.linking}
                              </>
                            ) : (
                              <>
                                <LinkIcon className="w-4 h-4" />
                                {t.linkProperty}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ background: '#F3F4F6', color: '#374151' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
