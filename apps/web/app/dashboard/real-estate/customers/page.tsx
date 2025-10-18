'use client';

/**
 * Real Estate - Customers (CRM-lite)
 * Manage real estate leads as customers
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
  Home,
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
  email: string;
  phone: string;
  linkedProperties: number;
  tags: string[];
  notes?: string;
  lastContact?: string;
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
        ? 'נהל את הלקוחות והלידים שלך'
        : 'Manage your customers and leads',
    create: language === 'he' ? 'לקוח חדש' : 'New Customer',
    search:
      language === 'he'
        ? 'חיפוש לפי שם, אימייל או טלפון...'
        : 'Search by name, email, or phone...',
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
        ? 'התחל על ידי הוספת הלקוח הראשון שלך או ייבא לידים'
        : 'Start by adding your first customer or importing leads',
    noResults: language === 'he' ? 'לא נמצאו תוצאות' : 'No results found',
    name: language === 'he' ? 'שם' : 'Name',
    contact: language === 'he' ? 'איש קשר' : 'Contact',
    tags: language === 'he' ? 'תגיות' : 'Tags',
    linkedProperties: language === 'he' ? 'נכסים מקושרים' : 'Linked Properties',
    lastContact: language === 'he' ? 'קשר אחרון' : 'Last Contact',
    actions: language === 'he' ? 'פעולות' : 'Actions',
  };

  useEffect(() => {
    fetchCustomers();
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

      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/real-estate/leads?includeProperties=true');
      // const data = await response.json();

      // Mock data for demonstration - mapping leads to customers
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'David Cohen',
          email: 'david.cohen@example.com',
          phone: '+972-50-123-4567',
          linkedProperties: 2,
          tags: ['vip', 'hot-lead'],
          notes: 'Interested in luxury properties',
          lastContact: new Date(Date.now() - 86400000 * 2).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
        {
          id: '2',
          name: 'Sarah Levi',
          email: 'sarah.levi@example.com',
          phone: '+972-54-987-6543',
          linkedProperties: 1,
          tags: ['qualified', 'nurture'],
          notes: 'Looking for family apartment',
          lastContact: new Date(Date.now() - 86400000 * 5).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        },
        {
          id: '3',
          name: 'Michael Green',
          email: 'michael.green@example.com',
          phone: '+972-52-555-1234',
          linkedProperties: 0,
          tags: ['cold-lead'],
          lastContact: new Date(Date.now() - 86400000 * 15).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        },
      ];

      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
      setFilteredCustomers([]);
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
          customer.email.toLowerCase().includes(query) ||
          customer.phone.includes(query)
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((customer) =>
        selectedTags.some((tag) => customer.tags.includes(tag))
      );
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'he' ? 'he-IL' : 'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
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
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all"
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
                    <span className="ml-2 px-2 py-0.5 bg-[#2979FF] text-white rounded-full text-xs font-semibold">
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
                    icon: <Trash2 className="w-4 h-4" />,
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
            icon={<Home className="w-12 h-12" />}
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
                          <CheckSquare className="w-5 h-5 text-[#2979FF]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400" dir="ltr">
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Home className="w-4 h-4" />
                      {customer.linkedProperties} {language === 'he' ? 'נכסים' : 'properties'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.map((tag) => (
                        <StatusBadge
                          key={tag}
                          status="active"
                          className="!bg-[#2979FF]/10 !text-[#2979FF] text-xs"
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
                        {selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0 ? (
                          <CheckSquare className="w-5 h-5 text-[#2979FF]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </UniversalTableHead>
                    <UniversalTableHead>{t.name}</UniversalTableHead>
                    <UniversalTableHead>{t.contact}</UniversalTableHead>
                    <UniversalTableHead>{t.tags}</UniversalTableHead>
                    <UniversalTableHead>{t.linkedProperties}</UniversalTableHead>
                    <UniversalTableHead>{t.lastContact}</UniversalTableHead>
                    <UniversalTableHead>{t.actions}</UniversalTableHead>
                  </UniversalTableRow>
                </UniversalTableHeader>
                <UniversalTableBody>
                  {filteredCustomers.map((customer) => (
                    <UniversalTableRow key={customer.id} hoverable>
                      <UniversalTableCell>
                        <button onClick={() => handleSelectCustomer(customer.id)}>
                          {selectedCustomers.has(customer.id) ? (
                            <CheckSquare className="w-5 h-5 text-[#2979FF]" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </UniversalTableCell>
                      <UniversalTableCell className="font-medium">
                        {customer.name}
                      </UniversalTableCell>
                      <UniversalTableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400" dir="ltr">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </UniversalTableCell>
                      <UniversalTableCell>
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.map((tag) => (
                            <StatusBadge
                              key={tag}
                              status="active"
                              className="!bg-[#2979FF]/10 !text-[#2979FF]"
                            >
                              {tag}
                            </StatusBadge>
                          ))}
                        </div>
                      </UniversalTableCell>
                      <UniversalTableCell className="font-semibold text-[#2979FF]">
                        {customer.linkedProperties || 0}
                      </UniversalTableCell>
                      <UniversalTableCell>
                        {customer.lastContact ? formatDate(customer.lastContact) : '-'}
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
              {['vip', 'hot-lead', 'warm-lead', 'cold-lead', 'qualified', 'nurture'].map(
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
                        ? 'bg-[#2979FF] text-white'
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A2F4B] rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.create}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {language === 'he'
                ? 'טופס יצירת לקוח יתווסף בהמשך. כרגע ניתן להוסיף לקוחות דרך מסך הלידים.'
                : 'Customer creation form will be implemented in the next iteration. For now, customers can be added through the Leads screen.'}
            </p>
            <div className="flex justify-end gap-3">
              <UniversalButton
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                {language === 'he' ? 'סגור' : 'Close'}
              </UniversalButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
