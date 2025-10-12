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
} from 'lucide-react';
import { ImportLeadsModal } from '@/components/real-estate/leads/ImportLeadsModal';

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

  const getStatusBadge = (status: string) => {
    const colors = {
      HOT: 'bg-red-100 text-red-800',
      WARM: 'bg-yellow-100 text-yellow-800',
      COLD: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
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
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {t.export}
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm">
                <Plus className="w-4 h-4" />
                {t.create}
              </button>
            </div>

            {/* Selected Count & Bulk Actions */}
            {selectedLeads.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedLeads.size} {t.selected}
                </span>
                <button
                  onClick={() => handleExport(true)}
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t.bulkExport}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {leads.length === 0 ? t.emptyTitle : t.noResults}
            </h3>
            <p className="text-gray-600 mb-6">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button onClick={handleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                        {selectedLeads.size === filteredLeads.length ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {language === 'he' ? 'שם' : 'Name'}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {language === 'he' ? 'טלפון' : 'Phone'}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {language === 'he' ? 'אימייל' : 'Email'}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">{t.status}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">{t.source}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      {language === 'he' ? 'פעולות' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSelectLead(lead.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {selectedLeads.has(lead.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-600" dir="ltr">{lead.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.email || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lead.status)}`}>
                          {t[lead.status.toLowerCase() as keyof typeof t]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{lead.source}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            title={t.view}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title={t.edit}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            title={t.qualify}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            title={t.linkProperty}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </button>
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
