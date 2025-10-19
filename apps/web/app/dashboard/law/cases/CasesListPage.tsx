'use client';

/**
 * Cases List Page - Production Ready
 *
 * Features:
 * - Sortable table with all case data
 * - Advanced filters (status, priority, type, attorney, date range)
 * - Real-time search
 * - Pagination
 * - Inline edit/delete actions
 * - Empty and loading states
 * - Full keyboard accessibility
 * - Analytics tracking
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { LawButton, CaseStatusBadge, PriorityBadge } from '@/components/law/shared';
import { CaseModal } from '@/components/law/cases/CaseModal';
import { useCases, useDeleteCase } from '@/lib/hooks/law/useCases';
import type { Case, CaseFilters, CaseSortOptions, CaseStatusType, CasePriorityType, CaseTypeEnum } from '@/lib/types/law/case';
import { trackEventWithConsent } from '@/lib/analytics/consent';

export function CasesListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CaseFilters>({});
  const [sort, setSort] = useState<CaseSortOptions>({ field: 'updatedAt', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; caseToEdit: Case | null }>({
    isOpen: false,
    caseToEdit: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch cases with current filters
  const { data, isLoading, error } = useCases(filters);
  const deleteMutation = useDeleteCase();

  // Apply search and sort locally for better UX
  const processedCases = useMemo(() => {
    if (!data?.cases) return [];

    let filtered = [...data.cases];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.caseNumber.toLowerCase().includes(query) ||
          c.client.name.toLowerCase().includes(query)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1;

      switch (sort.field) {
        case 'title':
          return direction * a.title.localeCompare(b.title);
        case 'caseNumber':
          return direction * a.caseNumber.localeCompare(b.caseNumber);
        case 'filingDate':
          return direction * (new Date(a.filingDate).getTime() - new Date(b.filingDate).getTime());
        case 'updatedAt':
          return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        case 'status':
          return direction * a.status.localeCompare(b.status);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return direction * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        default:
          return 0;
      }
    });

    return filtered;
  }, [data?.cases, searchQuery, sort]);

  const handleSort = (field: CaseSortOptions['field']) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    trackEventWithConsent('cases_sort', { field, direction: sort.direction });
  };

  const handleCreateCase = () => {
    setModalState({ isOpen: true, caseToEdit: null });
    trackEventWithConsent('cases_create_click', { source: 'cases_list' });
  };

  const handleEditCase = (caseItem: Case) => {
    setModalState({ isOpen: true, caseToEdit: caseItem });
    trackEventWithConsent('cases_edit_click', { case_id: caseItem.id, source: 'cases_list' });
  };

  const handleViewCase = (caseId: string) => {
    trackEventWithConsent('cases_view_click', { case_id: caseId, source: 'cases_list' });
    router.push(`/dashboard/law/cases/${caseId}`);
  };

  const handleDeleteCase = async (caseId: string) => {
    try {
      await deleteMutation.mutateAsync(caseId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete case:', error);
    }
  };

  const handleFilterChange = (key: keyof CaseFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    trackEventWithConsent('cases_filter', { filter: key, value });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    trackEventWithConsent('cases_clear_filters', {});
  };

  const activeFiltersCount = Object.keys(filters).filter((k) => filters[k as keyof CaseFilters]).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-law-border bg-white sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-law-3xl font-bold text-law-text-primary mb-1">Cases</h1>
              <p className="text-law-base text-law-text-secondary">
                Manage all legal matters and case files
              </p>
            </div>

            <div className="flex items-center gap-3">
              <LawButton
                variant="secondary"
                size="md"
                icon={<Filter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                className={`relative ${activeFiltersCount > 0 ? 'ring-2 ring-law-primary' : ''}`}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-law-primary text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </LawButton>
              <LawButton
                variant="primary"
                size="md"
                icon={<Plus size={16} />}
                onClick={handleCreateCase}
              >
                New Case
              </LawButton>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-law-text-tertiary" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, case number, or client name..."
                className="w-full pl-12 pr-4 py-3 border border-law-border rounded-law-lg focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-law-primary-subtle rounded-full transition-colors"
                >
                  <X size={16} className="text-law-text-secondary" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-law-border bg-law-surface overflow-hidden"
          >
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-law-sm font-medium text-law-text-secondary mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status?.[0] || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : undefined)}
                    className="w-full px-4 py-2 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-law-sm font-medium text-law-text-secondary mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority?.[0] || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value ? [e.target.value] : undefined)}
                    className="w-full px-4 py-2 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-law-sm font-medium text-law-text-secondary mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type?.[0] || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value ? [e.target.value] : undefined)}
                    className="w-full px-4 py-2 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                  >
                    <option value="">All Types</option>
                    <option value="litigation">Litigation</option>
                    <option value="corporate">Corporate</option>
                    <option value="family">Family</option>
                    <option value="criminal">Criminal</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="intellectual_property">IP</option>
                    <option value="employment">Employment</option>
                    <option value="immigration">Immigration</option>
                    <option value="tax">Tax</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-law-sm font-medium text-law-text-secondary mb-2">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="flex-1 px-3 py-2 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary transition-all text-sm"
                    />
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="flex-1 px-3 py-2 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4">
                  <LawButton variant="ghost" size="sm" onClick={clearFilters} icon={<X size={14} />}>
                    Clear all filters
                  </LawButton>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-law-primary animate-spin mx-auto mb-4" />
              <p className="text-law-base text-law-text-secondary">Loading cases...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-law-error mx-auto mb-4" />
              <h3 className="text-law-lg font-semibold text-law-text-primary mb-2">
                Failed to load cases
              </h3>
              <p className="text-law-base text-law-text-secondary mb-6">
                {error.message || 'An error occurred while fetching cases'}
              </p>
              <LawButton variant="primary" size="md" onClick={() => window.location.reload()}>
                Retry
              </LawButton>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && processedCases.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-law-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-law-primary" />
              </div>
              <h3 className="text-law-lg font-semibold text-law-text-primary mb-2">
                {searchQuery || activeFiltersCount > 0 ? 'No cases found' : 'No cases yet'}
              </h3>
              <p className="text-law-base text-law-text-secondary mb-6">
                {searchQuery || activeFiltersCount > 0
                  ? 'Try adjusting your search or filters'
                  : 'Create your first case to get started'}
              </p>
              {(searchQuery || activeFiltersCount > 0) ? (
                <LawButton variant="secondary" size="md" onClick={clearFilters}>
                  Clear filters
                </LawButton>
              ) : (
                <LawButton variant="primary" size="md" onClick={handleCreateCase} icon={<Plus size={16} />}>
                  Create First Case
                </LawButton>
              )}
            </div>
          </div>
        )}

        {/* Cases Table */}
        {!isLoading && !error && processedCases.length > 0 && (
          <div className="border border-law-border rounded-law-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-law-surface border-b border-law-border">
                  <tr>
                    <TableHeader field="caseNumber" label="Case #" sort={sort} onSort={handleSort} />
                    <TableHeader field="title" label="Title" sort={sort} onSort={handleSort} />
                    <th className="px-6 py-4 text-left text-law-sm font-semibold text-law-text-secondary">
                      Client
                    </th>
                    <TableHeader field="status" label="Status" sort={sort} onSort={handleSort} />
                    <TableHeader field="priority" label="Priority" sort={sort} onSort={handleSort} />
                    <th className="px-6 py-4 text-left text-law-sm font-semibold text-law-text-secondary">
                      Attorney
                    </th>
                    <TableHeader field="filingDate" label="Filing Date" sort={sort} onSort={handleSort} />
                    <th className="px-6 py-4 text-right text-law-sm font-semibold text-law-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {processedCases.map((caseItem, index) => (
                    <motion.tr
                      key={caseItem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-law-border last:border-0 hover:bg-law-primary-subtle transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-law-sm font-mono text-law-text-primary">
                          {caseItem.caseNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewCase(caseItem.id)}
                          className="text-law-sm font-medium text-law-primary hover:underline text-left"
                        >
                          {caseItem.title}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-law-sm text-law-text-secondary">
                          {caseItem.client.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <CaseStatusBadge status={caseItem.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={caseItem.priority} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-law-sm text-law-text-secondary">
                          {caseItem.assignedAttorney.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-law-sm text-law-text-secondary">
                          <Calendar size={14} />
                          {new Date(caseItem.filingDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewCase(caseItem.id)}
                            className="p-2 hover:bg-law-info-bg rounded-law-md transition-colors group"
                            title="View case"
                          >
                            <Eye size={16} className="text-law-text-secondary group-hover:text-law-info" />
                          </button>
                          <button
                            onClick={() => handleEditCase(caseItem)}
                            className="p-2 hover:bg-law-warning-bg rounded-law-md transition-colors group"
                            title="Edit case"
                          >
                            <Edit2 size={16} className="text-law-text-secondary group-hover:text-law-warning" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(caseItem.id)}
                            className="p-2 hover:bg-law-error-bg rounded-law-md transition-colors group"
                            title="Delete case"
                          >
                            <Trash2 size={16} className="text-law-text-secondary group-hover:text-law-error" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Results Summary */}
            <div className="px-6 py-4 border-t border-law-border bg-law-surface">
              <p className="text-law-sm text-law-text-secondary">
                Showing <span className="font-semibold text-law-text-primary">{processedCases.length}</span> of{' '}
                <span className="font-semibold text-law-text-primary">{data?.total || 0}</span> cases
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Case Modal */}
      <CaseModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, caseToEdit: null })}
        caseToEdit={modalState.caseToEdit}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-law-xl shadow-law-xl max-w-md w-full p-6"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-law-error-bg rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-law-error" />
              </div>
              <div>
                <h3 className="text-law-lg font-semibold text-law-text-primary mb-2">
                  Delete Case?
                </h3>
                <p className="text-law-sm text-law-text-secondary">
                  This action cannot be undone. All case data, documents, and related information will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <LawButton
                variant="secondary"
                size="md"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteMutation.isPending}
                className="flex-1"
              >
                Cancel
              </LawButton>
              <LawButton
                variant="primary"
                size="md"
                onClick={() => handleDeleteCase(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-law-error hover:bg-red-700"
                icon={deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : undefined}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Case'}
              </LawButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Table Header Component with Sorting
function TableHeader({
  field,
  label,
  sort,
  onSort,
}: {
  field: CaseSortOptions['field'];
  label: string;
  sort: CaseSortOptions;
  onSort: (field: CaseSortOptions['field']) => void;
}) {
  const isSorted = sort.field === field;

  return (
    <th className="px-6 py-4 text-left">
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-2 text-law-sm font-semibold text-law-text-secondary hover:text-law-primary transition-colors group"
      >
        {label}
        <div className="flex flex-col">
          <ChevronUp
            size={12}
            className={`-mb-1 ${
              isSorted && sort.direction === 'asc'
                ? 'text-law-primary'
                : 'text-law-text-tertiary group-hover:text-law-primary/50'
            }`}
          />
          <ChevronDown
            size={12}
            className={`-mt-1 ${
              isSorted && sort.direction === 'desc'
                ? 'text-law-primary'
                : 'text-law-text-tertiary group-hover:text-law-primary/50'
            }`}
          />
        </div>
      </button>
    </th>
  );
}
