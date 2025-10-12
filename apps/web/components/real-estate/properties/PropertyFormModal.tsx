'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageUploader } from '@/components/common/ImageUploader';

interface PropertyFormData {
  title: string;
  address: string;
  city: string;
  price: string;
  rooms: string;
  sizeSqm: string;
  status: 'LISTED' | 'DRAFT' | 'UNDER_OFFER' | 'SOLD';
  description: string;
  amenities: string;
  images: string[];
}

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (property: any) => void;
  property?: any; // Existing property for edit mode
}

export function PropertyFormModal({ isOpen, onClose, onSuccess, property }: PropertyFormModalProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    address: '',
    city: '',
    price: '',
    rooms: '',
    sizeSqm: '',
    status: 'DRAFT',
    description: '',
    amenities: '',
    images: [],
  });

  // Populate form when editing
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.name || '',
        address: property.address || '',
        city: property.city || '',
        price: property.price?.toString() || '',
        rooms: property.rooms?.toString() || '',
        sizeSqm: property.size?.toString() || '',
        status: property.status || 'DRAFT',
        description: property.description || '',
        amenities: property.amenities || '',
        images: property.images || [],
      });
    }
  }, [property]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = language === 'he' ? 'שם הנכס חובה' : 'Property name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = language === 'he' ? 'כתובת חובה' : 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = language === 'he' ? 'עיר חובה' : 'City is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = language === 'he' ? 'מחיר חובה' : 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = language === 'he' ? 'מחיר לא תקין' : 'Invalid price';
    }

    if (formData.rooms.trim() && (isNaN(Number(formData.rooms)) || Number(formData.rooms) <= 0)) {
      newErrors.rooms = language === 'he' ? 'מספר חדרים לא תקין' : 'Invalid number of rooms';
    }

    if (formData.sizeSqm.trim() && (isNaN(Number(formData.sizeSqm)) || Number(formData.sizeSqm) <= 0)) {
      newErrors.sizeSqm = language === 'he' ? 'גודל לא תקין' : 'Invalid size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowToast({
        type: 'error',
        message: language === 'he' ? 'אנא תקן את השגיאות בטופס' : 'Please fix the errors in the form',
      });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.title,
        address: formData.address,
        city: formData.city,
        price: Number(formData.price),
        rooms: formData.rooms ? Number(formData.rooms) : undefined,
        size: formData.sizeSqm ? Number(formData.sizeSqm) : undefined,
        status: formData.status,
        description: formData.description,
        amenities: formData.amenities,
        images: formData.images,
      };

      const url = property
        ? `/api/real-estate/properties/${property.id}`
        : '/api/real-estate/properties';

      const method = property ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-owner-uid': 'demo-user', // TODO: Get from Firebase auth
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save property');
      }

      const savedProperty = await response.json();

      setShowToast({
        type: 'success',
        message: property
          ? (language === 'he' ? 'הנכס עודכן בהצלחה' : 'Property updated successfully')
          : (language === 'he' ? 'הנכס נוצר בהצלחה' : 'Property created successfully'),
      });

      setTimeout(() => {
        setShowToast(null);
        onSuccess(savedProperty);
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('Error saving property:', error);
      setShowToast({
        type: 'error',
        message: error.message || (language === 'he' ? 'שגיאה בשמירת הנכס' : 'Error saving property'),
      });
      setTimeout(() => setShowToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PropertyFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {property
              ? (language === 'he' ? 'ערוך נכס' : 'Edit Property')
              : (language === 'he' ? 'נכס חדש' : 'New Property')}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'he' ? 'שם הנכס' : 'Property Name'}
                <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={language === 'he' ? 'לדוגמה: דירת יוקרה בתל אביב' : 'e.g., Luxury Apartment in Tel Aviv'}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Address & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'he' ? 'כתובת' : 'Address'}
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={language === 'he' ? 'רחוב ומספר' : 'Street and number'}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'he' ? 'עיר' : 'City'}
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={language === 'he' ? 'תל אביב, ירושלים...' : 'Tel Aviv, Jerusalem...'}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>

            {/* Price, Rooms, Size */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'he' ? 'מחיר (₪)' : 'Price (₪)'}
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2500000"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'he' ? 'חדרים' : 'Rooms'}
                </label>
                <input
                  type="text"
                  value={formData.rooms}
                  onChange={(e) => handleChange('rooms', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.rooms ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="4"
                />
                {errors.rooms && <p className="text-red-500 text-sm mt-1">{errors.rooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'he' ? 'גודל (מ״ר)' : 'Size (sqm)'}
                </label>
                <input
                  type="text"
                  value={formData.sizeSqm}
                  onChange={(e) => handleChange('sizeSqm', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sizeSqm ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="120"
                />
                {errors.sizeSqm && <p className="text-red-500 text-sm mt-1">{errors.sizeSqm}</p>}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'he' ? 'סטטוס' : 'Status'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DRAFT">{language === 'he' ? 'טיוטה' : 'Draft'}</option>
                <option value="LISTED">{language === 'he' ? 'רשום' : 'Listed'}</option>
                <option value="UNDER_OFFER">{language === 'he' ? 'בהצעה' : 'Under Offer'}</option>
                <option value="SOLD">{language === 'he' ? 'נמכר' : 'Sold'}</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'he' ? 'תיאור' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder={language === 'he' ? 'תאר את הנכס...' : 'Describe the property...'}
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'he' ? 'שירותים ומתקנים' : 'Amenities'}
              </label>
              <input
                type="text"
                value={formData.amenities}
                onChange={(e) => handleChange('amenities', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={language === 'he' ? 'חניה, מעלית, מרפסת...' : 'Parking, Elevator, Balcony...'}
              />
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'he' ? 'תמונות' : 'Images'}
                <span className="text-gray-500 text-xs font-normal mr-2">
                  ({language === 'he' ? 'אופציונלי' : 'Optional'})
                </span>
              </label>
              <ImageUploader
                maxImages={10}
                maxSizeMB={5}
                value={formData.images}
                onChange={(urls) => handleChange('images', urls)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {language === 'he' ? 'שומר...' : 'Saving...'}
                </>
              ) : (
                property
                  ? (language === 'he' ? 'עדכן נכס' : 'Update Property')
                  : (language === 'he' ? 'צור נכס' : 'Create Property')
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-6 right-6 left-6 md:left-auto md:w-96 bg-white rounded-lg shadow-2xl border-2 ${
          showToast.type === 'success' ? 'border-green-500' : 'border-red-500'
        } p-4 flex items-center gap-3 animate-fade-in z-[60]`}>
          {showToast.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          )}
          <p className="text-gray-900 font-medium flex-1">{showToast.message}</p>
        </div>
      )}
    </div>
  );
}
