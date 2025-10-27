'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { auth } from '@/lib/firebase';
import { z } from 'zod';

// Zod validation schema
const leadSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  message: z.string().max(500, 'Message too long').optional(),
  source: z.string().min(1, 'Source is required'),
  qualificationStatus: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'MEETING', 'OFFER', 'DEAL', 'CONVERTED', 'DISQUALIFIED']).optional(),
  assignedToId: z.string().optional().or(z.null()),
  notes: z.string().max(1000, 'Notes too long').optional(),
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
    qualificationStatus: 'NEW',
    assignedToId: null,
    notes: '',
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
    status: language === 'he' ? 'סטטוס' : 'Status',
    notes: language === 'he' ? 'הערות' : 'Notes',
    save: language === 'he' ? 'שמור' : 'Save Changes',
    cancel: language === 'he' ? 'ביטול' : 'Cancel',
    loading: language === 'he' ? 'טוען...' : 'Loading...',
    saving: language === 'he' ? 'שומר...' : 'Saving...',
    required: language === 'he' ? 'שדה חובה' : 'Required',
    authError: language === 'he' ? 'נדרשת אימות. אנא התחבר מחדש.' : 'Authentication required. Please sign in again.',
  };

  const sources = [
    { value: 'Website', label: language === 'he' ? 'אתר' : 'Website' },
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Google', label: 'Google' },
    { value: 'Referral', label: language === 'he' ? 'הפניה' : 'Referral' },
    { value: 'Other', label: language === 'he' ? 'אחר' : 'Other' },
  ];

  const statuses = [
    { value: 'NEW', label: language === 'he' ? 'חדש' : 'New' },
    { value: 'CONTACTED', label: language === 'he' ? 'יצירת קשר' : 'Contacted' },
    { value: 'IN_PROGRESS', label: language === 'he' ? 'בתהליך' : 'In Progress' },
    { value: 'MEETING', label: language === 'he' ? 'פגישה' : 'Meeting' },
    { value: 'OFFER', label: language === 'he' ? 'הצעה' : 'Offer' },
    { value: 'DEAL', label: language === 'he' ? 'עסקה' : 'Deal' },
    { value: 'CONVERTED', label: language === 'he' ? 'הומר' : 'Converted' },
    { value: 'DISQUALIFIED', label: language === 'he' ? 'לא רלוונטי' : 'Disqualified' },
  ];

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadData();
    }
  }, [isOpen, leadId]);

  const fetchLeadData = async () => {
    setFetching(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setErrors({ _form: t.authError });
        setFetching(false);
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch(`/api/real-estate/leads/${leadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch lead');
      const data = await response.json();

      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        message: data.message || '',
        source: data.source || '',
        qualificationStatus: data.qualificationStatus || 'NEW',
        assignedToId: data.assignedToId || null,
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
      setErrors({ _form: language === 'he' ? 'שגיאה בטעינת הליד' : 'Failed to load lead' });
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
      const user = auth.currentUser;
      if (!user) {
        setErrors({ _form: t.authError });
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch(`/api/real-estate/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) throw new Error('Failed to update lead');

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating lead:', error);
      setErrors({ _form: language === 'he' ? 'שגיאה בעדכון הליד. נסה שוב.' : 'Failed to update lead. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-lead-title"
      onKeyDown={handleKeyDown}
    >
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
          <h2 id="edit-lead-title" className="text-2xl font-bold" style={{ color: '#111827' }}>
            {t.title}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 min-h-[44px] min-w-[44px] rounded-lg transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            aria-label={t.cancel}
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

              {/* Status */}
              <div>
                <label htmlFor="qualificationStatus" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t.status}
                </label>
                <select
                  id="qualificationStatus"
                  value={formData.qualificationStatus}
                  onChange={(e) => handleChange('qualificationStatus', e.target.value)}
                  className="w-full px-4 py-2.5 min-h-[44px] rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.qualificationStatus ? '#EF4444' : '#D1D5DB',
                    background: '#F9FAFB',
                    color: '#111827',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.qualificationStatus ? '#EF4444' : '#D1D5DB')}
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {errors.qualificationStatus && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.qualificationStatus}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t.notes}
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  placeholder={language === 'he' ? 'הערות פנימיות...' : 'Internal notes...'}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{
                    borderColor: errors.notes ? '#EF4444' : '#D1D5DB',
                    background: '#F9FAFB',
                    color: '#111827',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.notes ? '#EF4444' : '#D1D5DB')}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.notes}</p>
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
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 min-h-[44px] rounded-lg font-medium transition-colors"
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
            className="px-6 py-2.5 min-h-[44px] rounded-lg font-medium flex items-center gap-2 transition-all"
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
