'use client';

/**
 * Real Estate Leads Management - Wired to Real APIs
 */

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language-context';
import { auth } from '@/lib/firebase';
import {
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Link as LinkIcon,
  Sparkles,
  CheckSquare,
  Square,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  UniversalTable,
  UniversalTableHeader,
  UniversalTableBody,
  UniversalTableRow,
  UniversalTableHead,
  UniversalTableCell,
  TableEmptyState,
  StatusBadge,
  Drawer,
  BulkActionsMenu,
} from '@/components/shared';
import { ImportLeadsModal } from '@/components/real-estate/leads/ImportLeadsModal';
import { ViewLeadModal } from '@/components/real-estate/leads/ViewLeadModal';
import { EditLeadModal } from '@/components/real-estate/leads/EditLeadModal';
import { LinkPropertyModal } from '@/components/real-estate/leads/LinkPropertyModal';
import { QualifyLeadModal } from '@/components/real-estate/leads/QualifyLeadModal';
import { CreateLeadModal } from '@/components/real-estate/leads/CreateLeadModal';
import { WhatsAppActions } from '@/components/real-estate/leads/WhatsAppActions';

interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  qualificationStatus: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'MEETING' | 'OFFER' | 'DEAL' | 'CONVERTED' | 'DISQUALIFIED';
  source: string;
  notes?: string | null;
  message?: string | null;
  propertyId?: string | null;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  property?: {
    id: string;
    name: string;
    address?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface LeadsClientProps {
  initialData: Lead[];
}

export default function LeadsClient({ initialData }: LeadsClientProps) {
  const { language } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>(initialData);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkPropertyModal, setShowLinkPropertyModal] = useState(false);
  const [showQualifyModal, setShowQualifyModal] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLeads, setFetchingLeads] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Temporary filter state for drawer (applied on "Apply" button)
  const [tempStatusFilter, setTempStatusFilter] = useState<string>('');
  const [tempSourceFilter, setTempSourceFilter] = useState<string>('');

  const t = {
    title: language === 'he' ? 'ניהול לידים' : 'Leads Management',
    import: language === 'he' ? 'ייבוא לידים' : 'Import Leads',
    export: language === 'he' ? 'ייצוא CSV' : 'Export CSV',
    create: language === 'he' ? 'ליד חדש' : 'New Lead',
    search: language === 'he' ? 'חיפוש לפי שם, טלפון או אימייל...' : 'Search by name, phone, or email...',
    status: language === 'he' ? 'סטטוס' : 'Status',
    source: language === 'he' ? 'מקור' : 'Source',
    all: language === 'he' ? 'הכל' : 'All',
    // Status labels
    new: language === 'he' ? 'חדש' : 'New',
    contacted: language === 'he' ? 'יצרנו קשר' : 'Contacted',
    inProgress: language === 'he' ? 'בטיפול' : 'In Progress',
    meeting: language === 'he' ? 'פגישה' : 'Meeting',
    offer: language === 'he' ? 'הצעה' : 'Offer',
    deal: language === 'he' ? 'עסקה' : 'Deal',
    converted: language === 'he' ? 'הומר ללקוח' : 'Converted',
    disqualified: language === 'he' ? 'לא רלוונטי' : 'Disqualified',
    // Sources
    website: language === 'he' ? 'אתר' : 'Website',
    facebook: language === 'he' ? 'פייסבוק' : 'Facebook',
    instagram: language === 'he' ? 'אינסטגרם' : 'Instagram',
    other: language === 'he' ? 'אחר' : 'Other',
    selectAll: language === 'he' ? 'בחר הכל' : 'Select All',
    selected: language === 'he' ? 'נבחרו' : 'selected',
    bulkChangeStatus: language === 'he' ? 'שנה סטטוס' : 'Change Status',
    bulkExport: language === 'he' ? 'ייצא נבחרים' : 'Export Selected',
    view: language === 'he' ? 'צפייה' : 'View',
    edit: language === 'he' ? 'עריכה' : 'Edit',
    delete: language === 'he' ? 'מחיקה' : 'Delete',
    qualify: language === 'he' ? 'סיווג AI' : 'Qualify AI',
    linkProperty: language === 'he' ? 'קשר לנכס' : 'Link Property',
    archive: language === 'he' ? 'ארכוון' : 'Archive',
    emptyTitle: language === 'he' ? 'אין לידים עדיין' : 'No leads yet',
    emptyDescription: language === 'he' ? 'התחל על ידי ייבוא לידים או יצירת ליד חדש' : 'Start by importing leads or creating a new lead',
    noResults: language === 'he' ? 'לא נמצאו תוצאות' : 'No results found',
    importing: language === 'he' ? 'מייבא...' : 'Importing...',
    exporting: language === 'he' ? 'מייצא...' : 'Exporting...',
    exportSuccess: language === 'he' ? 'הייצוא הושלם בהצלחה' : 'Export completed successfully',
    importSuccess: language === 'he' ? 'לידים יובאו בהצלחה' : 'Leads imported successfully',
    whatsapp: language === 'he' ? 'WhatsApp' : 'WhatsApp',
    batchWhatsapp: language === 'he' ? 'שלח WhatsApp לנבחרים' : 'Send WhatsApp to Selected',
    updateSuccess: language === 'he' ? 'הליד עודכן בהצלחה' : 'Lead updated successfully',
    createSuccess: language === 'he' ? 'הליד נוצר בהצלחה' : 'Lead created successfully',
    deleteSuccess: language === 'he' ? 'הליד נמחק בהצלחה' : 'Lead deleted successfully',
    filters: language === 'he' ? 'סינון' : 'Filters',
    resetFilters: language === 'he' ? 'אפס סינון' : 'Reset',
    applyFilters: language === 'he' ? 'החל סינון' : 'Apply',
    loading: language === 'he' ? 'טוען...' : 'Loading...',
    errorLoading: language === 'he' ? 'שגיאה בטעינת לידים' : 'Error loading leads',
    retry: language === 'he' ? 'נסה שנית' : 'Retry',
    authRequired: language === 'he' ? 'נדרשת התחברות' : 'Authentication required',
  };

  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    setFetchingLeads(true);
    setFetchError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setFetchError(t.authRequired);
        setFetchingLeads(false);
        return;
      }

      const token = await user.getIdToken();

      // Build query params
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter && sourceFilter !== 'all') params.set('source', sourceFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100'); // TODO: Add pagination
      params.set('offset', '0');

      const response = await fetch(`/api/real-estate/leads?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setFilteredLeads(data.leads || []);
    } catch (error: any) {
      console.error('[LeadsClient] Fetch error:', error);
      setFetchError(error.message || t.errorLoading);
      showToast('error', t.errorLoading);
    } finally {
      setFetchingLeads(false);
    }
  }, [statusFilter, sourceFilter, searchQuery, t.authRequired, t.errorLoading]);

  // Fetch leads on mount and when filters change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Client-side filtering (already filtered by API, but keep for responsiveness)
  useEffect(() => {
    let filtered = [...leads];

    // Search filter (client-side for instant feedback)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.fullName?.toLowerCase().includes(query) ||
          lead.phone?.includes(query) ||
          lead.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.qualificationStatus === statusFilter);
    }

    // Source filter
    if (sourceFilter && sourceFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.source === sourceFilter);
    }

    setFilteredLeads(filtered);
  }, [searchQuery, statusFilter, sourceFilter, leads]);

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const handleExport = async (selectedOnly = false) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        showToast('error', t.authRequired);
        return;
      }

      const token = await user.getIdToken();
      const params = new URLSearchParams();

      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter && sourceFilter !== 'all') params.set('source', sourceFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (selectedOnly && selectedLeads.size > 0) {
        params.set('selectedIds', Array.from(selectedLeads).join(','));
      }

      const response = await fetch(`/api/real-estate/leads/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('success', t.exportSuccess);
    } catch (error) {
      console.error('Export error:', error);
      showToast('error', language === 'he' ? 'שגיאה בייצוא' : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm(language === 'he' ? 'האם אתה בטוח שברצונך למחוק ליד זה?' : 'Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        showToast('error', t.authRequired);
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/real-estate/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      showToast('success', t.deleteSuccess);
      await fetchLeads(); // Refresh list
    } catch (error) {
      console.error('Delete error:', error);
      showToast('error', language === 'he' ? 'שגיאה במחיקת ליד' : 'Failed to delete lead');
    }
  };

  const handleImportSuccess = (imported: number) => {
    showToast('success', `${imported} ${t.importSuccess}`);
    fetchLeads(); // Refresh leads list
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewLead = (leadId: string) => {
    setCurrentLeadId(leadId);
    setShowViewModal(true);
  };

  const handleEditLead = (leadId: string) => {
    setCurrentLeadId(leadId);
    setShowEditModal(true);
  };

  const handleLinkProperty = (leadId: string) => {
    setCurrentLeadId(leadId);
    setShowLinkPropertyModal(true);
  };

  const handleQualifyLead = (leadId: string) => {
    setCurrentLeadId(leadId);
    setShowQualifyModal(true);
  };

  const handleEditSuccess = () => {
    showToast('success', t.updateSuccess);
    fetchLeads();
  };

  const handleCreateSuccess = () => {
    showToast('success', t.createSuccess);
    fetchLeads();
  };

  const handleLinkSuccess = () => {
    showToast('success', language === 'he' ? 'נכס קושר בהצלחה' : 'Property linked successfully');
    fetchLeads();
  };

  const getCurrentLead = () => {
    return filteredLeads.find((l) => l.id === currentLeadId);
  };

  // Filter drawer handlers
  const handleOpenFilterDrawer = () => {
    setTempStatusFilter(statusFilter);
    setTempSourceFilter(sourceFilter);
    setShowFilterDrawer(true);
  };

  const handleResetFilters = () => {
    setTempStatusFilter('');
    setTempSourceFilter('');
  };

  const handleApplyFilters = () => {
    setStatusFilter(tempStatusFilter);
    setSourceFilter(tempSourceFilter);
    setShowFilterDrawer(false);
  };

  const getSelectedLeadsData = () => {
    return filteredLeads.filter((l) => selectedLeads.has(l.id)).map((l) => ({
      id: l.id,
      phone: l.phone,
      fullName: l.fullName,
    }));
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: t.new,
      CONTACTED: t.contacted,
      IN_PROGRESS: t.inProgress,
      MEETING: t.meeting,
      OFFER: t.offer,
      DEAL: t.deal,
      CONVERTED: t.converted,
      DISQUALIFIED: t.disqualified,
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      CONTACTED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      MEETING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      OFFER: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      DEAL: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      CONVERTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      DISQUALIFIED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (fetchingLeads && leads.length === 0) {
    return (
      <main className={`min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8 ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#2979FF] mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t.loading}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (fetchError && leads.length === 0) {
    return (
      <main className={`min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8 ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.errorLoading}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{fetchError}</p>
              <UniversalButton variant="primary" onClick={fetchLeads} leftIcon={<RefreshCw className="w-4 h-4" />}>
                {t.retry}
              </UniversalButton>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
              {language === 'he' ? 'נהל ועקוב אחר הלידים שלך' : 'Manage and track your leads'}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <UniversalCard variant="default">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Left Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <UniversalButton
                  variant="success"
                  size="md"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => setShowImportModal(true)}
                  className="!bg-gradient-to-r from-green-600 to-green-700"
                >
                  {t.import}
                </UniversalButton>

                <UniversalButton
                  variant="outline"
                  size="md"
                  leftIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  onClick={() => handleExport(false)}
                  disabled={loading}
                >
                  {t.export}
                </UniversalButton>

                <UniversalButton
                  variant="primary"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowCreateModal(true)}
                >
                  {t.create}
                </UniversalButton>

                <UniversalButton
                  variant="ghost"
                  size="md"
                  leftIcon={<RefreshCw className={`w-4 h-4 ${fetchingLeads ? 'animate-spin' : ''}`} />}
                  onClick={fetchLeads}
                  disabled={fetchingLeads}
                >
                  {language === 'he' ? 'רענן' : 'Refresh'}
                </UniversalButton>
              </div>

              {/* Bulk Actions Menu */}
              <BulkActionsMenu
                selectedCount={selectedLeads.size}
                title={`${selectedLeads.size} ${t.selected}`}
                actions={[
                  {
                    id: 'export',
                    label: t.bulkExport,
                    icon: <Download className="w-4 h-4" />,
                    onClick: () => handleExport(true),
                  },
                ]}
              />
            </div>
          </CardBody>
        </UniversalCard>

        {/* Filters */}
        <UniversalCard variant="default">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search - Full width on mobile, 2/3 on desktop */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all"
                  />
                </div>
              </div>

              {/* Desktop Filters - Hidden on mobile */}
              <div className="hidden sm:flex gap-4">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all"
                >
                  <option value="">{t.all} - {t.status}</option>
                  <option value="NEW">{t.new}</option>
                  <option value="CONTACTED">{t.contacted}</option>
                  <option value="IN_PROGRESS">{t.inProgress}</option>
                  <option value="MEETING">{t.meeting}</option>
                  <option value="OFFER">{t.offer}</option>
                  <option value="DEAL">{t.deal}</option>
                  <option value="CONVERTED">{t.converted}</option>
                  <option value="DISQUALIFIED">{t.disqualified}</option>
                </select>

                {/* Source Filter */}
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all"
                >
                  <option value="">{t.all} - {t.source}</option>
                  <option value="Website">{t.website}</option>
                  <option value="Facebook">{t.facebook}</option>
                  <option value="Instagram">{t.instagram}</option>
                  <option value="Import">{language === 'he' ? 'ייבוא' : 'Import'}</option>
                  <option value="Other">{t.other}</option>
                </select>
              </div>

              {/* Mobile Filter Button - Only visible on small screens */}
              <div className="sm:hidden">
                <UniversalButton
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFilterDrawer}
                  leftIcon={<Filter className="w-5 h-5" />}
                  fullWidth
                  className="!min-h-[44px]"
                >
                  {t.filters}
                  {(statusFilter || sourceFilter) && (
                    <span className="ml-2 px-2 py-0.5 bg-[#2979FF] text-white rounded-full text-xs font-semibold">
                      {[statusFilter, sourceFilter].filter(Boolean).length}
                    </span>
                  )}
                </UniversalButton>
              </div>
            </div>
          </CardBody>
        </UniversalCard>

        {/* Leads Table/Cards */}
        {filteredLeads.length === 0 ? (
          <TableEmptyState
            icon={<Filter className="w-12 h-12" />}
            title={leads.length === 0 ? t.emptyTitle : t.noResults}
            description={leads.length === 0 ? t.emptyDescription : language === 'he' ? 'נסה לשנות את הפילטרים' : 'Try adjusting your filters'}
            action={leads.length === 0 ? (
              <UniversalButton variant="primary" size="md" leftIcon={<Upload />} onClick={() => setShowImportModal(true)}>
                {t.import}
              </UniversalButton>
            ) : undefined}
          />
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {filteredLeads.map((lead) => (
                <UniversalCard key={lead.id} variant="default" className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleSelectLead(lead.id)} className="p-1">
                        {selectedLeads.has(lead.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#2979FF]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{lead.fullName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400" dir="ltr">{lead.phone}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.qualificationStatus)}`}>
                      {getStatusLabel(lead.qualificationStatus)}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3 text-sm">
                    {lead.email && (
                      <div className="text-gray-600 dark:text-gray-400">{lead.email}</div>
                    )}
                    <div className="text-gray-600 dark:text-gray-400">{t.source}: {lead.source}</div>
                    {lead.assignedTo && (
                      <div className="text-gray-600 dark:text-gray-400">
                        {language === 'he' ? 'סוכן: ' : 'Agent: '}{lead.assignedTo.fullName}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <UniversalButton variant="outline" size="sm" onClick={() => handleViewLead(lead.id)} leftIcon={<Eye className="w-4 h-4" />} className="flex-1 !min-h-[44px]">
                      {t.view}
                    </UniversalButton>
                    <UniversalButton variant="outline" size="sm" onClick={() => handleEditLead(lead.id)} leftIcon={<Edit className="w-4 h-4" />} className="flex-1 !min-h-[44px]">
                      {t.edit}
                    </UniversalButton>
                    <UniversalButton variant="danger" size="sm" onClick={() => handleDelete(lead.id)} leftIcon={<Trash2 className="w-4 h-4" />} className="flex-1 !min-h-[44px]">
                      {t.delete}
                    </UniversalButton>
                  </div>
                </UniversalCard>
              ))}
            </div>

            {/* Desktop Table View */}
            <UniversalCard variant="default" className="hidden sm:block">
            <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
              <h2 className="text-heading-4 text-gray-900 dark:text-white">
                {language === 'he' ? 'רשימת לידים' : 'Leads List'} ({filteredLeads.length})
              </h2>
            </CardHeader>
            <UniversalTable>
              <UniversalTableHeader>
                <UniversalTableRow>
                  <UniversalTableHead>
                    <button onClick={handleSelectAll} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors">
                      {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-[#2979FF]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </UniversalTableHead>
                  <UniversalTableHead>{language === 'he' ? 'שם' : 'Name'}</UniversalTableHead>
                  <UniversalTableHead>{language === 'he' ? 'טלפון' : 'Phone'}</UniversalTableHead>
                  <UniversalTableHead>{language === 'he' ? 'אימייל' : 'Email'}</UniversalTableHead>
                  <UniversalTableHead>{t.status}</UniversalTableHead>
                  <UniversalTableHead>{t.source}</UniversalTableHead>
                  <UniversalTableHead>{language === 'he' ? 'סוכן' : 'Agent'}</UniversalTableHead>
                  <UniversalTableHead>{language === 'he' ? 'פעולות' : 'Actions'}</UniversalTableHead>
                </UniversalTableRow>
              </UniversalTableHeader>
              <UniversalTableBody>
                {filteredLeads.map((lead) => (
                  <UniversalTableRow key={lead.id} hoverable>
                    <UniversalTableCell>
                      <button onClick={() => handleSelectLead(lead.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors">
                        {selectedLeads.has(lead.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#2979FF]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </UniversalTableCell>
                    <UniversalTableCell className="font-medium">{lead.fullName}</UniversalTableCell>
                    <UniversalTableCell dir="ltr">{lead.phone}</UniversalTableCell>
                    <UniversalTableCell>{lead.email || '-'}</UniversalTableCell>
                    <UniversalTableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.qualificationStatus)}`}>
                        {getStatusLabel(lead.qualificationStatus)}
                      </span>
                    </UniversalTableCell>
                    <UniversalTableCell>{lead.source}</UniversalTableCell>
                    <UniversalTableCell>{lead.assignedTo?.fullName || '-'}</UniversalTableCell>
                    <UniversalTableCell>
                      <div className="flex items-center gap-2">
                        <UniversalButton variant="ghost" size="sm" onClick={() => handleViewLead(lead.id)} className="!p-1.5">
                          <Eye className="w-4 h-4 text-[#2979FF]" />
                        </UniversalButton>
                        <UniversalButton variant="ghost" size="sm" onClick={() => handleEditLead(lead.id)} className="!p-1.5">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </UniversalButton>
                        <UniversalButton variant="ghost" size="sm" onClick={() => handleDelete(lead.id)} className="!p-1.5">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </UniversalButton>
                        <UniversalButton variant="ghost" size="sm" onClick={() => handleLinkProperty(lead.id)} className="!p-1.5">
                          <LinkIcon className="w-4 h-4 text-green-600" />
                        </UniversalButton>
                        {lead.phone && <WhatsAppActions phone={lead.phone} leadName={lead.fullName} variant="icon" />}
                      </div>
                    </UniversalTableCell>
                  </UniversalTableRow>
                ))}
              </UniversalTableBody>
            </UniversalTable>
            </UniversalCard>
          </>
        )}
      </div>

      {/* Import Modal */}
      <ImportLeadsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* View Lead Modal */}
      {currentLeadId && (
        <ViewLeadModal
          isOpen={showViewModal}
          leadId={currentLeadId}
          onClose={() => {
            setShowViewModal(false);
            setCurrentLeadId(null);
          }}
        />
      )}

      {/* Edit Lead Modal */}
      {currentLeadId && (
        <EditLeadModal
          isOpen={showEditModal}
          leadId={currentLeadId}
          onClose={() => {
            setShowEditModal(false);
            setCurrentLeadId(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Link Property Modal */}
      {currentLeadId && (
        <LinkPropertyModal
          isOpen={showLinkPropertyModal}
          leadId={currentLeadId}
          currentPropertyId={getCurrentLead()?.propertyId}
          onClose={() => {
            setShowLinkPropertyModal(false);
            setCurrentLeadId(null);
          }}
          onSuccess={handleLinkSuccess}
        />
      )}

      {/* Qualify Lead Modal */}
      {currentLeadId && (
        <QualifyLeadModal
          isOpen={showQualifyModal}
          leadId={currentLeadId}
          onClose={() => {
            setShowQualifyModal(false);
            setCurrentLeadId(null);
          }}
          onPropertyLink={handleLinkSuccess}
        />
      )}

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        title={t.filters}
        resetLabel={t.resetFilters}
        applyLabel={t.applyFilters}
        width="sm"
      >
        <div className="space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.status}
            </label>
            <select
              value={tempStatusFilter}
              onChange={(e) => setTempStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all"
            >
              <option value="">{t.all}</option>
              <option value="NEW">{t.new}</option>
              <option value="CONTACTED">{t.contacted}</option>
              <option value="IN_PROGRESS">{t.inProgress}</option>
              <option value="MEETING">{t.meeting}</option>
              <option value="OFFER">{t.offer}</option>
              <option value="DEAL">{t.deal}</option>
              <option value="CONVERTED">{t.converted}</option>
              <option value="DISQUALIFIED">{t.disqualified}</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.source}
            </label>
            <select
              value={tempSourceFilter}
              onChange={(e) => setTempSourceFilter(e.target.value)}
              className="w-full px-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all"
            >
              <option value="">{t.all}</option>
              <option value="Website">{t.website}</option>
              <option value="Facebook">{t.facebook}</option>
              <option value="Instagram">{t.instagram}</option>
              <option value="Import">{language === 'he' ? 'ייבוא' : 'Import'}</option>
              <option value="Other">{t.other}</option>
            </select>
          </div>

          {/* Active Filters Display */}
          {(tempStatusFilter || tempSourceFilter) && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'he' ? 'פילטרים פעילים:' : 'Active Filters:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {tempStatusFilter && (
                  <span className="px-3 py-1 bg-[#2979FF]/10 text-[#2979FF] rounded-full text-sm font-medium">
                    {t.status}: {getStatusLabel(tempStatusFilter)}
                  </span>
                )}
                {tempSourceFilter && (
                  <span className="px-3 py-1 bg-[#2979FF]/10 text-[#2979FF] rounded-full text-sm font-medium">
                    {t.source}: {tempSourceFilter}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 ${language === 'he' ? 'left-6' : 'right-6'} bg-white dark:bg-[#1A2F4B] rounded-lg shadow-2xl border-2 ${
          toast.type === 'success' ? 'border-green-500' : 'border-red-500'
        } p-4 flex items-center gap-3 animate-fade-in z-50 max-w-md`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          )}
          <p className="text-gray-900 dark:text-white font-medium">{toast.message}</p>
        </div>
      )}
    </main>
  );
}
