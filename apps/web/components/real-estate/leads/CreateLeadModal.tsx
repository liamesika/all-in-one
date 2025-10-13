'use client';

import { useState } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
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

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (lead: any) => void;
}

export function CreateLeadModal({ isOpen, onClose, onSuccess }: CreateLeadModalProps) {
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

  const t = {
    title: language === 'he' ? 'ליד חדש' : 'New Lead',
    name: language === 'he' ? 'שם מלא' : 'Full Name',
    phone: language === 'he' ? 'טלפון' : 'Phone',
    email: language === 'he' ? 'אימייל' : 'Email',
    message: language === 'he' ? 'הודעה' : 'Message',
    source: language === 'he' ? 'מקור' : 'Source',
    create: language === 'he' ? 'צור ליד' : 'Create Lead',
    cancel: language === 'he' ? 'ביטול' : 'Cancel',
    creating: language === 'he' ? 'יוצר...' : 'Creating...',
    required: language === 'he' ? 'שדה חובה' : 'Required',
    duplicateError: language === 'he' ? 'ליד עם מספר טלפון זה כבר קיים במערכת' : 'A lead with this phone number already exists',
  };

  const sources = [
    { value: 'Website', label: language === 'he' ? 'אתר' : 'Website' },
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Google', label: 'Google' },
    { value: 'Referral', label: language === 'he' ? 'הפניה' : 'Referral' },
    { value: 'Other', label: language === 'he' ? 'אחר' : 'Other' },
  ];

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
      const response = await fetch('/api/real-estate/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (response.status === 409) {
        // Duplicate lead
        const data = await response.json();
        setErrors({ phone: t.duplicateError });
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error('Failed to create lead');

      const newLead = await response.json();

      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        message: '',
        source: '',
      });
      setErrors({});

      onSuccess?.(newLead);
      onClose();
    } catch (error) {
      console.error('Error creating lead:', error);
      setErrors({ _form: 'Failed to create lead. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      message: '',
      source: '',
    });
    setErrors({});
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
        <form onSubmit={handleSubmit} className="p-6">
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
                placeholder="+972501234567"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
                onBlur={(e) => (e.currentTarget.style.borderColor = errors.phone ? '#EF4444' : '#D1D5DB')}
              />
              {errors.phone && (
                <div className="mt-1 flex items-start gap-1">
                  <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#EF4444' }} />
                  <p className="text-sm" style={{ color: '#EF4444' }}>{errors.phone}</p>
                </div>
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
                placeholder="email@example.com"
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
        </form>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <button
            type="button"
            onClick={handleClose}
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
            disabled={loading}
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
                {t.creating}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t.create}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
