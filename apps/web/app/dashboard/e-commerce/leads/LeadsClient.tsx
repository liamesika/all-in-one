'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';
import NewLeadModal from '@/components/modals/NewLeadModal';
import {
  TableSkeleton,
  ButtonLoading,
  DotsLoading,
  LoadingCard,
  Spinner
} from '@/components/ui/loading';

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
  // Enhanced loading states for different operations
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [recordingContactId, setRecordingContactId] = useState<string | null>(null);
  const [exportingData, setExportingData] = useState(false);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);

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

    setUpdatingLeadId(leadId);
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
      await fetchLeads(currentPage);
    } catch (err) {
      console.error('Error updating lead status:', err);
      setError('Failed to update lead status');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const recordFirstContact = async (leadId: string) => {
    if (!ownerUid) {
      console.warn('Cannot record first contact: ownerUid is required');
      return;
    }

    setRecordingContactId(leadId);
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
      await fetchLeads(currentPage);
    } catch (err) {
      console.error('Error recording first contact:', err);
      setError('Failed to record first contact');
    } finally {
      setRecordingContactId(null);
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;

    setBulkOperationLoading(true);
    try {
      // Implement bulk delete API call
      console.log('Bulk deleting leads:', Array.from(selectedLeads));
      // await bulkDeleteLeads(Array.from(selectedLeads));
      setSelectedLeads(new Set());
      await fetchLeads(currentPage);
    } catch (err) {
      console.error('Error bulk deleting leads:', err);
      setError('Failed to delete selected leads');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleExport = async () => {
    setExportingData(true);
    try {
      // Implement export functionality
      console.log('Exporting leads data...');
      // const exportData = await exportLeads(filters);
      // downloadFile(exportData, 'leads.csv');
    } catch (err) {
      console.error('Error exporting leads:', err);
      setError('Failed to export leads');
    } finally {
      setExportingData(false);
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

              {/* Filter Toggle with indicator */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center relative"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                {language === 'he' ? 'סינון' : 'Filters'}
                {Object.keys(filters).some(key => filters[key as keyof LeadFilters] !== undefined && filters[key as keyof LeadFilters] !== '') && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full animate-pulse" />
                )}
              </button>
              
              {/* Export Button */}
              <ButtonLoading
                onClick={handleExport}
                loading={exportingData}
                className="btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                {language === 'he' ? 'ייצא' : 'Export'}
              </ButtonLoading>

              {/* Add Lead Button */}
              <button
                onClick={handleOpenNewLeadModal}
                disabled={isPageDisabled}
                className="btn-primary hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {language === 'he' ? 'הוסף ליד' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {language === 'he' ? 'סינון לידים' : 'Filter Leads'}
              </h3>
              <button
                onClick={() => setFilters({})}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {language === 'he' ? 'איפוס' : 'Reset'}
              </button>
            </div>
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
          <div className="animate-fade-in">
            <TableSkeleton rows={8} cols={7} animate={true} />
          </div>
        ) : error ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="p-6 bg-red-50 rounded-lg inline-block">
              <div className="text-red-500 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <ButtonLoading
                onClick={() => fetchLeads(currentPage)}
                loading={loading}
                className="btn-primary"
              >
                {language === 'he' ? 'נסה שוב' : 'Try Again'}
              </ButtonLoading>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="p-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'he' ? 'אין לידים עדיין' : 'No leads yet'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {language === 'he'
                  ? 'התחל לאסוף לידים על ידי ייבוא מקבצי CSV או חיבור עם הפלטפורמות שלך'
                  : 'Start collecting leads by importing from CSV files or connecting your platforms'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/dashboard/e-commerce/leads/intake')}
                  className="btn-primary hover-lift"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {language === 'he' ? 'ייבא לידים' : 'Import Leads'}
                </button>
                <button
                  onClick={handleOpenNewLeadModal}
                  className="btn-secondary hover-lift"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {language === 'he' ? 'הוסף ליד ידנית' : 'Add Lead Manually'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Bulk Actions Bar */}
            {selectedLeads.size > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-900">
                      {language === 'he' ? `${selectedLeads.size} נבחרו` : `${selectedLeads.size} selected`}
                    </span>
                    <div className="flex space-x-2">
                      <ButtonLoading
                        onClick={handleBulkDelete}
                        loading={bulkOperationLoading}
                        className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {language === 'he' ? 'מחק' : 'Delete'}
                      </ButtonLoading>
                      <ButtonLoading
                        onClick={handleExport}
                        loading={exportingData}
                        className="btn-secondary"
                      >
                        {language === 'he' ? 'יצא' : 'Export'}
                      </ButtonLoading>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLeads(new Set())}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white shadow rounded-lg overflow-hidden animate-fade-in card-hover">
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
                    {filteredAndSortedLeads.map((lead, index) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
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
                          <div className="relative">
                            <select
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStage)}
                              disabled={updatingLeadId === lead.id}
                              className={`text-xs rounded px-2 py-1 border-0 font-medium transition-all duration-200 ${STATUS_COLORS[lead.status]} ${updatingLeadId === lead.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'}`}
                          >
                            <option value="NEW">{language === 'he' ? 'חדש' : 'New'}</option>
                            <option value="CONTACTED">{language === 'he' ? 'צור קשר' : 'Contacted'}</option>
                            <option value="QUALIFIED">{language === 'he' ? 'מוסמך' : 'Qualified'}</option>
                            <option value="MEETING">{language === 'he' ? 'פגישה' : 'Meeting'}</option>
                            <option value="OFFER">{language === 'he' ? 'הצעה' : 'Offer'}</option>
                            <option value="WON">{language === 'he' ? 'נמכר' : 'Won'}</option>
                            <option value="LOST">{language === 'he' ? 'אבד' : 'Lost'}</option>
                          </select>
                            {updatingLeadId === lead.id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Spinner size="sm" color="blue" />
                              </div>
                            )}
                          </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* Checkbox for bulk selection */}
                            <input
                              type="checkbox"
                              checked={selectedLeads.has(lead.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedLeads);
                                if (e.target.checked) {
                                  newSelected.add(lead.id);
                                } else {
                                  newSelected.delete(lead.id);
                                }
                                setSelectedLeads(newSelected);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                            />

                            {/* View Button */}
                            <button
                              onClick={() => router.push(`/dashboard/e-commerce/leads/${lead.id}`)}
                              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="sr-only">{language === 'he' ? 'צפה' : 'View'}</span>
                            </button>

                            {/* First Contact Button */}
                            {lead.status === 'NEW' && !lead.firstContactAt && (
                              <ButtonLoading
                                onClick={() => recordFirstContact(lead.id)}
                                loading={recordingContactId === lead.id}
                                className="text-green-600 hover:text-green-900 hover:bg-green-50 px-2 py-1 rounded text-xs"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="sr-only">{language === 'he' ? 'קשר ראשון' : 'First Contact'}</span>
                              </ButtonLoading>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between animate-fade-in">
                <div className="text-sm text-gray-700">
                  <span className="flex items-center space-x-2">
                    <span>{language === 'he' ? 'עמוד' : 'Page'} {currentPage} {language === 'he' ? 'מתוך' : 'of'} {totalPages}</span>
                    {loading && <DotsLoading className="ml-2" />}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* First page */}
                  <button
                    disabled={currentPage === 1 || loading}
                    onClick={() => fetchLeads(1)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200"
                  >
                    «
                  </button>

                  {/* Previous page */}
                  <ButtonLoading
                    onClick={() => fetchLeads(currentPage - 1)}
                    loading={loading}
                    disabled={currentPage === 1}
                    className="btn-secondary"
                  >
                    {language === 'he' ? 'קודם' : 'Previous'}
                  </ButtonLoading>

                  {/* Page numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchLeads(pageNum)}
                          disabled={loading}
                          className={`px-3 py-1 text-sm rounded transition-all duration-200 ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next page */}
                  <ButtonLoading
                    onClick={() => fetchLeads(currentPage + 1)}
                    loading={loading}
                    disabled={currentPage === totalPages}
                    className="btn-secondary"
                  >
                    {language === 'he' ? 'הבא' : 'Next'}
                  </ButtonLoading>

                  {/* Last page */}
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => fetchLeads(totalPages)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40 animate-fade-in">
          <div className="min-h-screen p-4 overflow-y-auto flex items-center justify-center">
            <div className="animate-scale-in">
              <NewLeadModal
                isOpen={showNewLeadModal}
                onClose={handleCloseNewLeadModal}
                onSuccess={handleNewLeadSuccess}
                ownerUid={ownerUid || 'test-owner'}
              />
            </div>
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