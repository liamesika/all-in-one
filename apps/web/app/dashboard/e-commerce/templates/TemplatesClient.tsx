'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';

type AutoFollowupTrigger = 'NEW_LEAD' | 'HOT_LEAD' | 'FIRST_CONTACT' | 'QUALIFIED' | 'NO_RESPONSE_24H' | 'NO_RESPONSE_7D';
type AutoFollowupChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';

type AutoFollowupTemplate = {
  id: string;
  name: string;
  trigger: AutoFollowupTrigger;
  channel: AutoFollowupChannel;
  subject?: string;
  content: string;
  variables?: string[];
  isActive: boolean;
  delayMinutes: number;
  brandName?: string;
  brandLogo?: string;
  brandColors?: any;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followups: number;
  };
};

const TRIGGER_LABELS = {
  NEW_LEAD: 'New Lead',
  HOT_LEAD: 'Hot Lead',
  FIRST_CONTACT: 'First Contact',
  QUALIFIED: 'Qualified Lead',
  NO_RESPONSE_24H: 'No Response (24h)',
  NO_RESPONSE_7D: 'No Response (7d)',
};

const CHANNEL_LABELS = {
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  SMS: 'SMS',
};

const DEFAULT_TEMPLATES = {
  NEW_LEAD_EMAIL: {
    name: 'Welcome Email',
    subject: 'Thank you for your interest, {{leadName}}!',
    content: `Hi {{leadName}},

Thank you for your interest in {{brandName}}! We're excited to help you find exactly what you're looking for.

Our team will review your inquiry and get back to you within 24 hours. In the meantime, feel free to browse our latest offerings.

Best regards,
{{brandName}} Team

P.S. Have questions? Reply to this email or call us directly!`
  },
  NEW_LEAD_WHATSAPP: {
    name: 'WhatsApp Welcome',
    content: `Hello {{leadName}}! 👋

Thank you for your interest in {{brandName}}. We received your inquiry and will get back to you shortly.

Is there anything specific you'd like to know about our products/services?`
  },
  HOT_LEAD_EMAIL: {
    name: 'Hot Lead Follow-up',
    subject: 'Special offer for {{leadName}} - Limited time!',
    content: `Hi {{leadName}},

We noticed you're highly interested in our offerings. As a valued prospect, we'd like to offer you a special {{discountPercent}}% discount!

This exclusive offer is valid for the next 48 hours only.

{{ctaButton}}

Best regards,
{{brandName}} Team`
  },
  COUPON_WHATSAPP: {
    name: 'Coupon Offer',
    content: `🎉 Special offer for {{leadName}}!

Get {{discountPercent}}% off your first order with code: {{couponCode}}

Valid until {{expiryDate}}. Don't miss out!

Shop now: {{shopUrl}}`
  }
};

function TemplatesClient({ ownerUid }: { ownerUid: string }) {
  const { language } = useLanguage();
  const router = useRouter();
  
  const [templates, setTemplates] = useState<AutoFollowupTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AutoFollowupTemplate | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    trigger: 'NEW_LEAD' as AutoFollowupTrigger,
    channel: 'EMAIL' as AutoFollowupChannel,
    subject: '',
    content: '',
    isActive: true,
    delayMinutes: 0,
    brandName: '',
  });

  useEffect(() => {
    if (ownerUid) {
      fetchTemplates();
    }
  }, [ownerUid]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/templates?ownerUid=${ownerUid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ownerUid }),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      setShowCreateModal(false);
      resetForm();
      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const response = await fetch(`/api/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ownerUid }),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm(language === 'he' ? 'האם למחוק את התבנית?' : 'Delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}?ownerUid=${ownerUid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const toggleTemplateActive = async (templateId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive, ownerUid }),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      trigger: 'NEW_LEAD',
      channel: 'EMAIL',
      subject: '',
      content: '',
      isActive: true,
      delayMinutes: 0,
      brandName: '',
    });
    setSelectedPreset('');
  };

  const loadPreset = (presetKey: string) => {
    const preset = DEFAULT_TEMPLATES[presetKey as keyof typeof DEFAULT_TEMPLATES];
    if (!preset) return;

    setFormData(prev => ({
      ...prev,
      name: preset.name,
      subject: 'subject' in preset ? preset.subject : '',
      content: preset.content,
    }));
  };

  const openEditModal = (template: AutoFollowupTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      trigger: template.trigger,
      channel: template.channel,
      subject: template.subject || '',
      content: template.content,
      isActive: template.isActive,
      delayMinutes: template.delayMinutes,
      brandName: template.brandName || '',
    });
    setShowCreateModal(true);
  };

  const formatDelay = (minutes: number) => {
    if (minutes === 0) return language === 'he' ? 'מיידי' : 'Immediate';
    if (minutes < 60) return `${minutes}${language === 'he' ? ' דק' : 'm'}`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}${language === 'he' ? ' שע' : 'h'}`;
    return `${Math.floor(minutes / 1440)}${language === 'he' ? ' ימים' : 'd'}`;
  };

  const getAvailableVariables = (channel: AutoFollowupChannel, trigger: AutoFollowupTrigger) => {
    const baseVars = ['{{leadName}}', '{{brandName}}', '{{leadEmail}}', '{{leadPhone}}'];
    const channelVars = channel === 'EMAIL' ? ['{{unsubscribeLink}}'] : [];
    const triggerVars = trigger === 'HOT_LEAD' ? ['{{discountPercent}}', '{{couponCode}}'] : [];
    
    return [...baseVars, ...channelVars, ...triggerVars];
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/e-commerce/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← {language === 'he' ? 'חזרה לדשבורד' : 'Back to Dashboard'}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'he' ? 'תבניות מעקב אוטומטי' : 'Auto-Followup Templates'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                {language === 'he' ? 'תבנית חדשה' : 'New Template'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              {language === 'he' ? 'סגור' : 'Dismiss'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {language === 'he' ? 'תבניות פעילות' : 'Active Templates'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'he' 
                  ? 'תבניות אלה ישלחו אוטומטית כאשר התנאים יתקיימו'
                  : 'These templates will be sent automatically when conditions are met'
                }
              </p>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'he' ? 'אין תבניות עדיין' : 'No templates yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'he' 
                    ? 'צור תבנית ראשונה לשליחת מעקבים אוטומטיים ללידים'
                    : 'Create your first template to send automatic follow-ups to leads'
                  }
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {language === 'he' ? 'צור תבנית ראשונה' : 'Create First Template'}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'תבנית' : 'Template'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'טריגר' : 'Trigger'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'ערוץ' : 'Channel'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'עיכוב' : 'Delay'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'שימושים' : 'Usage'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'סטטוס' : 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'פעולות' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {templates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                            {template.subject && (
                              <div className="text-sm text-gray-500">{template.subject}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {TRIGGER_LABELS[template.trigger]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {CHANNEL_LABELS[template.channel]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDelay(template.delayMinutes)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template._count?.followups || 0} {language === 'he' ? 'שימושים' : 'times'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleTemplateActive(template.id, !template.isActive)}
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              template.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {template.isActive 
                              ? (language === 'he' ? 'פעיל' : 'Active')
                              : (language === 'he' ? 'לא פעיל' : 'Inactive')
                            }
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openEditModal(template)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {language === 'he' ? 'ערוך' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {language === 'he' ? 'מחק' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">
                {editingTemplate 
                  ? (language === 'he' ? 'ערוך תבנית' : 'Edit Template')
                  : (language === 'he' ? 'צור תבנית חדשה' : 'Create New Template')
                }
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                {/* Preset Templates */}
                {!editingTemplate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'he' ? 'תבנית מוכנה' : 'Quick Start Template'}
                    </label>
                    <select
                      value={selectedPreset}
                      onChange={(e) => {
                        setSelectedPreset(e.target.value);
                        if (e.target.value) {
                          loadPreset(e.target.value);
                        }
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">{language === 'he' ? 'בחר תבנית מוכנה' : 'Choose a preset template'}</option>
                      <option value="NEW_LEAD_EMAIL">Welcome Email (New Lead)</option>
                      <option value="NEW_LEAD_WHATSAPP">Welcome WhatsApp (New Lead)</option>
                      <option value="HOT_LEAD_EMAIL">Hot Lead Follow-up</option>
                      <option value="COUPON_WHATSAPP">Coupon Offer (WhatsApp)</option>
                    </select>
                  </div>
                )}

                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'he' ? 'שם התבנית' : 'Template Name'} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'he' ? 'למשל: ברוכים הבאים' : 'e.g., Welcome Email'}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Trigger */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'he' ? 'טריגר' : 'Trigger'} *
                  </label>
                  <select
                    value={formData.trigger}
                    onChange={(e) => setFormData({ ...formData, trigger: e.target.value as AutoFollowupTrigger })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {Object.entries(TRIGGER_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Channel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'he' ? 'ערוץ שליחה' : 'Channel'} *
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as AutoFollowupChannel })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {Object.entries(CHANNEL_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Subject (for Email) */}
                {formData.channel === 'EMAIL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'he' ? 'נושא' : 'Subject'} *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={language === 'he' ? 'נושא האימייל' : 'Email subject line'}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                {/* Delay */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'he' ? 'עיכוב (דקות)' : 'Delay (minutes)'}
                  </label>
                  <input
                    type="number"
                    value={formData.delayMinutes}
                    onChange={(e) => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'he' 
                      ? '0 = מיידי, 60 = שעה אחת, 1440 = יום אחד' 
                      : '0 = immediate, 60 = 1 hour, 1440 = 1 day'
                    }
                  </p>
                </div>

                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'he' ? 'שם המותג' : 'Brand Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder={language === 'he' ? 'שם החברה/המותג' : 'Your company/brand name'}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    {language === 'he' ? 'תבנית פעילה' : 'Active template'}
                  </label>
                </div>
              </div>

              {/* Content and Preview */}
              <div className="space-y-4">
                {/* Message Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'he' ? 'תוכן ההודעה' : 'Message Content'} *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder={language === 'he' ? 'הכנס את תוכן ההודעה...' : 'Enter your message content...'}
                    rows={10}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Available Variables */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'he' ? 'משתנים זמינים' : 'Available Variables'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableVariables(formData.channel, formData.trigger).map(variable => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const newContent = 
                              formData.content.slice(0, start) + 
                              variable + 
                              formData.content.slice(end);
                            setFormData({ ...formData, content: newContent });
                          }
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'he' ? 'תצוגה מקדימה' : 'Preview'}
                  </label>
                  <div className="border rounded-md p-3 bg-gray-50">
                    {formData.channel === 'EMAIL' && formData.subject && (
                      <div className="font-semibold text-sm text-gray-900 mb-2">
                        Subject: {formData.subject}
                      </div>
                    )}
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {formData.content || (language === 'he' ? 'הכנס תוכן לתצוגה מקדימה' : 'Enter content to preview')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {language === 'he' ? 'ביטול' : 'Cancel'}
              </button>
              <button
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                disabled={!formData.name || !formData.content || (formData.channel === 'EMAIL' && !formData.subject)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {editingTemplate 
                  ? (language === 'he' ? 'עדכן תבנית' : 'Update Template')
                  : (language === 'he' ? 'צור תבנית' : 'Create Template')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage({ ownerUid }: { ownerUid: string }) {
  return (
    <LanguageProvider>
      <TemplatesClient ownerUid={ownerUid} />
    </LanguageProvider>
  );
}