'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language-context';
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
} from 'lucide-react';
import { ImportLeadsModal } from '@/components/real-estate/leads/ImportLeadsModal';
import { ViewLeadModal } from '@/components/real-estate/leads/ViewLeadModal';
import { EditLeadModal } from '@/components/real-estate/leads/EditLeadModal';
import { LinkPropertyModal } from '@/components/real-estate/leads/LinkPropertyModal';
import { QualifyLeadModal } from '@/components/real-estate/leads/QualifyLeadModal';
import { CreateLeadModal } from '@/components/real-estate/leads/CreateLeadModal';
import { WhatsAppActions, BatchWhatsAppActions } from '@/components/real-estate/leads/WhatsAppActions';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'HOT' | 'WARM' | 'COLD';
  source: string;
  notes?: string;
  propertyId?: string | null;
  createdAt: string;
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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const t = {
    title: language === 'he' ? 'ניהול לידים' : 'Leads Management',
    import: language === 'he' ? 'ייבוא לידים' : 'Import Leads',
    export: language === 'he' ? 'ייצוא CSV' : 'Export CSV',
    create: language === 'he' ? 'ליד חדש' : 'New Lead',
    search: language === 'he' ? 'חיפוש לפי שם, טלפון או אימייל...' : 'Search by name, phone, or email...',
    status: language === 'he' ? 'סטטוס' : 'Status',
    source: language === 'he' ? 'מקור' : 'Source',
    all: language === 'he' ? 'הכל' : 'All',
    hot: language === 'he' ? 'חם' : 'Hot',
    warm: language === 'he' ? 'פושר' : 'Warm',
    cold: language === 'he' ? 'קר' : 'Cold',
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
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, sourceFilter, leads]);

  const applyFilters = useCallback(() => {
    let filtered = [...leads];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.phone.includes(query) ||
          lead.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
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
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter && sourceFilter !== 'all') params.set('source', sourceFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (selectedOnly && selectedLeads.size > 0) {
        params.set('selectedIds', Array.from(selectedLeads).join(','));
      }

      const response = await fetch(`/api/real-estate/leads/export?${params.toString()}`, {
        headers: { 'x-owner-uid': 'demo-user' },
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
      showToast('error', 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImportSuccess = (imported: number) => {
    showToast('success', `${imported} ${t.importSuccess}`);
    // Refresh leads list (in production, refetch from API)
    setTimeout(() => window.location.reload(), 1500);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshLeads = () => {
    // In production, this would refetch from API
    // For now, just reload the page
    window.location.reload();
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
    refreshLeads();
  };

  const handleCreateSuccess = () => {
    showToast('success', t.createSuccess);
    refreshLeads();
  };

  const handleLinkSuccess = () => {
    showToast('success', 'Property linked successfully');
    refreshLeads();
  };

  const getCurrentLead = () => {
    return filteredLeads.find((l) => l.id === currentLeadId);
  };

  const getSelectedLeadsData = () => {
    return filteredLeads.filter((l) => selectedLeads.has(l.id)).map((l) => ({
      id: l.id,
      phone: l.phone,
      fullName: l.name,
    }));
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      HOT: 'bg-red-100 text-red-800',
      WARM: 'bg-yellow-100 text-yellow-800',
      COLD: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`min-h-screen ${language === 'he' ? 'rtl' : 'ltr'}`} style={{ background: '#0E1A2B' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
            {t.title}
          </h1>
        </div>

        {/* Actions Bar */}
        <div className="rounded-xl p-4 mb-6" style={{ background: '#1A2F4B', border: '1px solid #374151' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
              >
                <Upload className="w-4 h-4" />
                {t.import}
              </button>

              <button
                onClick={() => handleExport(false)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ border: '1px solid #6B7280', color: '#E5E7EB' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#374151')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {t.export}
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {t.create}
              </button>
            </div>

            {/* Selected Count & Bulk Actions */}
            {selectedLeads.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: '#E5E7EB' }}>
                  {selectedLeads.size} {t.selected}
                </span>
                <BatchWhatsAppActions
                  leads={getSelectedLeadsData()}
                  onComplete={() => setSelectedLeads(new Set())}
                />
                <button
                  onClick={() => handleExport(true)}
                  className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                  style={{ border: '1px solid #6B7280', color: '#E5E7EB' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#374151')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {t.bulkExport}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl p-4 mb-6" style={{ background: '#1A2F4B', border: '1px solid #374151' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ background: '#0E1A2B', border: '1px solid #374151', color: '#FFFFFF' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#374151')}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all"
              style={{ background: '#0E1A2B', border: '1px solid #374151', color: '#FFFFFF' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#374151')}
            >
              <option value="">{t.all} - {t.status}</option>
              <option value="HOT">{t.hot}</option>
              <option value="WARM">{t.warm}</option>
              <option value="COLD">{t.cold}</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all"
              style={{ background: '#0E1A2B', border: '1px solid #374151', color: '#FFFFFF' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#2979FF')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#374151')}
            >
              <option value="">{t.all} - {t.source}</option>
              <option value="Website">{t.website}</option>
              <option value="Facebook">{t.facebook}</option>
              <option value="Instagram">{t.instagram}</option>
              <option value="Other">{t.other}</option>
            </select>
          </div>
        </div>

        {/* Leads Table */}
        {filteredLeads.length === 0 ? (
          <div className="rounded-xl shadow-sm p-12 text-center" style={{ background: '#1A2F4B', border: '1px solid #374151' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#374151' }}>
              <Filter className="w-8 h-8" style={{ color: '#9CA3AF' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>
              {leads.length === 0 ? t.emptyTitle : t.noResults}
            </h3>
            <p className="mb-6" style={{ color: '#9CA3AF' }}>
              {leads.length === 0 ? t.emptyDescription : 'Try adjusting your filters'}
            </p>
            {leads.length === 0 && (
              <button
                onClick={() => setShowImportModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm"
              >
                {t.import}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ background: '#1A2F4B', border: '1px solid #374151' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: '#0E1A2B', borderBottom: '1px solid #374151' }}>
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="p-1 rounded transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#374151')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {selectedLeads.size === filteredLeads.length ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                      {language === 'he' ? 'שם' : 'Name'}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                      {language === 'he' ? 'טלפון' : 'Phone'}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                      {language === 'he' ? 'אימייל' : 'Email'}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>{t.status}</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>{t.source}</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                      {language === 'he' ? 'פעולות' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#374151' }}>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#0E1A2B')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSelectLead(lead.id)}
                          className="p-1 rounded transition-colors"
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#374151')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {selectedLeads.has(lead.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: '#FFFFFF' }}>{lead.name}</td>
                      <td className="px-4 py-3" style={{ color: '#9CA3AF' }} dir="ltr">{lead.phone}</td>
                      <td className="px-4 py-3" style={{ color: '#9CA3AF' }}>{lead.email || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lead.status)}`}>
                          {t[lead.status.toLowerCase() as keyof typeof t]}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: '#9CA3AF' }}>{lead.source}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewLead(lead.id)}
                            title={t.view}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditLead(lead.id)}
                            title={t.edit}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            style={{ color: '#9CA3AF' }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQualifyLead(lead.id)}
                            title={t.qualify}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleLinkProperty(lead.id)}
                            title={t.linkProperty}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </button>
                          <WhatsAppActions
                            phone={lead.phone}
                            leadName={lead.name}
                            variant="icon"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border-2 ${
          toast.type === 'success' ? 'border-green-500' : 'border-red-500'
        } p-4 flex items-center gap-3 animate-fade-in z-50`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-500" />
          )}
          <p className="text-gray-900 font-medium">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
