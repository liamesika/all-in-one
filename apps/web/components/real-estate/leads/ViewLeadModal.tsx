'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MessageSquare, Calendar, Tag, Link as LinkIcon, FileText, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { auth } from '@/lib/firebase';

interface Lead {
  id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  message?: string;
  source?: string;
  qualificationStatus?: string;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  propertyId?: string | null;
  property?: {
    id: string;
    name: string;
    address?: string;
    city?: string;
  } | null;
}

interface LeadEvent {
  id: string;
  type: string;
  payload?: any;
  createdAt: string;
}

interface ViewLeadModalProps {
  isOpen: boolean;
  leadId: string;
  onClose: () => void;
}

export function ViewLeadModal({ isOpen, leadId, onClose }: ViewLeadModalProps) {
  const { language } = useLanguage();
  const [lead, setLead] = useState<Lead | null>(null);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    title: language === 'he' ? 'פרטי ליד' : 'Lead Details',
    personalInfo: language === 'he' ? 'מידע אישי' : 'Personal Information',
    name: language === 'he' ? 'שם' : 'Name',
    phone: language === 'he' ? 'טלפון' : 'Phone',
    email: language === 'he' ? 'אימייל' : 'Email',
    message: language === 'he' ? 'הודעה' : 'Message',
    source: language === 'he' ? 'מקור' : 'Source',
    status: language === 'he' ? 'סטטוס' : 'Status',
    assignedTo: language === 'he' ? 'מוקצה ל' : 'Assigned To',
    linkedProperty: language === 'he' ? 'נכס מקושר' : 'Linked Property',
    createdAt: language === 'he' ? 'נוצר ב' : 'Created',
    updatedAt: language === 'he' ? 'עודכן ב' : 'Updated',
    timeline: language === 'he' ? 'היסטוריה' : 'Timeline',
    notes: language === 'he' ? 'הערות' : 'Notes',
    noProperty: language === 'he' ? 'אין נכס מקושר' : 'No linked property',
    noAgent: language === 'he' ? 'לא מוקצה' : 'Not assigned',
    noNotes: language === 'he' ? 'אין הערות' : 'No notes',
    loading: language === 'he' ? 'טוען...' : 'Loading...',
    close: language === 'he' ? 'סגור' : 'Close',
    authError: language === 'he' ? 'נדרשת אימות. אנא התחבר מחדש.' : 'Authentication required. Please sign in again.',
  };

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadDetails();
    }
  }, [isOpen, leadId]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error(t.authError);
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();

      // Fetch lead details
      const leadResponse = await fetch(`/api/real-estate/leads/${leadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!leadResponse.ok) throw new Error('Failed to fetch lead');
      const leadData = await leadResponse.json();
      setLead(leadData);

      // Fetch lead events/timeline
      const eventsResponse = await fetch(`/api/real-estate/leads/${leadId}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status?: string) => {
    const statusLabels: Record<string, string> = {
      NEW: language === 'he' ? 'חדש' : 'New',
      CONTACTED: language === 'he' ? 'יצירת קשר' : 'Contacted',
      IN_PROGRESS: language === 'he' ? 'בתהליך' : 'In Progress',
      MEETING: language === 'he' ? 'פגישה' : 'Meeting',
      OFFER: language === 'he' ? 'הצעה' : 'Offer',
      DEAL: language === 'he' ? 'עסקה' : 'Deal',
      CONVERTED: language === 'he' ? 'הומר' : 'Converted',
      DISQUALIFIED: language === 'he' ? 'לא רלוונטי' : 'Disqualified',
    };
    return statusLabels[status || 'NEW'] || status || 'NEW';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      CREATED: language === 'he' ? 'ליד נוצר' : 'Lead created',
      CONTACTED: language === 'he' ? 'ליד יצור קשר' : 'Contacted',
      QUALIFIED: language === 'he' ? 'ליד סווג' : 'Qualified',
      PROPERTY_LINKED: language === 'he' ? 'נכס קושר' : 'Property linked',
      STATUS_CHANGED: language === 'he' ? 'סטטוס השתנה' : 'Status changed',
      NOTE_ADDED: language === 'he' ? 'הערה נוספה' : 'Note added',
    };
    return labels[type] || type;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-lead-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: '#FFFFFF' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <h2 id="view-lead-title" className="text-2xl font-bold" style={{ color: '#111827' }}>
            {t.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] rounded-lg transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            aria-label={t.close}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2979FF' }} />
              <span className="ml-3" style={{ color: '#6B7280' }}>{t.loading}</span>
            </div>
          ) : lead ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="rounded-xl p-6" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
                  <User className="w-5 h-5" style={{ color: '#2979FF' }} />
                  {t.personalInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>
                      {t.name}
                    </label>
                    <div className="flex items-center gap-2 text-base" style={{ color: '#111827' }}>
                      <User className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                      {lead.fullName || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>
                      {t.phone}
                    </label>
                    <div className="flex items-center gap-2 text-base" style={{ color: '#111827' }} dir="ltr">
                      <Phone className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                      <a href={`tel:${lead.phone}`} className="hover:underline" style={{ color: '#2979FF' }}>
                        {lead.phone || '-'}
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>
                      {t.email}
                    </label>
                    <div className="flex items-center gap-2 text-base" style={{ color: '#111827' }}>
                      <Mail className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                      <a href={`mailto:${lead.email}`} className="hover:underline" style={{ color: '#2979FF' }}>
                        {lead.email || '-'}
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>
                      {t.source}
                    </label>
                    <div className="flex items-center gap-2 text-base" style={{ color: '#111827' }}>
                      <Tag className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                      {lead.source || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>
                      {t.status}
                    </label>
                    <div className="flex items-center gap-2 text-base" style={{ color: '#111827' }}>
                      <Tag className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                      {getStatusLabel(lead.qualificationStatus)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>
                      {t.assignedTo}
                    </label>
                    <div className="flex items-center gap-2 text-base" style={{ color: '#111827' }}>
                      <User className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                      {lead.assignedTo?.fullName || t.noAgent}
                    </div>
                  </div>
                </div>

                {lead.message && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>
                      {t.message}
                    </label>
                    <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                      <MessageSquare className="w-4 h-4 mt-1" style={{ color: '#9CA3AF' }} />
                      <p className="text-sm" style={{ color: '#111827' }}>{lead.message}</p>
                    </div>
                  </div>
                )}

                {lead.notes && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>
                      {t.notes}
                    </label>
                    <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                      <FileText className="w-4 h-4 mt-1" style={{ color: '#9CA3AF' }} />
                      <p className="text-sm" style={{ color: '#111827' }}>{lead.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Property */}
              <div className="rounded-xl p-6" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
                  <LinkIcon className="w-5 h-5" style={{ color: '#2979FF' }} />
                  {t.linkedProperty}
                </h3>
                {lead.property ? (
                  <div className="p-4 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                    <h4 className="font-medium mb-1" style={{ color: '#111827' }}>{lead.property.name}</h4>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      {lead.property.address && `${lead.property.address}, `}
                      {lead.property.city}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>{t.noProperty}</p>
                )}
              </div>

              {/* Timeline */}
              <div className="rounded-xl p-6" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
                  <Clock className="w-5 h-5" style={{ color: '#2979FF' }} />
                  {t.timeline}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#10B981' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#111827' }}>{t.createdAt}</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>{formatDate(lead.createdAt)}</p>
                    </div>
                  </div>
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#2979FF' }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: '#111827' }}>{getEventLabel(event.type)}</p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>{formatDate(event.createdAt)}</p>
                        {event.payload && (
                          <pre className="text-xs mt-1 p-2 rounded" style={{ background: '#F3F4F6', color: '#4B5563' }}>
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#6B7280' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#111827' }}>{t.updatedAt}</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>{formatDate(lead.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: '#6B7280' }}>Lead not found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 min-h-[44px] rounded-lg font-medium transition-colors"
            style={{ background: '#F3F4F6', color: '#374151' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
