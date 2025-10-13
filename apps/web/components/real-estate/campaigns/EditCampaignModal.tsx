'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { z } from 'zod';

// Zod validation schema
const campaignSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  goal: z.enum(['TRAFFIC', 'CONVERSIONS', 'LEADS', 'BRAND_AWARENESS', 'REACH', 'ENGAGEMENT'], {
    errorMap: () => ({ message: 'Please select an objective' }),
  }),
  budget: z.number().positive('Budget must be positive').optional(),
  dailyBudget: z.number().positive('Daily budget must be positive').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  headline: z.string().max(60, 'Headline too long (max 60 chars)').optional(),
  description: z.string().max(300, 'Description too long (max 300 chars)').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  targetAudience: z.string().optional(),
});

interface Campaign {
  id: string;
  name: string;
  status: string;
  platform: string;
  goal: string;
  budget?: number;
  dailyBudget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate?: string;
  endDate?: string;
  creative?: {
    headline?: string;
    description?: string;
    imageUrl?: string;
  };
  audience?: any;
}

type CampaignFormData = {
  name: string;
  goal: string;
  budget: string;
  dailyBudget: string;
  startDate: string;
  endDate: string;
  headline: string;
  description: string;
  imageUrl: string;
  targetAudience: string;
};

interface EditCampaignModalProps {
  isOpen: boolean;
  campaign: Campaign;
  onClose: () => void;
  onSuccess?: (campaign: any) => void;
}

export function EditCampaignModal({ isOpen, campaign, onClose, onSuccess }: EditCampaignModalProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    goal: '',
    budget: '',
    dailyBudget: '',
    startDate: '',
    endDate: '',
    headline: '',
    description: '',
    imageUrl: '',
    targetAudience: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Pre-fill form with campaign data
  useEffect(() => {
    if (campaign) {
      const creative = campaign.creative as any || {};
      setFormData({
        name: campaign.name || '',
        goal: campaign.goal || '',
        budget: campaign.budget?.toString() || '',
        dailyBudget: campaign.dailyBudget?.toString() || '',
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
        headline: creative.headline || '',
        description: creative.description || '',
        imageUrl: creative.imageUrl || '',
        targetAudience: typeof campaign.audience === 'string' ? campaign.audience : JSON.stringify(campaign.audience || ''),
      });
    }
  }, [campaign]);

  const t = {
    title: language === 'he' ? 'ערוך קמפיין' : 'Edit Campaign',
    name: language === 'he' ? 'שם הקמפיין' : 'Campaign Name',
    platform: language === 'he' ? 'פלטפורמה' : 'Platform',
    objective: language === 'he' ? 'מטרה' : 'Objective',
    budget: language === 'he' ? 'תקציב כולל' : 'Total Budget',
    dailyBudget: language === 'he' ? 'תקציב יומי' : 'Daily Budget',
    startDate: language === 'he' ? 'תאריך התחלה' : 'Start Date',
    endDate: language === 'he' ? 'תאריך סיום' : 'End Date',
    headline: language === 'he' ? 'כותרת' : 'Headline',
    description: language === 'he' ? 'תיאור' : 'Description',
    imageUrl: language === 'he' ? 'כתובת תמונה' : 'Image URL',
    targetAudience: language === 'he' ? 'קהל יעד' : 'Target Audience',
    save: language === 'he' ? 'שמור שינויים' : 'Save Changes',
    cancel: language === 'he' ? 'ביטול' : 'Cancel',
    saving: language === 'he' ? 'שומר...' : 'Saving...',
    required: language === 'he' ? 'שדה חובה' : 'Required',
    optional: language === 'he' ? 'אופציונלי' : 'Optional',
    selectObjective: language === 'he' ? 'בחר מטרה' : 'Select objective',
    creative: language === 'he' ? 'קריאייטיב' : 'Creative',
    targeting: language === 'he' ? 'טרגוט' : 'Targeting',
    scheduling: language === 'he' ? 'תזמון' : 'Scheduling',
  };

  const objectives = [
    { value: 'LEADS', label: language === 'he' ? 'ליד ג\'נרשן' : 'Lead Generation' },
    { value: 'CONVERSIONS', label: language === 'he' ? 'המרות' : 'Conversions' },
    { value: 'TRAFFIC', label: language === 'he' ? 'תעבורה' : 'Traffic' },
    { value: 'BRAND_AWARENESS', label: language === 'he' ? 'מודעות למותג' : 'Brand Awareness' },
    { value: 'REACH', label: language === 'he' ? 'הגעה' : 'Reach' },
    { value: 'ENGAGEMENT', label: language === 'he' ? 'מעורבות' : 'Engagement' },
  ];

  const handleChange = (field: keyof CampaignFormData, value: string) => {
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

    // Prepare data for validation
    const dataToValidate = {
      name: formData.name,
      goal: formData.goal as any,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      dailyBudget: formData.dailyBudget ? parseFloat(formData.dailyBudget) : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      headline: formData.headline || undefined,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      targetAudience: formData.targetAudience || undefined,
    };

    // Validate with Zod
    const result = campaignSchema.safeParse(dataToValidate);

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
      const response = await fetch(`/api/real-estate/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) throw new Error('Failed to update campaign');

      const updatedCampaign = await response.json();

      setErrors({});
      onSuccess?.(updatedCampaign);
      onClose();
    } catch (error) {
      console.error('Error updating campaign:', error);
      setErrors({ _form: 'Failed to update campaign. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: '#1A2F4B' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
          style={{ background: '#1A2F4B', borderColor: '#374151' }}
        >
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              {t.title}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              {campaign.platform} • {campaign.status}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#374151')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Campaign Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t.name} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.name ? '#EF4444' : '#374151',
                    background: '#0E1A2B',
                    color: '#FFFFFF',
                  }}
                />
                {errors.name && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.name}</p>
                )}
              </div>

              {/* Platform (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t.platform}
                </label>
                <input
                  type="text"
                  value={campaign.platform}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{
                    borderColor: '#374151',
                    background: '#0E1A2B',
                    color: '#6B7280',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              {/* Objective */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t.objective} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => handleChange('goal', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.goal ? '#EF4444' : '#374151',
                    background: '#0E1A2B',
                    color: '#FFFFFF',
                  }}
                >
                  <option value="">{t.selectObjective}</option>
                  {objectives.map((objective) => (
                    <option key={objective.value} value={objective.value}>
                      {objective.label}
                    </option>
                  ))}
                </select>
                {errors.goal && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.goal}</p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t.budget} <span style={{ color: '#9CA3AF' }}>({t.optional})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.budget ? '#EF4444' : '#374151',
                    background: '#0E1A2B',
                    color: '#FFFFFF',
                  }}
                />
                {errors.budget && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.budget}</p>
                )}
              </div>

              {/* Daily Budget */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t.dailyBudget} <span style={{ color: '#9CA3AF' }}>({t.optional})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.dailyBudget}
                  onChange={(e) => handleChange('dailyBudget', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.dailyBudget ? '#EF4444' : '#374151',
                    background: '#0E1A2B',
                    color: '#FFFFFF',
                  }}
                />
                {errors.dailyBudget && (
                  <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.dailyBudget}</p>
                )}
              </div>
            </div>

            {/* Scheduling Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#FFFFFF' }}>
                {t.scheduling}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                    {t.startDate}
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: '#374151',
                      background: '#0E1A2B',
                      color: '#FFFFFF',
                    }}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                    {t.endDate}
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: '#374151',
                      background: '#0E1A2B',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Creative Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#FFFFFF' }}>
                {t.creative}
              </h3>
              <div className="space-y-4">
                {/* Headline */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                    {t.headline} <span style={{ color: '#9CA3AF' }}>(max 60 {language === 'he' ? 'תווים' : 'chars'})</span>
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={formData.headline}
                    onChange={(e) => handleChange('headline', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: errors.headline ? '#EF4444' : '#374151',
                      background: '#0E1A2B',
                      color: '#FFFFFF',
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.headline && (
                      <p className="text-sm" style={{ color: '#EF4444' }}>{errors.headline}</p>
                    )}
                    <p className="text-xs ml-auto" style={{ color: '#9CA3AF' }}>
                      {formData.headline.length}/60
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                    {t.description} <span style={{ color: '#9CA3AF' }}>(max 300 {language === 'he' ? 'תווים' : 'chars'})</span>
                  </label>
                  <textarea
                    maxLength={300}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{
                      borderColor: errors.description ? '#EF4444' : '#374151',
                      background: '#0E1A2B',
                      color: '#FFFFFF',
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && (
                      <p className="text-sm" style={{ color: '#EF4444' }}>{errors.description}</p>
                    )}
                    <p className="text-xs ml-auto" style={{ color: '#9CA3AF' }}>
                      {formData.description.length}/300
                    </p>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                    {t.imageUrl}
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: errors.imageUrl ? '#EF4444' : '#374151',
                      background: '#0E1A2B',
                      color: '#FFFFFF',
                    }}
                  />
                  {errors.imageUrl && (
                    <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>{errors.imageUrl}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Targeting Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#FFFFFF' }}>
                {t.targeting}
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t.targetAudience}
                </label>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{
                    borderColor: '#374151',
                    background: '#0E1A2B',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>

            {/* Form-level error */}
            {errors._form && (
              <div className="p-4 rounded-lg" style={{ background: '#EF444420', border: '1px solid #EF4444' }}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: '#EF4444' }} />
                  <p className="text-sm" style={{ color: '#EF4444' }}>{errors._form}</p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t"
          style={{ background: '#1A2F4B', borderColor: '#374151' }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ background: '#374151', color: '#E5E7EB' }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#4B5563')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#374151')}
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            style={{
              background: loading ? '#6B7280' : '#2979FF',
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
