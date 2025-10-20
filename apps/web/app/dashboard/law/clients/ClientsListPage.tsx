'use client';

/**
 * Clients List Page - CRM for Law Practice
 * Features: Filters, search, sort, pagination, inline actions
 * Design: Law theme with white bg, deep navy text, premium UX
 */

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
  X,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import { ClientModal } from '@/components/law/clients/ClientModal';
import { useClients, useDeleteClient } from '@/lib/hooks/law/useClients';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import type {
  Client,
  ClientFilters,
  ClientSortOptions,
  ClientStatus,
  ClientTag,
  clientStatusLabels,
  clientStatusColors,
  clientTagLabels,
  clientTagColors,
} from '@/lib/types/law/client';

export function ClientsListPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [filters, setFilters] = useState<ClientFilters>({});
  const [sort, setSort] = useState<ClientSortOptions>({ field: 'createdAt', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useClients(filters);
  const deleteMutation = useDeleteClient();

  // Track page view
  useEffect(() => {
    trackEventWithConsent('law_client_list_view', {
      filters_active: Object.keys(filters).length > 0,
      search_active: !!searchQuery,
    });
  }, []);

  // Client-side search and sort
  const processedClients = useMemo(() => {
    if (!data?.clients) return [];
    let filtered = [...data.clients];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.company?.toLowerCase().includes(query)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1;
      switch (sort.field) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'company':
          return direction * (a.company || '').localeCompare(b.company || '');
        case 'status':
          return direction * a.status.localeCompare(b.status);
        case 'createdAt':
          return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'updatedAt':
          return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        case 'casesCount':
          return direction * (a.casesCount - b.casesCount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [data?.clients, searchQuery, sort]);

  const handleSort = (field: typeof sort.field) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));

    trackEventWithConsent('law_client_sort', {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleFilterChange = (key: keyof ClientFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    trackEventWithConsent('law_client_filter', {
      filter_type: key,
      filter_value: value,
    });
  };

  const handleCreateClient = () => {
    setClientToEdit(undefined);
    setShowModal(true);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setShowModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-law-border bg-white sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-law-2xl font-bold text-law-text-primary">Clients</h1>
              <p className="text-law-sm text-law-text-secondary mt-1">
                Manage your client relationships and contacts
              </p>
            </div>
            <button
              onClick={handleCreateClient}
              className="flex items-center gap-2 px-4 py-2.5 bg-law-primary text-white text-law-sm font-medium rounded-law-md hover:bg-law-primary-hover focus:outline-none focus:ring-2 focus:ring-law-primary focus:ring-offset-2 transition-all"
            >
              <Plus size={18} />
              New Client
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-law-text-tertiary"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or company..."
                className="w-full pl-10 pr-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary text-law-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-law-md text-law-sm font-medium transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'border-law-primary bg-law-primary-subtle text-law-primary'
                  : 'border-law-border text-law-text-secondary hover:border-law-primary hover:text-law-primary'
              }`}
            >
              <SlidersHorizontal size={18} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-law-primary text-white text-law-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-law-border">
                  <div>
                    <label className="block text-law-xs font-medium text-law-text-secondary mb-1.5">
                      Status
                    </label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) =>
                        handleFilterChange('status', e.target.value || undefined)
                      }
                      className="w-full px-3 py-2 border border-law-border rounded-law-md text-law-sm focus:outline-none focus:ring-2 focus:ring-law-primary"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="lead">Lead</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-law-xs font-medium text-law-text-secondary mb-1.5">
                      Attorney
                    </label>
                    <select
                      value={filters.assignedAttorneyId || ''}
                      onChange={(e) =>
                        handleFilterChange('assignedAttorneyId', e.target.value || undefined)
                      }
                      className="w-full px-3 py-2 border border-law-border rounded-law-md text-law-sm focus:outline-none focus:ring-2 focus:ring-law-primary"
                    >
                      <option value="">All Attorneys</option>
                      <option value="attorney-1">Sarah Williams</option>
                      <option value="attorney-2">Robert Chen</option>
                      <option value="attorney-3">Michael Johnson</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilters({});
                        trackEventWithConsent('law_client_filter_clear', {});
                      }}
                      className="w-full px-3 py-2 text-law-sm text-law-text-secondary hover:text-law-primary transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-law-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-law-error mx-auto mb-4" />
            <h3 className="text-law-lg font-semibold text-law-text-primary mb-2">
              Error Loading Clients
            </h3>
            <p className="text-law-sm text-law-text-secondary">
              There was an error loading the clients. Please try again.
            </p>
          </div>
        ) : processedClients.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-law-text-tertiary mx-auto mb-4" />
            <h3 className="text-law-lg font-semibold text-law-text-primary mb-2">
              {searchQuery || activeFiltersCount > 0 ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-law-sm text-law-text-secondary mb-6">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search or filters'
                : 'Create your first client to get started'}
            </p>
            {!searchQuery && activeFiltersCount === 0 && (
              <button
                onClick={handleCreateClient}
                className="px-4 py-2 bg-law-primary text-white text-law-sm font-medium rounded-law-md hover:bg-law-primary-hover transition-all"
              >
                Create First Client
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-4 text-law-sm text-law-text-secondary">
              Showing {processedClients.length} of {data?.total || 0} clients
            </div>

            {/* Table */}
            <div className="bg-white border border-law-border rounded-law-lg overflow-hidden shadow-law-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-law-primary-subtle border-b border-law-border">
                    <tr>
                      <TableHeader
                        field="name"
                        label="Name"
                        sort={sort}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3 text-left text-law-xs font-medium text-law-text-secondary">
                        Contact
                      </th>
                      <TableHeader
                        field="status"
                        label="Status"
                        sort={sort}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3 text-left text-law-xs font-medium text-law-text-secondary">
                        Tags
                      </th>
                      <TableHeader
                        field="casesCount"
                        label="Cases"
                        sort={sort}
                        onSort={handleSort}
                      />
                      <TableHeader
                        field="updatedAt"
                        label="Last Updated"
                        sort={sort}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3 text-right text-law-xs font-medium text-law-text-secondary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-law-border">
                    {processedClients.map((client) => (
                      <tr
                        key={client.id}
                        className="hover:bg-law-primary-subtle transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-law-sm font-medium text-law-text-primary">
                              {client.name}
                            </div>
                            {client.company && (
                              <div className="text-law-xs text-law-text-tertiary flex items-center gap-1 mt-0.5">
                                <Building2 size={12} />
                                {client.company}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {client.email && (
                              <div className="text-law-xs text-law-text-secondary flex items-center gap-1">
                                <Mail size={12} />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="text-law-xs text-law-text-secondary flex items-center gap-1">
                                <Phone size={12} />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={client.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {client.tags.slice(0, 2).map((tag) => (
                              <TagBadge key={tag} tag={tag} />
                            ))}
                            {client.tags.length > 2 && (
                              <span className="text-law-xs text-law-text-tertiary">
                                +{client.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-law-sm text-law-text-primary font-medium">
                            {client.casesCount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-law-xs text-law-text-secondary">
                            {new Date(client.updatedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClient(client)}
                              className="p-1.5 hover:bg-law-primary-subtle rounded transition-colors"
                              aria-label="Edit client"
                            >
                              <Edit2 size={16} className="text-law-text-secondary" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(client.id)}
                              className="p-1.5 hover:bg-law-error-bg rounded transition-colors"
                              aria-label="Delete client"
                            >
                              <Trash2 size={16} className="text-law-error" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ClientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setClientToEdit(undefined);
        }}
        clientToEdit={clientToEdit}
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => setDeleteConfirm(null)}
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-law-lg shadow-law-xl max-w-md w-full p-6"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-law-error-bg rounded-law-lg">
                    <AlertCircle className="w-6 h-6 text-law-error" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-law-lg font-semibold text-law-text-primary mb-1">
                      Delete Client
                    </h3>
                    <p className="text-law-sm text-law-text-secondary">
                      Are you sure you want to delete this client? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-law-sm font-medium text-law-text-secondary hover:bg-law-primary-subtle rounded-law-md transition-colors"
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteClient(deleteConfirm)}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 bg-law-error text-white text-law-sm font-medium rounded-law-md hover:bg-law-error/90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                    Delete Client
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
function TableHeader({
  field,
  label,
  sort,
  onSort,
}: {
  field: ClientSortOptions['field'];
  label: string;
  sort: ClientSortOptions;
  onSort: (field: ClientSortOptions['field']) => void;
}) {
  const isSorted = sort.field === field;
  return (
    <th className="px-4 py-3 text-left">
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-1 text-law-xs font-medium text-law-text-secondary hover:text-law-primary transition-colors"
      >
        {label}
        <div className="flex flex-col">
          <ChevronUp
            size={12}
            className={isSorted && sort.direction === 'asc' ? 'text-law-primary' : 'text-law-text-tertiary'}
          />
          <ChevronDown
            size={12}
            className={isSorted && sort.direction === 'desc' ? 'text-law-primary' : 'text-law-text-tertiary'}
            style={{ marginTop: '-4px' }}
          />
        </div>
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: ClientStatus }) {
  const colors = {
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-gray-50 text-gray-700 border-gray-200',
    lead: 'bg-blue-50 text-blue-700 border-blue-200',
    archived: 'bg-gray-100 text-gray-500 border-gray-300',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-law-sm border text-law-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TagBadge({ tag }: { tag: ClientTag }) {
  const colors = {
    vip: 'bg-purple-100 text-purple-700',
    corporate: 'bg-blue-100 text-blue-700',
    individual: 'bg-green-100 text-green-700',
    government: 'bg-indigo-100 text-indigo-700',
    'non-profit': 'bg-teal-100 text-teal-700',
    referral: 'bg-yellow-100 text-yellow-700',
    'high-value': 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-law-sm text-law-xs font-medium ${colors[tag]}`}>
      {tag.replace('-', ' ').toUpperCase()}
    </span>
  );
}
