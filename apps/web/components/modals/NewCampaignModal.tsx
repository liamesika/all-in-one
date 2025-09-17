'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { CreateCampaignSchema } from '@/lib/validation/campaigns';
import type { CreateCampaignRequest } from '@/lib/validation/campaigns';
import { useTracking } from '@/lib/observability';

type CampaignPlatform = 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN';
type CampaignGoal = 'TRAFFIC' | 'CONVERSIONS' | 'LEADS' | 'BRAND_AWARENESS' | 'REACH' | 'ENGAGEMENT';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ownerUid: string;
}

type FormData = {
  name: string;
  platform: CampaignPlatform;
  goal: CampaignGoal;
  budget: string;
  dailyBudget: string;
  audience: Record<string, any>;
  creative: Record<string, any>;
  startDate: string;
  endDate: string;
  connectionId: string;
};

const PLATFORM_LABELS = {
  META: 'Meta (Facebook/Instagram)',
  GOOGLE: 'Google Ads',
  TIKTOK: 'TikTok',
  LINKEDIN: 'LinkedIn',
};

const GOAL_LABELS = {
  TRAFFIC: { en: 'Website Traffic', he: 'תנועה לאתר' },
  CONVERSIONS: { en: 'Conversions', he: 'המרות' },
  LEADS: { en: 'Lead Generation', he: 'יצירת לידים' },
  BRAND_AWARENESS: { en: 'Brand Awareness', he: 'מודעות למותג' },
  REACH: { en: 'Reach', he: 'הגעה' },
  ENGAGEMENT: { en: 'Engagement', he: 'מעורבות' },
};

export default function NewCampaignModal({ isOpen, onClose, onSuccess, ownerUid }: NewCampaignModalProps) {
  const { language } = useLanguage();
  const tracking = useTracking();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    platform: 'META',
    goal: 'LEADS',
    budget: '',
    dailyBudget: '',
    audience: {},
    creative: {},
    startDate: '',
    endDate: '',
    connectionId: '',
  });

  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      tracking.modalOpen('new_campaign_modal', { ownerUid });
      setFormData({
        name: '',
        platform: 'META',
        goal: 'LEADS',
        budget: '',
        dailyBudget: '',
        audience: {},
        creative: {},
        startDate: '',
        endDate: '',
        connectionId: '',
      });
      setError(null);
      setValidationErrors({});
      fetchConnections();
    }
  }, [isOpen, tracking, ownerUid]);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`/api/connections?ownerUid=${ownerUid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | Record<string, any>) => {
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
      const validationData: CreateCampaignRequest = {
        name: formData.name.trim(),
        platform: formData.platform,
        goal: formData.goal,
        budget: formData.budget ? Number(formData.budget) : undefined,
        dailyBudget: formData.dailyBudget ? Number(formData.dailyBudget) : undefined,
        audience: Object.keys(formData.audience).length > 0 ? formData.audience : undefined,
        creative: Object.keys(formData.creative).length > 0 ? formData.creative : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        connectionId: formData.connectionId || undefined,
      };

      CreateCampaignSchema.parse(validationData);
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
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': ownerUid,
        },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create campaign' }));
        throw new Error(errorData.message || 'Failed to create campaign');
      }

      // Success - track and close modal
      tracking.campaignCreated({
        platform: validation.data.platform,
        goal: validation.data.goal,
        hasBudget: Boolean(validation.data.budget),
        hasConnection: Boolean(validation.data.connectionId),
        ownerUid,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      tracking.error(err, 'medium', {
        context: 'new_campaign_modal_submit',
        ownerUid,
        formData: { platform: formData.platform, goal: formData.goal },
      });
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableConnections = () => {
    return connections.filter(conn =>
      conn.platform === formData.platform && conn.status === 'CONNECTED'
    );
  };

  if (!isOpen) return null;

  const t = (key: string, fallback: string) => {
    if (language === 'he') {
      const translations: Record<string, string> = {
        'New Campaign': 'קמפיין חדש',
        'Campaign Name': 'שם הקמפיין',
        'Platform': 'פלטפורמה',
        'Goal': 'מטרה',
        'Budget': 'תקציב',
        'Daily Budget': 'תקציב יומי',
        'Connection': 'חיבור',
        'Start Date': 'תאריך התחלה',
        'End Date': 'תאריך סיום',
        'Create Campaign': 'צור קמפיין',
        'Cancel': 'ביטול',
        'Creating...': 'יוצר...',
        'Required': 'שדה חובה',
        'No connections available': 'אין חיבורים זמינים',
        'You need to connect your account first': 'עליך לחבר את החשבון שלך תחילה',
      };
      return translations[key] || fallback;
    }
    return fallback;
  };

  const availableConnections = getAvailableConnections();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block transform rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('New Campaign', 'New Campaign')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campaign Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Campaign Name', 'Campaign Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      validationErrors.name ? 'border-red-300' : ''
                    }`}
                    placeholder={language === 'he' ? 'שם הקמפיין' : 'Campaign name'}
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                {/* Platform and Goal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Platform', 'Platform')} *
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => handleInputChange('platform', e.target.value as CampaignPlatform)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Goal', 'Goal')} *
                    </label>
                    <select
                      value={formData.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value as CampaignGoal)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {Object.entries(GOAL_LABELS).map(([key, labels]) => (
                        <option key={key} value={key}>
                          {language === 'he' ? labels.he : labels.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Connection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Connection', 'Connection')}
                  </label>
                  {availableConnections.length > 0 ? (
                    <select
                      value={formData.connectionId}
                      onChange={(e) => handleInputChange('connectionId', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">{language === 'he' ? 'בחר חיבור' : 'Select connection'}</option>
                      {availableConnections.map((conn) => (
                        <option key={conn.id} value={conn.id}>
                          {conn.accountName || `${conn.platform} Account`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                      {t('No connections available', 'No connections available')} for {PLATFORM_LABELS[formData.platform]}.{' '}
                      {t('You need to connect your account first', 'You need to connect your account first')}.
                    </div>
                  )}
                </div>

                {/* Budget and Daily Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Budget', 'Budget')} ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Daily Budget', 'Daily Budget')} ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.dailyBudget}
                      onChange={(e) => handleInputChange('dailyBudget', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                </div>

                {/* Start and End Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Start Date', 'Start Date')}
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('End Date', 'End Date')}
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
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
                    {loading ? t('Creating...', 'Creating...') : t('Create Campaign', 'Create Campaign')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}