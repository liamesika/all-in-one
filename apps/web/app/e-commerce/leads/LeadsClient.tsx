'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';
import NewLeadModal from '@/components/modals/NewLeadModal';

// Lead types based on our new schema
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
  duplicateOf?: Lead;
  duplicates?: Lead[];
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
  };
};

type LeadFilters = {
  source?: LeadSource;
  status?: LeadStage;
  score?: LeadScore;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  isDuplicate?: boolean;
  campaignId?: string;
  hasFirstContact?: boolean;
  platform?: string;
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

const SOURCE_LABELS = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram', 
  WHATSAPP: 'WhatsApp',
  CSV_UPLOAD: 'CSV Import',
  GOOGLE_SHEETS: 'Google Sheets',
  MANUAL: 'Manual',
  OTHER: 'Other',
};

interface LeadsClientProps {
  ownerUid: string;
  isAuthLoading?: boolean;
  user?: any;
}

function LeadsClient({ ownerUid, isAuthLoading = false, user }: LeadsClientProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prevent hydration issues with modal
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  // Check for new=1 parameter after mounting
  useEffect(() => {
    setMounted(true);
    if (searchParams?.get('new') === '1') {
      setShowNewLeadModal(true);
    }
  }, [searchParams]);

  const fetchLeads = async (page = 1) => {
    if (!ownerUid) {
      console.warn('Cannot fetch leads: ownerUid is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        ownerUid,
        page: page.toString(),
        limit: '50',
      });

      // Add filters to params
      if (filters.source) params.set('source', filters.source);
      if (filters.status) params.set('status', filters.status);
      if (filters.score) params.set('score', filters.score);
      if (filters.search) params.set('search', filters.search);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.isDuplicate !== undefined) params.set('isDuplicate', filters.isDuplicate.toString());
      if (filters.campaignId) params.set('campaignId', filters.campaignId);
      if (filters.hasFirstContact !== undefined) params.set('hasFirstContact', filters.hasFirstContact.toString());
      if (filters.platform) params.set('platform', filters.platform);

      const response = await fetch(`/api/leads?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: LeadStage) => {
    if (!ownerUid) {
      console.warn('Cannot update lead status: ownerUid is required');
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ownerUid }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      // Refresh leads after update
      fetchLeads(currentPage);
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const recordFirstContact = async (leadId: string) => {
    if (!ownerUid) {
      console.warn('Cannot record first contact: ownerUid is required');
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}/first-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid }),
      });

      if (!response.ok) {
        throw new Error('Failed to record first contact');
      }

      // Refresh leads after update
      fetchLeads(currentPage);
    } catch (err) {
      console.error('Error recording first contact:', err);
    }
  };

  useEffect(() => {
    if (ownerUid) {
      fetchLeads(1);
    }
  }, [ownerUid, filters.source, filters.status, filters.score, filters.search, filters.dateFrom, filters.dateTo, filters.isDuplicate, filters.campaignId, filters.hasFirstContact, filters.platform]);

  // Handle deep-link for new lead modal with robust detection
  useEffect(() => {
    console.log('[DEBUG] LeadsClient useEffect triggered, searchParams:', searchParams?.toString());

    const checkForNewParam = () => {
      // Check searchParams first
      const isNewParam = searchParams?.get('new');
      console.log('[DEBUG] LeadsClient checking new param:', isNewParam, 'current showNewLeadModal:', showNewLeadModal);
      if (isNewParam === '1') {
        console.log('[DEBUG] LeadsClient setting modal to true');
        setShowNewLeadModal(true);
        return;
      }

      // Fallback: check window.location.search directly
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const newParam = urlParams.get('new');
        console.log('[DEBUG] LeadsClient fallback check:', newParam);
        if (newParam === '1') {
          console.log('[DEBUG] LeadsClient setting modal to true via fallback');
          setShowNewLeadModal(true);
        }
      }
    };

    // Check immediately
    checkForNewParam();

    // Also check after a short delay to handle navigation timing
    const timer = setTimeout(checkForNewParam, 200);

    return () => clearTimeout(timer);
  }, [searchParams, showNewLeadModal]);

  const handleOpenNewLeadModal = () => {
    setShowNewLeadModal(true);
    // Update URL to include ?new=1 for deep-linking
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('new', '1');
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  const handleCloseNewLeadModal = () => {
    setShowNewLeadModal(false);
    // Remove ?new=1 from URL
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('new');
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  const handleNewLeadSuccess = () => {
    // Refresh leads list to show the new lead
    fetchLeads(currentPage);
  };

  const filteredAndSortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      // Sort by score (HOT first), then by date
      const scoreOrder = { HOT: 3, WARM: 2, COLD: 1 };
      const scoreA = scoreOrder[a.score];
      const scoreB = scoreOrder[b.score];
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [leads]);

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
    return `https://wa.me/${formatted}`;
  };


  const isPageDisabled = isAuthLoading || !ownerUid;

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'he' ? 'לידים' : 'Leads'}
              </h1>
              {!isPageDisabled && (
                <span className="text-sm text-gray-500">
                  {leads.length} {language === 'he' ? 'לידים' : 'leads'}
                </span>
              )}
              {/* Loading indicator in header */}
              {isAuthLoading && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                  <span className="text-sm font-medium">Loading...</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <LanguageToggle />
              
              {/* View Mode Toggle */}
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-sm rounded-l-md border ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {language === 'he' ? 'טבלה' : 'Table'}
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 text-sm rounded-r-md border-t border-r border-b ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {language === 'he' ? 'כרטיסיות' : 'Cards'}
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                {language === 'he' ? 'סינון' : 'Filters'}
              </button>
              
              {/* Add Lead Button */}
              <button
                onClick={handleOpenNewLeadModal}
                disabled={isPageDisabled}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-opacity"
              >
                {language === 'he' ? 'הוסף ליד' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'מקור' : 'Source'}
                </label>
                <select
                  value={filters.source || ''}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value as LeadSource || undefined })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">{language === 'he' ? 'כל המקורות' : 'All Sources'}</option>
                  {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Score Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'ציון' : 'Score'}
                </label>
                <select
                  value={filters.score || ''}
                  onChange={(e) => setFilters({ ...filters, score: e.target.value as LeadScore || undefined })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">{language === 'he' ? 'כל הציונים' : 'All Scores'}</option>
                  <option value="HOT">{language === 'he' ? 'חם' : 'Hot'}</option>
                  <option value="WARM">{language === 'he' ? 'פושר' : 'Warm'}</option>
                  <option value="COLD">{language === 'he' ? 'קר' : 'Cold'}</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'סטטוס' : 'Status'}
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as LeadStage || undefined })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
                  <option value="NEW">{language === 'he' ? 'חדש' : 'New'}</option>
                  <option value="CONTACTED">{language === 'he' ? 'צור קשר' : 'Contacted'}</option>
                  <option value="QUALIFIED">{language === 'he' ? 'מוסמך' : 'Qualified'}</option>
                  <option value="MEETING">{language === 'he' ? 'פגישה' : 'Meeting'}</option>
                  <option value="OFFER">{language === 'he' ? 'הצעה' : 'Offer'}</option>
                  <option value="WON">{language === 'he' ? 'נמכר' : 'Won'}</option>
                  <option value="LOST">{language === 'he' ? 'אבד' : 'Lost'}</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'חיפוש' : 'Search'}
                </label>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                  placeholder={language === 'he' ? 'שם, אימייל, טלפון...' : 'Name, email, phone...'}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'פלטפורמה' : 'Platform'}
                </label>
                <select
                  value={filters.platform || ''}
                  onChange={(e) => setFilters({ ...filters, platform: e.target.value || undefined })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">{language === 'he' ? 'כל הפלטפורמות' : 'All Platforms'}</option>
                  <option value="META">Meta (Facebook/Instagram)</option>
                  <option value="GOOGLE">Google</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="LINKEDIN">LinkedIn</option>
                </select>
              </div>

              {/* First Contact Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'קשר ראשון' : 'First Contact'}
                </label>
                <select
                  value={filters.hasFirstContact === undefined ? '' : filters.hasFirstContact ? 'true' : 'false'}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    hasFirstContact: e.target.value === '' ? undefined : e.target.value === 'true' 
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">{language === 'he' ? 'הכל' : 'All'}</option>
                  <option value="true">{language === 'he' ? 'יש קשר ראשון' : 'Has First Contact'}</option>
                  <option value="false">{language === 'he' ? 'אין קשר ראשון' : 'No First Contact'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchLeads(currentPage)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {language === 'he' ? 'נסה שוב' : 'Try Again'}
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{language === 'he' ? 'לא נמצאו לידים' : 'No leads found'}</p>
            <button
              onClick={() => router.push('/e-commerce/leads/intake')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {language === 'he' ? 'יבא לידים' : 'Import Leads'}
            </button>
          </div>
        ) : (
          <>
            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'ליד' : 'Lead'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'ציון' : 'Score'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'סטטוס' : 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'מקור' : 'Source'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'קמפיין' : 'Campaign'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'תאריך' : 'Date'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'he' ? 'פעולות' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown'}
                                </div>
                                {lead.isDuplicate && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {language === 'he' ? 'כפול' : 'Duplicate'}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 space-y-1">
                                {lead.email && (
                                  <div className="flex items-center space-x-1">
                                    <span>{lead.email}</span>
                                    <span className={`w-2 h-2 rounded-full ${
                                      lead.emailValid === 'VALID' ? 'bg-green-400' :
                                      lead.emailValid === 'INVALID' ? 'bg-red-400' : 'bg-gray-400'
                                    }`}></span>
                                  </div>
                                )}
                                {lead.phone && (
                                  <div className="flex items-center space-x-2">
                                    <span>{formatPhone(lead.phone)}</span>
                                    <span className={`w-2 h-2 rounded-full ${
                                      lead.phoneValid === 'VALID' ? 'bg-green-400' :
                                      lead.phoneValid === 'INVALID' ? 'bg-red-400' : 'bg-gray-400'
                                    }`}></span>
                                    {lead.phone && (
                                      <a 
                                        href={getWhatsAppLink(lead.phone) || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800 text-xs"
                                      >
                                        WA
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${SCORE_COLORS[lead.score]}`}>
                            {language === 'he' ? 
                              (lead.score === 'HOT' ? 'חם' : lead.score === 'WARM' ? 'פושר' : 'קר') :
                              lead.score
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStage)}
                            className={`text-xs rounded px-2 py-1 border-0 font-medium ${STATUS_COLORS[lead.status]}`}
                          >
                            <option value="NEW">{language === 'he' ? 'חדש' : 'New'}</option>
                            <option value="CONTACTED">{language === 'he' ? 'צור קשר' : 'Contacted'}</option>
                            <option value="QUALIFIED">{language === 'he' ? 'מוסמך' : 'Qualified'}</option>
                            <option value="MEETING">{language === 'he' ? 'פגישה' : 'Meeting'}</option>
                            <option value="OFFER">{language === 'he' ? 'הצעה' : 'Offer'}</option>
                            <option value="WON">{language === 'he' ? 'נמכר' : 'Won'}</option>
                            <option value="LOST">{language === 'he' ? 'אבד' : 'Lost'}</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {SOURCE_LABELS[lead.source]}
                            {lead.sourceName && (
                              <div className="text-xs text-gray-400">{lead.sourceName}</div>
                            )}
                            {(lead.utmSource || lead.utmCampaign) && (
                              <div className="text-xs text-blue-600 mt-1">
                                {lead.utmSource && `UTM: ${lead.utmSource}`}
                                {lead.utmCampaign && ` | ${lead.utmCampaign}`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {lead.campaign ? (
                              <div>
                                <div className="font-medium text-gray-900">{lead.campaign.name}</div>
                                <div className="text-xs text-gray-400 flex items-center space-x-1">
                                  <span>{lead.campaign.platform}</span>
                                  <span className={`w-2 h-2 rounded-full ${
                                    lead.campaign.status === 'ACTIVE' ? 'bg-green-400' :
                                    lead.campaign.status === 'PAUSED' ? 'bg-yellow-400' :
                                    lead.campaign.status === 'DRAFT' ? 'bg-gray-400' :
                                    'bg-red-400'
                                  }`}></span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                            {lead.platformAdSetId && (
                              <div className="text-xs text-gray-400 mt-1">AdSet: {lead.platformAdSetId}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {formatDate(lead.createdAt)}
                            {lead.firstContactAt && (
                              <div className="text-xs text-green-600">
                                {language === 'he' ? 'קשר ראשון:' : 'First contact:'} {formatDate(lead.firstContactAt)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => router.push(`/e-commerce/leads/${lead.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {language === 'he' ? 'צפה' : 'View'}
                          </button>
                          {lead.status === 'NEW' && !lead.firstContactAt && (
                            <button
                              onClick={() => recordFirstContact(lead.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              {language === 'he' ? 'קשר ראשון' : 'First Contact'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {language === 'he' ? 'עמוד' : 'Page'} {currentPage} {language === 'he' ? 'מתוך' : 'of'} {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchLeads(currentPage - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {language === 'he' ? 'קודם' : 'Previous'}
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchLeads(currentPage + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {language === 'he' ? 'הבא' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Lead Form - Inline with opacity background */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40">
          <div className="min-h-screen p-4 overflow-y-auto">
            <NewLeadModal
              isOpen={showNewLeadModal}
              onClose={handleCloseNewLeadModal}
              onSuccess={handleNewLeadSuccess}
              ownerUid={ownerUid || 'test-owner'}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface LeadsPageProps {
  ownerUid: string;
  isAuthLoading?: boolean;
  user?: any;
}

export default function LeadsPage({ ownerUid, isAuthLoading = false, user }: LeadsPageProps) {
  console.log('[DEBUG] LeadsPage wrapper rendering with ownerUid:', ownerUid);
  return <LeadsClient ownerUid={ownerUid} isAuthLoading={isAuthLoading} user={user} />;
}