'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';

type LeadScore = 'HOT' | 'WARM' | 'COLD';
type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'MEETING' | 'OFFER' | 'DEAL' | 'WON' | 'LOST';
type LeadSource = 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP' | 'CSV_UPLOAD' | 'GOOGLE_SHEETS' | 'MANUAL' | 'OTHER';

type Lead = {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  source: LeadSource;
  sourceName?: string;
  status: LeadStage;
  score: LeadScore;
  budget?: number;
  interests?: any[];
  notes?: string;
  phoneValid: 'VALID' | 'INVALID' | 'PENDING';
  emailValid: 'VALID' | 'INVALID' | 'PENDING';
  isDuplicate: boolean;
  duplicateOfId?: string;
  firstContactAt?: string;
  lastContactAt?: string;
  createdAt: string;
  updatedAt: string;
  // Campaign attribution
  campaignId?: string;
  platformAdSetId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  campaign?: {
    id: string;
    name: string;
    platform: string;
    status: string;
    spend: number;
    clicks: number;
    impressions: number;
  };
  // Relations
  events?: LeadEvent[];
  activities?: LeadActivity[];
  followups?: AutoFollowup[];
  sales?: Sale[];
};

type LeadEvent = {
  id: string;
  type: string;
  data?: any;
  userId?: string;
  createdAt: string;
};

type LeadActivity = {
  id: string;
  type: string;
  description: string;
  userId?: string;
  createdAt: string;
};

type AutoFollowup = {
  id: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS';
  status: string;
  subject?: string;
  content: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  clickedAt?: string;
  error?: string;
  template: {
    name: string;
    trigger: string;
  };
  createdAt: string;
};

type Sale = {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  saleDate: string;
  enteredBy?: string;
};

const SCORE_COLORS = {
  HOT: 'bg-red-100 text-red-800',
  WARM: 'bg-orange-100 text-orange-800',
  COLD: 'bg-blue-100 text-blue-800',
};

const STATUS_COLORS = {
  NEW: 'bg-gray-100 text-gray-800',
  CONTACTED: 'bg-blue-100 text-blue-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  MEETING: 'bg-purple-100 text-purple-800',
  OFFER: 'bg-yellow-100 text-yellow-800',
  DEAL: 'bg-indigo-100 text-indigo-800',
  WON: 'bg-green-500 text-white',
  LOST: 'bg-red-100 text-red-800',
};

function LeadDetailClient({ ownerUid, leadId }: { ownerUid: string; leadId: string }) {
  const { language } = useLanguage();
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'followups' | 'sales'>('details');
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (ownerUid && leadId) {
      fetchLead();
    }
  }, [ownerUid, leadId]);

  const fetchLead = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/leads/${leadId}?ownerUid=${ownerUid}&include=all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lead details');
      }

      const leadData = await response.json();
      setLead(leadData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (status: LeadStage) => {
    if (!lead) return;
    
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ownerUid }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      // Refresh lead data
      fetchLead();
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const recordFirstContact = async () => {
    if (!lead) return;
    
    try {
      const response = await fetch(`/api/leads/${leadId}/first-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid }),
      });

      if (!response.ok) {
        throw new Error('Failed to record first contact');
      }

      // Refresh lead data
      fetchLead();
    } catch (err) {
      console.error('Error recording first contact:', err);
    }
  };

  const addNote = async () => {
    if (!lead || !newNote.trim()) return;
    
    setSavingNote(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ownerUid,
          type: 'note',
          description: newNote.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      setNewNote('');
      // Refresh lead data
      fetchLead();
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    if (phone.startsWith('+')) return phone;
    if (phone.startsWith('0')) return `+972${phone.substring(1)}`;
    return phone;
  };

  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return null;
    const formatted = formatPhone(phone).replace(/\D/g, '');
    const message = `Hello${lead?.fullName ? ` ${lead.fullName}` : ''}! I'm reaching out regarding your inquiry.`;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
  };

  const renderTimeline = () => {
    const allEvents: any[] = [];
    
    // Add lead events
    if (lead?.events) {
      allEvents.push(...lead.events.map(event => ({ ...event, source: 'event' })));
    }
    
    // Add activities
    if (lead?.activities) {
      allEvents.push(...lead.activities.map(activity => ({ ...activity, source: 'activity' })));
    }
    
    // Add followups
    if (lead?.followups) {
      allEvents.push(...lead.followups.map(followup => ({ ...followup, source: 'followup' })));
    }
    
    // Sort by creation date
    allEvents.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return (
      <div className="space-y-4">
        {allEvents.map((item, index) => (
          <div key={`${item.source}-${item.id}`} className="flex space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              item.source === 'event' ? 'bg-blue-100 text-blue-600' :
              item.source === 'activity' ? 'bg-green-100 text-green-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              {item.source === 'event' && '📊'}
              {item.source === 'activity' && '📝'}
              {item.source === 'followup' && '📤'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {item.source === 'event' && `Event: ${item.type}`}
                  {item.source === 'activity' && item.description}
                  {item.source === 'followup' && `Auto-followup sent via ${item.channel}`}
                </p>
                <time className="text-xs text-gray-500">{formatDate(item.createdAt)}</time>
              </div>
              
              {item.source === 'event' && item.data && (
                <div className="mt-1 text-sm text-gray-600">
                  <pre className="bg-gray-50 rounded p-2 text-xs overflow-x-auto">
                    {JSON.stringify(item.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {item.source === 'followup' && (
                <div className="mt-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'SENT' ? 'bg-green-100 text-green-800' :
                      item.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                    {item.template && (
                      <span className="text-xs text-gray-500">
                        Template: {item.template.name} ({item.template.trigger})
                      </span>
                    )}
                  </div>
                  {item.subject && (
                    <p className="mt-1 font-medium">{item.subject}</p>
                  )}
                  <p className="mt-1">{item.content}</p>
                  {item.error && (
                    <p className="mt-1 text-red-600">Error: {item.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {allEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {language === 'he' ? 'אין אירועים עדיין' : 'No timeline events yet'}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'he' ? 'ליד לא נמצא' : 'Lead Not Found'}
          </h1>
          <p className="text-gray-600 mt-2">{error || 'Lead details could not be loaded'}</p>
          <button
            onClick={() => router.push('/e-commerce/leads')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {language === 'he' ? 'חזרה ללידים' : 'Back to Leads'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/e-commerce/leads')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← {language === 'he' ? 'חזרה ללידים' : 'Back to Leads'}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Lead Details'}
              </h1>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${SCORE_COLORS[lead.score]}`}>
                {language === 'he' ? 
                  (lead.score === 'HOT' ? 'חם' : lead.score === 'WARM' ? 'פושר' : 'קר') :
                  lead.score
                }
              </span>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: language === 'he' ? 'פרטים' : 'Details' },
              { id: 'timeline', label: language === 'he' ? 'ציר זמן' : 'Timeline' },
              { id: 'followups', label: language === 'he' ? 'מעקבים' : 'Followups' },
              { id: 'sales', label: language === 'he' ? 'מכירות' : 'Sales' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'he' ? 'פרטי הליד' : 'Lead Information'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'he' ? 'שם מלא' : 'Full Name'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || '—'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'he' ? 'אימייל' : 'Email'}
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{lead.email || '—'}</span>
                      {lead.email && (
                        <span className={`w-2 h-2 rounded-full ${
                          lead.emailValid === 'VALID' ? 'bg-green-400' :
                          lead.emailValid === 'INVALID' ? 'bg-red-400' : 'bg-gray-400'
                        }`}></span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'he' ? 'טלפון' : 'Phone'}
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{formatPhone(lead.phone)}</span>
                      {lead.phone && (
                        <span className={`w-2 h-2 rounded-full ${
                          lead.phoneValid === 'VALID' ? 'bg-green-400' :
                          lead.phoneValid === 'INVALID' ? 'bg-red-400' : 'bg-gray-400'
                        }`}></span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'he' ? 'עיר' : 'City'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{lead.city || '—'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'he' ? 'תקציב' : 'Budget'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {lead.budget ? `$${lead.budget}` : '—'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'he' ? 'מקור' : 'Source'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{lead.source}</p>
                    {lead.sourceName && (
                      <p className="text-xs text-gray-500">{lead.sourceName}</p>
                    )}
                  </div>
                </div>
                
                {/* UTM Information */}
                {(lead.utmSource || lead.utmCampaign || lead.utmMedium) && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      {language === 'he' ? 'מידע UTM' : 'UTM Information'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {lead.utmSource && (
                        <div>
                          <span className="font-medium text-gray-700">Source:</span>
                          <span className="ml-1 text-gray-900">{lead.utmSource}</span>
                        </div>
                      )}
                      {lead.utmMedium && (
                        <div>
                          <span className="font-medium text-gray-700">Medium:</span>
                          <span className="ml-1 text-gray-900">{lead.utmMedium}</span>
                        </div>
                      )}
                      {lead.utmCampaign && (
                        <div>
                          <span className="font-medium text-gray-700">Campaign:</span>
                          <span className="ml-1 text-gray-900">{lead.utmCampaign}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                {lead.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {language === 'he' ? 'הערות' : 'Notes'}
                    </h3>
                    <p className="text-sm text-gray-700">{lead.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Campaign Information */}
              {lead.campaign && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {language === 'he' ? 'מידע קמפיין' : 'Campaign Information'}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {language === 'he' ? 'שם קמפיין' : 'Campaign Name'}
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{lead.campaign.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {language === 'he' ? 'פלטפורמה' : 'Platform'}
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{lead.campaign.platform}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {language === 'he' ? 'סטטוס' : 'Status'}
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        lead.campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                        lead.campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lead.campaign.status}
                      </span>
                    </div>
                    
                    {lead.platformAdSetId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">AdSet ID</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{lead.platformAdSetId}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Campaign Performance */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      {language === 'he' ? 'ביצועי קמפיין' : 'Campaign Performance'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">${lead.campaign.spend}</div>
                        <div className="text-xs text-gray-500">{language === 'he' ? 'הוצאה' : 'Spend'}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{lead.campaign.clicks}</div>
                        <div className="text-xs text-gray-500">{language === 'he' ? 'לחיצות' : 'Clicks'}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{lead.campaign.impressions}</div>
                        <div className="text-xs text-gray-500">{language === 'he' ? 'חשיפות' : 'Impressions'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'he' ? 'פעולות' : 'Actions'}
                </h2>
                
                <div className="space-y-3">
                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'he' ? 'עדכון סטטוס' : 'Update Status'}
                    </label>
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(e.target.value as LeadStage)}
                      className={`w-full text-sm rounded px-2 py-1 border font-medium ${STATUS_COLORS[lead.status]}`}
                    >
                      <option value="NEW">{language === 'he' ? 'חדש' : 'New'}</option>
                      <option value="CONTACTED">{language === 'he' ? 'צור קשר' : 'Contacted'}</option>
                      <option value="QUALIFIED">{language === 'he' ? 'מוסמך' : 'Qualified'}</option>
                      <option value="MEETING">{language === 'he' ? 'פגישה' : 'Meeting'}</option>
                      <option value="OFFER">{language === 'he' ? 'הצעה' : 'Offer'}</option>
                      <option value="WON">{language === 'he' ? 'נמכר' : 'Won'}</option>
                      <option value="LOST">{language === 'he' ? 'אבד' : 'Lost'}</option>
                    </select>
                  </div>
                  
                  {/* First Contact */}
                  {lead.status === 'NEW' && !lead.firstContactAt && (
                    <button
                      onClick={recordFirstContact}
                      className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      {language === 'he' ? 'רשום קשר ראשון' : 'Record First Contact'}
                    </button>
                  )}
                  
                  {/* WhatsApp */}
                  {lead.phone && (
                    <a 
                      href={getWhatsAppLink(lead.phone) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 text-center block"
                    >
                      {language === 'he' ? 'פתח WhatsApp' : 'Open WhatsApp'}
                    </a>
                  )}
                  
                  {/* Email */}
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}?subject=Regarding your inquiry`}
                      className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 text-center block"
                    >
                      {language === 'he' ? 'שלח אימייל' : 'Send Email'}
                    </a>
                  )}
                </div>
              </div>
              
              {/* Lead Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'he' ? 'סטטיסטיקות' : 'Statistics'}
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'he' ? 'נוצר:' : 'Created:'}</span>
                    <span className="font-medium">{formatDate(lead.createdAt)}</span>
                  </div>
                  
                  {lead.firstContactAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'he' ? 'קשר ראשון:' : 'First Contact:'}</span>
                      <span className="font-medium">{formatDate(lead.firstContactAt)}</span>
                    </div>
                  )}
                  
                  {lead.lastContactAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'he' ? 'קשר אחרון:' : 'Last Contact:'}</span>
                      <span className="font-medium">{formatDate(lead.lastContactAt)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'he' ? 'מעקבים:' : 'Followups:'}</span>
                    <span className="font-medium">{lead.followups?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'he' ? 'מכירות:' : 'Sales:'}</span>
                    <span className="font-medium">{lead.sales?.length || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Add Note */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'he' ? 'הוסף הערה' : 'Add Note'}
                </h2>
                
                <div className="space-y-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={language === 'he' ? 'הכנס הערה...' : 'Enter note...'}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim() || savingNote}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {savingNote 
                      ? (language === 'he' ? 'שומר...' : 'Saving...') 
                      : (language === 'he' ? 'הוסף הערה' : 'Add Note')
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              {language === 'he' ? 'ציר זמן' : 'Lead Timeline'}
            </h2>
            {renderTimeline()}
          </div>
        )}
        
        {activeTab === 'followups' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              {language === 'he' ? 'מעקבים אוטומטיים' : 'Auto-Followups'}
            </h2>
            
            {lead.followups && lead.followups.length > 0 ? (
              <div className="space-y-4">
                {lead.followups.map((followup) => (
                  <div key={followup.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          followup.status === 'SENT' ? 'bg-green-100 text-green-800' :
                          followup.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {followup.status}
                        </span>
                        <span className="text-sm text-gray-600">{followup.channel}</span>
                      </div>
                      <time className="text-xs text-gray-500">{formatDate(followup.createdAt)}</time>
                    </div>
                    
                    {followup.subject && (
                      <h3 className="font-medium text-gray-900 mb-1">{followup.subject}</h3>
                    )}
                    
                    <p className="text-sm text-gray-700 mb-2">{followup.content}</p>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Template: {followup.template.name} ({followup.template.trigger})</div>
                      {followup.sentAt && <div>Sent: {formatDate(followup.sentAt)}</div>}
                      {followup.deliveredAt && <div>Delivered: {formatDate(followup.deliveredAt)}</div>}
                      {followup.readAt && <div>Read: {formatDate(followup.readAt)}</div>}
                      {followup.error && <div className="text-red-600">Error: {followup.error}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {language === 'he' ? 'אין מעקבים עדיין' : 'No auto-followups yet'}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'sales' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {language === 'he' ? 'מכירות' : 'Sales'}
              </h2>
              <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                {language === 'he' ? 'הוסף מכירה' : 'Add Sale'}
              </button>
            </div>
            
            {lead.sales && lead.sales.length > 0 ? (
              <div className="space-y-4">
                {lead.sales.map((sale) => (
                  <div key={sale.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-lg font-semibold text-green-600">
                        {sale.amount} {sale.currency}
                      </div>
                      <time className="text-sm text-gray-500">{formatDate(sale.saleDate)}</time>
                    </div>
                    
                    {sale.description && (
                      <p className="text-sm text-gray-700 mb-2">{sale.description}</p>
                    )}
                    
                    {sale.enteredBy && (
                      <div className="text-xs text-gray-500">
                        Entered by: {sale.enteredBy}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {language === 'he' ? 'אין מכירות עדיין' : 'No sales recorded yet'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadDetailPage({ ownerUid, leadId }: { ownerUid: string; leadId: string }) {
  return (
    <LanguageProvider>
      <LeadDetailClient ownerUid={ownerUid} leadId={leadId} />
    </LanguageProvider>
  );
}