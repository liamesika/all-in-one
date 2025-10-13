'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { z } from 'zod';

// Zod validation schema
const leadSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  message: z.string().max(500, 'Message too long').optional(),
  source: z.string().min(1, 'Source is required'),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface EditLeadModalProps {
  isOpen: boolean;
  leadId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditLeadModal({ isOpen, leadId, onClose, onSuccess }: EditLeadModalProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    phone: '',
    email: '',
    message: '',
    source: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const t = {
    title: language === 'he' ? 'עריכת ליד' : 'Edit Lead',
    name: language === 'he' ? 'שם מלא' : 'Full Name',
    phone: language === 'he' ? 'טלפון' : 'Phone',
    email: language === 'he' ? 'אימייל' : 'Email',
    message: language === 'he' ? 'הודעה' : 'Message',
    source: language === 'he' ? 'מקור' : 'Source',
    save: language === 'he' ? 'שמור' : 'Save Changes',
    cancel: language === 'he' ? 'ביטול' : 'Cancel',
    loading: language === 'he' ? 'טוען...' : 'Loading...',
    saving: language === 'he' ? 'שומר...' : 'Saving...',
    required: language === 'he' ? 'שדה חובה' : 'Required',
  };

  const sources = [
    { value: 'Website', label: language === 'he' ? 'אתר' : 'Website' },
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Google', label: 'Google' },
    { value: 'Referral', label: language === 'he' ? 'הפניה' : 'Referral' },
    { value: 'Other', label: language === 'he' ? 'אחר' : 'Other' },
  ];

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadData();
    }
  }, [isOpen, leadId]);

  const fetchLeadData = async () => {
    setFetching(true);
    try {
      const response = await fetch(`/api/real-estate/leads/${leadId}`);
      if (!response.ok) throw new Error('Failed to fetch lead');
      const data = await response.json();

      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        message: data.message || '',
        source: data.source || '',
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const result = leadSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/real-estate/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) throw new Error('Failed to update lead');

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating lead:', error);
      setErrors({ _form: 'Failed to update lead. Please try again.' });
    } finally {
      setLoading(false);
    }
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
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: '#FFFFFF' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2979FF' }} />
              <span className="ml-3" style={{ color: '#6B7280' }}>{t.loading}</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t.name} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.fullName ? '#EF4444' : '#D1D5DB',
                    background: '#F9FAFB',
                    color: '#111827',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.fullName ? '#EF4444' : '#D1D5DB')}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t.phone} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.phone ? '#EF4444' : '#D1D5DB',
                    background: '#F9FAFB',
                    color: '#111827',
                  }}
                  dir="ltr"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.phone ? '#EF4444' : '#D1D5DB')}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t.email}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.email ? '#EF4444' : '#D1D5DB',
                    background: '#F9FAFB',
                    color: '#111827',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? '#EF4444' : '#D1D5DB')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.email}</p>
                )}
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t.source} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.source ? '#EF4444' : '#D1D5DB',
                    background: '#F9FAFB',
                    color: '#111827',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.source ? '#EF4444' : '#D1D5DB')}
                >
                  <option value="">Select source...</option>
                  {sources.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
                {errors.source && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.source}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t.message}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{
                    borderColor: errors.message ? '#EF4444' : '#D1D5DB',
                    background: '#F9FAFB',
                    color: '#111827',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.message ? '#EF4444' : '#D1D5DB')}
                />
                {errors.message && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.message}</p>
                )}
              </div>

              {/* Form-level error */}
              {errors._form && (
                <div className="p-4 rounded-lg" style={{ background: '#FEE2E2', border: '1px solid #EF4444' }}>
                  <p className="text-sm" style={{ color: '#DC2626' }}>{errors._form}</p>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ background: '#F3F4F6', color: '#374151' }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#E5E7EB')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || fetching}
            className="px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            style={{
              background: loading ? '#9CA3AF' : '#2979FF',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#1d4ed8')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#2979FF')}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t.save}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
