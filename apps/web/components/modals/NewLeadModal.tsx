'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/language-context';
import { CreateLeadSchema } from '@/lib/validation/leads';
import type { CreateLeadRequest } from '@/lib/validation/leads';
import { useTracking } from '@/lib/observability';

type LeadSource = 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP' | 'CSV_UPLOAD' | 'GOOGLE_SHEETS' | 'MANUAL' | 'OTHER';
type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'MEETING' | 'OFFER' | 'DEAL' | 'WON' | 'LOST';
type LeadScore = 'HOT' | 'WARM' | 'COLD';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ownerUid: string;
}

type FormData = {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  source: LeadSource;
  sourceName: string;
  status: LeadStage;
  score: LeadScore;
  budget: string;
  interests: string[];
  notes: string;
  // UTM parameters
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  // Campaign association
  campaignId: string;
  platformAdSetId: string;
};

const SOURCE_LABELS = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  WHATSAPP: 'WhatsApp',
  CSV_UPLOAD: 'CSV Import',
  GOOGLE_SHEETS: 'Google Sheets',
  MANUAL: 'Manual',
  OTHER: 'Other',
};

const STATUS_LABELS = {
  NEW: { en: 'New', he: 'חדש' },
  CONTACTED: { en: 'Contacted', he: 'צור קשר' },
  QUALIFIED: { en: 'Qualified', he: 'מוסמך' },
  MEETING: { en: 'Meeting', he: 'פגישה' },
  OFFER: { en: 'Offer', he: 'הצעה' },
  DEAL: { en: 'Deal', he: 'עסקה' },
  WON: { en: 'Won', he: 'נמכר' },
  LOST: { en: 'Lost', he: 'אבד' },
};

const SCORE_LABELS = {
  HOT: { en: 'Hot', he: 'חם' },
  WARM: { en: 'Warm', he: 'פושר' },
  COLD: { en: 'Cold', he: 'קר' },
};

export default function NewLeadModal({ isOpen, onClose, onSuccess, ownerUid }: NewLeadModalProps) {
  console.log('[DEBUG] NewLeadModal render - isOpen:', isOpen, 'ownerUid:', ownerUid);
  const { language } = useLanguage();
  const tracking = useTracking();

  // Prevent hydration mismatch by only rendering after client mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    source: 'MANUAL',
    sourceName: '',
    status: 'NEW',
    score: 'COLD',
    budget: '',
    interests: [],
    notes: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
    campaignId: '',
    platformAdSetId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Refs for stable tracking of state
  const didInit = useRef(false);
  const prevOpen = useRef(isOpen);
  const trackingRef = useRef(tracking);

  // Update tracking ref when tracking changes
  trackingRef.current = tracking;

  // Default form data - memoized to prevent recreating object
  const defaultFormData = useRef<FormData>({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    source: 'MANUAL',
    sourceName: '',
    status: 'NEW',
    score: 'COLD',
    budget: '',
    interests: [],
    notes: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
    campaignId: '',
    platformAdSetId: '',
  });

  // One-time initialization
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
  }, [ownerUid]);

  // React to modal open/close changes
  useEffect(() => {
    if (prevOpen.current === isOpen) return;
    prevOpen.current = isOpen;

    if (isOpen) {
      // Reset form when opening
      setFormData({ ...defaultFormData.current });
      setError(null);
      setValidationErrors({});

      // Track modal open - use ref to avoid dependency loop
      trackingRef.current.modalOpen('new_lead_modal', { ownerUid });
    }
  }, [isOpen, ownerUid]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      // Prepare data for validation
      const validationData: CreateLeadRequest = {
        fullName: formData.fullName.trim(),
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        city: formData.city.trim() || undefined,
        source: formData.source,
        sourceName: formData.sourceName.trim() || undefined,
        status: formData.status,
        score: formData.score,
        budget: formData.budget ? Number(formData.budget) : undefined,
        interests: formData.interests,
        notes: formData.notes.trim() || undefined,
        utmSource: formData.utmSource.trim() || undefined,
        utmMedium: formData.utmMedium.trim() || undefined,
        utmCampaign: formData.utmCampaign.trim() || undefined,
        utmTerm: formData.utmTerm.trim() || undefined,
        utmContent: formData.utmContent.trim() || undefined,
        campaignId: formData.campaignId.trim() || undefined,
        platformAdSetId: formData.platformAdSetId.trim() || undefined,
        tags: [],
      };

      CreateLeadSchema.parse(validationData);
      return { isValid: true, data: validationData };
    } catch (err: any) {
      const errors: Record<string, string> = {};
      if (err.errors) {
        err.errors.forEach((error: any) => {
          const field = error.path[0];
          errors[field] = error.message;
        });
      }
      setValidationErrors(errors);
      return { isValid: false, data: null };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateForm();
    if (!validation.isValid || !validation.data) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': ownerUid,
        },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create lead' }));
        throw new Error(errorData.message || 'Failed to create lead');
      }

      // Success - track and close modal
      trackingRef.current.leadCreated({
        source: validation.data.source,
        hasEmail: Boolean(validation.data.email),
        hasPhone: Boolean(validation.data.phone),
        ownerUid,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      trackingRef.current.error(err, 'medium', {
        context: 'new_lead_modal_submit',
        ownerUid,
        formData: { source: formData.source, hasEmail: Boolean(formData.email) },
      });
      setError(err.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch - don't render modal during SSR
  if (!mounted) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  const t = (key: string, fallback: string) => {
    if (language === 'he') {
      const translations: Record<string, string> = {
        'New Lead': 'ליד חדש',
        'Full Name': 'שם מלא',
        'First Name': 'שם פרטי',
        'Last Name': 'שם משפחה',
        'Email': 'אימייל',
        'Phone': 'טלפון',
        'City': 'עיר',
        'Source': 'מקור',
        'Source Name': 'שם המקור',
        'Status': 'סטטוס',
        'Score': 'ציון',
        'Budget': 'תקציב',
        'Notes': 'הערות',
        'UTM Source': 'מקור UTM',
        'UTM Medium': 'אמצעי UTM',
        'UTM Campaign': 'קמפיין UTM',
        'UTM Term': 'מונח UTM',
        'UTM Content': 'תוכן UTM',
        'Campaign ID': 'מזהה קמפיין',
        'Platform Ad Set ID': 'מזהה קבוצת מודעות',
        'Create Lead': 'צור ליד',
        'Cancel': 'ביטול',
        'Creating...': 'יוצר...',
        'Required': 'שדה חובה',
      };
      return translations[key] || fallback;
    }
    return fallback;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6" suppressHydrationWarning>
      {/* Form panel */}
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {t('New Lead', 'New Lead')}
          </h3>
          <button
            type="button"
            className="rounded-md bg-gray-100 text-gray-400 hover:text-gray-500 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              trackingRef.current.modalClose('new_lead_modal', { ownerUid });
              onClose();
            }}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Full Name', 'Full Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      validationErrors.fullName ? 'border-red-300' : ''
                    }`}
                    placeholder={language === 'he' ? 'שם מלא' : 'Full name'}
                  />
                  {validationErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                  )}
                </div>

                {/* First and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('First Name', 'First Name')}
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder={language === 'he' ? 'שם פרטי' : 'First name'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Last Name', 'Last Name')}
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder={language === 'he' ? 'שם משפחה' : 'Last name'}
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        validationErrors.email ? 'border-red-300' : ''
                      }`}
                      placeholder="example@email.com"
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="+972-50-123-4567"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('City', 'City')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={language === 'he' ? 'עיר' : 'City'}
                  />
                </div>

                {/* Source, Status, Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Source', 'Source')}
                    </label>
                    <select
                      value={formData.source}
                      onChange={(e) => handleInputChange('source', e.target.value as LeadSource)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Status', 'Status')}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as LeadStage)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {Object.entries(STATUS_LABELS).map(([key, labels]) => (
                        <option key={key} value={key}>
                          {language === 'he' ? labels.he : labels.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Score', 'Score')}
                    </label>
                    <select
                      value={formData.score}
                      onChange={(e) => handleInputChange('score', e.target.value as LeadScore)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {Object.entries(SCORE_LABELS).map(([key, labels]) => (
                        <option key={key} value={key}>
                          {language === 'he' ? labels.he : labels.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Budget', 'Budget')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="1000"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Notes', 'Notes')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={language === 'he' ? 'הערות נוספות...' : 'Additional notes...'}
                  />
                </div>

                {/* Error display */}
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {t('Cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? t('Creating...', 'Creating...') : t('Create Lead', 'Create Lead')}
                  </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}