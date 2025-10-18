'use client';

/**
 * Creative Productions - Customers (CRM-lite)
 * Mirrors Real Estate Leads UI patterns
 */

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  CheckSquare,
  Square,
  Building2,
  Mail,
  Phone,
  Tag,
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

interface Customer {
  id: string;
  name: string;
  company?: string;
  emails: string[];
  phones: string[];
  tags: string[];
  notes?: string;
  projectCount?: number;
  lastActivity?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const { language } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
    new Set()
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    title: language === 'he' ? 'ניהול לקוחות' : 'Customer Management',
    subtitle:
      language === 'he'
        ? 'נהל את הלקוחות של הפקות יצירתיות'
        : 'Manage your creative production clients',
    create: language === 'he' ? 'לקוח חדש' : 'New Customer',
    search:
      language === 'he'
        ? 'חיפוש לפי שם, חברה או אימייל...'
        : 'Search by name, company, or email...',
    filters: language === 'he' ? 'סינון' : 'Filters',
    resetFilters: language === 'he' ? 'אפס סינון' : 'Reset',
    applyFilters: language === 'he' ? 'החל סינון' : 'Apply',
    selected: language === 'he' ? 'נבחרו' : 'selected',
    bulkArchive: language === 'he' ? 'העבר לארכיון' : 'Archive',
    view: language === 'he' ? 'צפייה' : 'View',
    edit: language === 'he' ? 'עריכה' : 'Edit',
    emptyTitle: language === 'he' ? 'אין לקוחות עדיין' : 'No customers yet',
    emptyDescription:
      language === 'he'
        ? 'התחל על ידי הוספת הלקוח הראשון שלך'
        : 'Start by adding your first client',
    noResults: language === 'he' ? 'לא נמצאו תוצאות' : 'No results found',
    name: language === 'he' ? 'שם' : 'Name',
    company: language === 'he' ? 'חברה' : 'Company',
    contact: language === 'he' ? 'איש קשר' : 'Contact',
    tags: language === 'he' ? 'תגיות' : 'Tags',
    projects: language === 'he' ? 'פרויקטים' : 'Projects',
    lastActivity: language === 'he' ? 'פעילות אחרונה' : 'Last Activity',
    actions: language === 'he' ? 'פעולות' : 'Actions',
  };

  useEffect(() => {
    fetchCustomers();

    // Track page view
    import('@/lib/analytics/ga4').then(({ pageViewed }) => {
      pageViewed('customers', { page_type: 'list' });
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedTags, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { customersApi } = await import('@/lib/api/creative-productions');
      const data = await customersApi.list();

      // Map API response to component interface
      setCustomers(
        data.map((client) => ({
          id: client.id,
          name: client.name,
          company: client.company,
          emails: client.emails,
          phones: client.phones,
          tags: client.tags,
          notes: client.notes,
          projectCount: client._count?.projects || 0,
          lastActivity: client.updatedAt,
          createdAt: client.createdAt,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Fallback to empty array on error
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...customers];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.company?.toLowerCase().includes(query) ||
          customer.emails.some((email) => email.toLowerCase().includes(query))
      );

      // Track search event
      import('@/lib/analytics/ga4').then(({ customerEvents }) => {
        customerEvents.searched(searchQuery, filtered.length);
      });
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((customer) =>
        selectedTags.some((tag) => customer.tags.includes(tag))
      );

      // Track filter event
      import('@/lib/analytics/ga4').then(({ customerEvents }) => {
        customerEvents.filtered(selectedTags);
      });
    }

    setFilteredCustomers(filtered);
  }, [searchQuery, selectedTags, customers]);

  const handleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(filteredCustomers.map((c) => c.id)));
    }
  };

  const handleSelectCustomer = (id: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCustomers(newSelected);
  };

  const handleOpenFilterDrawer = () => {
    setTempSelectedTags(selectedTags);
    setShowFilterDrawer(true);
  };

  const handleResetFilters = () => {
    setTempSelectedTags([]);
  };

  const handleApplyFilters = () => {
    setSelectedTags(tempSelectedTags);
    setShowFilterDrawer(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8 ${
        language === 'he' ? 'rtl' : 'ltr'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
              {t.subtitle}
            </p>
          </div>
          <UniversalButton
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowCreateModal(true)}
            className="!bg-gradient-to-r from-orange-600 to-purple-600"
          >
            {t.create}
          </UniversalButton>
        </div>

        {/* Filters */}
        <UniversalCard variant="default">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Filter Button */}
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
                  {selectedTags.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white rounded-full text-xs font-semibold">
                      {selectedTags.length}
                    </span>
                  )}
                </UniversalButton>
              </div>

              {/* Bulk Actions */}
              <BulkActionsMenu
                selectedCount={selectedCustomers.size}
                title={`${selectedCustomers.size} ${t.selected}`}
                actions={[
                  {
                    id: 'archive',
                    label: t.bulkArchive,
                    icon: <Trash2 className="w-4 h-4" />,'
                    variant: 'danger' as const,
                    onClick: () => console.log('Bulk archive'),
                  },
                ]}
              />
            </div>
          </CardBody>
        </UniversalCard>

        {/* Customers Table/Cards */}
        {filteredCustomers.length === 0 ? (
          <TableEmptyState
            icon={<Users className="w-12 h-12" />}
            title={customers.length === 0 ? t.emptyTitle : t.noResults}
            description={
              customers.length === 0
                ? t.emptyDescription
                : 'Try adjusting your filters'
            }
            action={
              customers.length === 0 ? (
                <UniversalButton
                  variant="primary"
                  size="md"
                  leftIcon={<Plus />}
                  onClick={() => setShowCreateModal(true)}
                  className="!bg-gradient-to-r from-orange-600 to-purple-600"
                >
                  {t.create}
                </UniversalButton>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {filteredCustomers.map((customer) => (
                <UniversalCard key={customer.id} variant="default" className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleSelectCustomer(customer.id)}>
                        {selectedCustomers.has(customer.id) ? (
                          <CheckSquare className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.name}
                        </h3>
                        {customer.company && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {customer.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      {customer.emails[0]}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      {customer.phones[0]}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.map((tag) => (
                        <StatusBadge
                          key={tag}
                          status="active"
                          className="!bg-orange-100 !text-orange-700 text-xs"
                        >
                          {tag}
                        </StatusBadge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <UniversalButton
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                      className="flex-1 !min-h-[44px]"
                    >
                      {t.view}
                    </UniversalButton>
                    <UniversalButton
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit className="w-4 h-4" />}
                      className="flex-1 !min-h-[44px]"
                    >
                      {t.edit}
                    </UniversalButton>
                  </div>
                </UniversalCard>
              ))}
            </div>

            {/* Desktop Table View */}
            <UniversalCard variant="default" className="hidden sm:block">
              <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
                <h2 className="text-heading-4 text-gray-900 dark:text-white">
                  {language === 'he' ? 'רשימת לקוחות' : 'Customers List'}
                </h2>
              </CardHeader>
              <UniversalTable>
                <UniversalTableHeader>
                  <UniversalTableRow>
                    <UniversalTableHead>
                      <button onClick={handleSelectAll}>
                        {selectedCustomers.size === filteredCustomers.length ? (
                          <CheckSquare className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </UniversalTableHead>
                    <UniversalTableHead>{t.name}</UniversalTableHead>
                    <UniversalTableHead>{t.company}</UniversalTableHead>
                    <UniversalTableHead>{t.contact}</UniversalTableHead>
                    <UniversalTableHead>{t.tags}</UniversalTableHead>
                    <UniversalTableHead>{t.projects}</UniversalTableHead>
                    <UniversalTableHead>{t.actions}</UniversalTableHead>
                  </UniversalTableRow>
                </UniversalTableHeader>
                <UniversalTableBody>
                  {filteredCustomers.map((customer) => (
                    <UniversalTableRow key={customer.id} hoverable>
                      <UniversalTableCell>
                        <button onClick={() => handleSelectCustomer(customer.id)}>
                          {selectedCustomers.has(customer.id) ? (
                            <CheckSquare className="w-5 h-5 text-orange-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </UniversalTableCell>
                      <UniversalTableCell className="font-medium">
                        {customer.name}
                      </UniversalTableCell>
                      <UniversalTableCell>
                        {customer.company || '-'}
                      </UniversalTableCell>
                      <UniversalTableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Mail className="w-3 h-3" />
                            {customer.emails[0]}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            {customer.phones[0]}
                          </div>
                        </div>
                      </UniversalTableCell>
                      <UniversalTableCell>
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.map((tag) => (
                            <StatusBadge
                              key={tag}
                              status="active"
                              className="!bg-orange-100 !text-orange-700"
                            >
                              {tag}
                            </StatusBadge>
                          ))}
                        </div>
                      </UniversalTableCell>
                      <UniversalTableCell className="font-semibold text-orange-600">
                        {customer.projectCount || 0}
                      </UniversalTableCell>
                      <UniversalTableCell>
                        <div className="flex gap-2">
                          <UniversalButton
                            variant="ghost"
                            size="sm"
                            className="!p-1.5"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </UniversalButton>
                          <UniversalButton
                            variant="ghost"
                            size="sm"
                            className="!p-1.5"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </UniversalButton>
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

      {/* Filter Drawer */}
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.tags}
            </label>
            <div className="flex flex-wrap gap-2">
              {['vip', 'enterprise', 'startup', 'agency', 'recurring'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (tempSelectedTags.includes(tag)) {
                        setTempSelectedTags(
                          tempSelectedTags.filter((t) => t !== tag)
                        );
                      } else {
                        setTempSelectedTags([...tempSelectedTags, tag]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      tempSelectedTags.includes(tag)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Create Modal (Placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1A2F4B] rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.create}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Customer creation form will be implemented in the next iteration.
            </p>
            <div className="flex justify-end gap-3">
              <UniversalButton
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Close
              </UniversalButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
