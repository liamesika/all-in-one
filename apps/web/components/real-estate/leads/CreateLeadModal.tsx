'use client';

import { useState } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
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
  notes: z.string().max(1000).optional(),
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
    qualificationStatus: 'NEW',
    notes: '',
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
    status: language === 'he' ? 'סטטוס' : 'Status',
    notes: language === 'he' ? 'הערות' : 'Notes',
    create: language === 'he' ? 'צור ליד' : 'Create Lead',
    cancel: language === 'he' ? 'ביטול' : 'Cancel',
    creating: language === 'he' ? 'יוצר...' : 'Creating...',
    required: language === 'he' ? 'שדה חובה' : 'Required',
    duplicateError: language === 'he' ? 'ליד עם מספר טלפון זה כבר קיים במערכת' : 'A lead with this phone number already exists',
    authError: language === 'he' ? 'נדרשת התחברות' : 'Authentication required',
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
    { value: 'CONTACTED', label: language === 'he' ? 'יצרנו קשר' : 'Contacted' },
    { value: 'IN_PROGRESS', label: language === 'he' ? 'בטיפול' : 'In Progress' },
    { value: 'MEETING', label: language === 'he' ? 'פגישה' : 'Meeting' },
    { value: 'OFFER', label: language === 'he' ? 'הצעה' : 'Offer' },
    { value: 'DEAL', label: language === 'he' ? 'עסקה' : 'Deal' },
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
      const user = auth.currentUser;
      if (!user) {
        setErrors({ _form: t.authError });
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch('/api/real-estate/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(result.data),
      });

      if (response.status === 409) {
        // Duplicate lead
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
        qualificationStatus: 'NEW',
        notes: '',
      });
      setErrors({});

      onSuccess?.(newLead);
      onClose();
    } catch (error) {
      console.error('Error creating lead:', error);
      setErrors({ _form: language === 'he' ? 'שגיאה ביצירת ליד. נסה שוב.' : 'Failed to create lead. Please try again.' });
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
      qualificationStatus: 'NEW',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-lead-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-[#1A2F4B] ${language === 'he' ? 'rtl' : 'ltr'}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#1A2F4B] border-b border-gray-200 dark:border-[#2979FF]/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="create-lead-title" className="text-heading-3 text-gray-900 dark:text-white">
              {t.title}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors"
              aria-label={t.cancel}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {errors._form && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{errors._form}</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.name} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={`w-full px-4 py-2.5 min-h-[44px] rounded-lg border ${
                errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-[#2979FF]/20'
              } bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all`}
              autoFocus
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.phone} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="0501234567"
              className={`w-full px-4 py-2.5 min-h-[44px] rounded-lg border ${
                errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-[#2979FF]/20'
              } bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all`}
              dir="ltr"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.email}
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-2.5 min-h-[44px] rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-[#2979FF]/20'
              } bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Source */}
          <div>
            <label htmlFor="source" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.source} <span className="text-red-500">*</span>
            </label>
            <select
              id="source"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              className={`w-full px-4 py-2.5 min-h-[44px] rounded-lg border ${
                errors.source ? 'border-red-500' : 'border-gray-300 dark:border-[#2979FF]/20'
              } bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all`}
            >
              <option value="">{language === 'he' ? 'בחר מקור' : 'Select source'}</option>
              {sources.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
            {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source}</p>}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="qualificationStatus" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.status}
            </label>
            <select
              id="qualificationStatus"
              value={formData.qualificationStatus}
              onChange={(e) => handleChange('qualificationStatus', e.target.value)}
              className="w-full px-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.message}
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.message ? 'border-red-500' : 'border-gray-300 dark:border-[#2979FF]/20'
              } bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all resize-none`}
            />
            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.notes}
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.notes ? 'border-red-500' : 'border-gray-300 dark:border-[#2979FF]/20'
              } bg-white dark:bg-[#0E1A2B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all resize-none`}
              placeholder={language === 'he' ? 'הערות פנימיות...' : 'Internal notes...'}
            />
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#2979FF]/20">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors font-medium"
              disabled={loading}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 min-h-[44px] rounded-lg bg-gradient-to-r from-[#2979FF] to-[#1E5FCC] text-white font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
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
        </form>
      </div>
    </div>
  );
}
