"use client";

/**
 * Properties List - Redesigned with Design System 2.0
 */

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Plus, Upload, Share2, Eye, Edit, Filter, CheckSquare, Square, Download, Trash2 } from "lucide-react";
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
  type BulkAction,
} from "@/components/shared";
import { PropertyAdGenerator } from "@/components/real-estate/PropertyAdGenerator";
import { PropertyFormModal } from "@/components/real-estate/properties/PropertyFormModal";
import { ImportPropertiesModal } from "@/components/real-estate/ImportPropertiesModal";
import { ScoreBadge } from "@/components/real-estate/ScoreBadge";
import { AssignAgentButton } from "@/components/real-estate/AssignAgentButton";
import { SharePropertyModal } from "@/components/real-estate/properties/SharePropertyModal";
import { useLanguage } from "@/lib/language-context";

export default function PropertiesClient({ initialData }: { initialData: any[] }) {
  const { language } = useLanguage();
  const [properties, setProperties] = useState(initialData);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showAdGenerator, setShowAdGenerator] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [sharingProperty, setSharingProperty] = useState<any>(null);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'ALL' | 'SALE' | 'RENT'>('ALL');
  const [assignedAgentFilter, setAssignedAgentFilter] = useState<string>('ALL');
  const [accountType, setAccountType] = useState<'COMPANY' | 'FREELANCER'>('COMPANY'); // TODO: Get from auth context
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [tempTransactionTypeFilter, setTempTransactionTypeFilter] = useState<'ALL' | 'SALE' | 'RENT'>('ALL');
  const [tempAssignedAgentFilter, setTempAssignedAgentFilter] = useState<string>('ALL');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());

  // Filter properties by transaction type and assigned agent
  const filteredProperties = properties.filter(property => {
    // Transaction type filter
    if (transactionTypeFilter !== 'ALL' && property.transactionType !== transactionTypeFilter) {
      return false;
    }

    // Assigned agent filter (Company only)
    if (accountType === 'COMPANY' && assignedAgentFilter !== 'ALL') {
      if (assignedAgentFilter === 'UNASSIGNED') {
        return !property.assignedAgentId;
      }
      return property.assignedAgentId === assignedAgentFilter;
    }

    return true;
  });

  const handleGenerateAd = (property: any) => {
    setSelectedProperty(property);
    setShowAdGenerator(true);
  };

  const handleCloseAdGenerator = () => {
    setShowAdGenerator(false);
    setSelectedProperty(null);
  };

  const handleCreateProperty = () => {
    setEditingProperty(null);
    setShowPropertyForm(true);
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handlePropertySaved = (savedProperty: any) => {
    if (editingProperty) {
      // Update existing property
      setProperties(prev => prev.map(p => p.id === savedProperty.id ? savedProperty : p));
    } else {
      // Add new property
      setProperties(prev => [savedProperty, ...prev]);
    }
  };

  // Filter drawer handlers
  const handleOpenFilterDrawer = () => {
    setTempTransactionTypeFilter(transactionTypeFilter);
    setTempAssignedAgentFilter(assignedAgentFilter);
    setShowFilterDrawer(true);
  };

  const handleResetFilters = () => {
    setTempTransactionTypeFilter('ALL');
    setTempAssignedAgentFilter('ALL');
  };

  const handleApplyFilters = () => {
    setTransactionTypeFilter(tempTransactionTypeFilter);
    setAssignedAgentFilter(tempAssignedAgentFilter);
    setShowFilterDrawer(false);
  };

  const handleImportComplete = () => {
    // Refresh properties list - in real app, fetch from API
    console.log('Import complete, refreshing properties list');
    // TODO: Fetch updated properties from API
  };

  const handleAgentAssigned = (propertyId: string, agentId: string | null, agentName: string | null) => {
    // Update property in local state immediately (no page reload)
    setProperties(prev => prev.map(p =>
      p.id === propertyId
        ? { ...p, assignedAgentId: agentId, assignedAgentName: agentName }
        : p
    ));
  };

  const handleShareProperty = (property: any) => {
    setSharingProperty(property);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSharingProperty(null);
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedProperties.size === filteredProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(filteredProperties.map(p => p.id)));
    }
  };

  const handleSelectProperty = (id: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProperties(newSelected);
  };

  // Bulk actions
  const handleBulkExport = () => {
    console.log('Bulk export:', Array.from(selectedProperties));
    // TODO: Implement bulk export
    setSelectedProperties(new Set());
  };

  const handleBulkShare = () => {
    console.log('Bulk share:', Array.from(selectedProperties));
    // TODO: Implement bulk share
    setSelectedProperties(new Set());
  };

  const handleBulkArchive = () => {
    console.log('Bulk archive:', Array.from(selectedProperties));
    // TODO: Implement bulk archive
    setSelectedProperties(new Set());
  };

  const t = {
    selected: language === 'he' ? 'נבחרו' : 'selected',
    bulkExport: language === 'he' ? 'ייצא לקובץ' : 'Export',
    bulkShare: language === 'he' ? 'שתף' : 'Share',
    archive: language === 'he' ? 'העבר לארכיון' : 'Archive',
    view: language === 'he' ? 'צפייה' : 'View',
    edit: language === 'he' ? 'עריכה' : 'Edit',
    generateAd: language === 'he' ? 'AI' : 'AI',
  };

  return (
    <main className={`min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 text-gray-900 dark:text-white">
              {language === 'he' ? 'נכסים' : 'Properties'}
            </h1>
            <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
              {language === 'he' ? 'נהל את תיק הנכסים שלך' : 'Manage your property portfolio'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <UniversalButton
              variant="outline"
              size="md"
              leftIcon={<Upload className="w-5 h-5" />}
              onClick={() => setShowImportModal(true)}
            >
              {language === 'he' ? 'ייבוא CSV' : 'Import CSV'}
            </UniversalButton>

            <UniversalButton
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-5 h-5" />}
              onClick={handleCreateProperty}
            >
              {language === 'he' ? 'נכס חדש' : 'New Property'}
            </UniversalButton>
          </div>
        </div>

        {/* Filters */}
        <UniversalCard variant="default">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Desktop Filters - Hidden on mobile */}
              <div className="hidden sm:flex flex-wrap gap-4 items-center flex-1">
                {/* Transaction Type Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-body-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'he' ? 'סוג עסקה:' : 'Transaction Type:'}
                  </label>
                  <select
                    value={transactionTypeFilter}
                    onChange={(e) => setTransactionTypeFilter(e.target.value as 'ALL' | 'SALE' | 'RENT')}
                    className="px-4 py-2.5 min-h-[44px] bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                  >
                    <option value="ALL">{language === 'he' ? 'כל הנכסים' : 'All Properties'}</option>
                    <option value="SALE">{language === 'he' ? 'למכירה' : 'For Sale'}</option>
                    <option value="RENT">{language === 'he' ? 'להשכרה' : 'For Rent'}</option>
                  </select>
                </div>

                {/* Assigned Agent Filter (Company only) */}
                {accountType === 'COMPANY' && (
                  <div className="flex items-center gap-2">
                    <label className="text-body-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'he' ? 'סוכן מוקצה:' : 'Assigned Agent:'}
                    </label>
                    <select
                      value={assignedAgentFilter}
                      onChange={(e) => setAssignedAgentFilter(e.target.value)}
                      className="px-4 py-2.5 min-h-[44px] bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                    >
                      <option value="ALL">{language === 'he' ? 'כל הסוכנים' : 'All Agents'}</option>
                      <option value="UNASSIGNED">{language === 'he' ? 'לא מוקצה' : 'Unassigned'}</option>
                      {/* TODO: Fetch and populate actual agents from organization */}
                    </select>
                  </div>
                )}
              </div>

              {/* Mobile Filter Button - Only visible on small screens */}
              <div className="sm:hidden w-full">
                <UniversalButton
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFilterDrawer}
                  leftIcon={<Filter className="w-5 h-5" />}
                  fullWidth
                  className="!min-h-[44px]"
                >
                  {language === 'he' ? 'סינון' : 'Filters'}
                  {(transactionTypeFilter !== 'ALL' || assignedAgentFilter !== 'ALL') && (
                    <span className="ml-2 px-2 py-0.5 bg-[#2979FF] text-white rounded-full text-xs font-semibold">
                      {[transactionTypeFilter !== 'ALL', assignedAgentFilter !== 'ALL'].filter(Boolean).length}
                    </span>
                  )}
                </UniversalButton>
              </div>

              {/* Bulk Actions Menu */}
              <BulkActionsMenu
                selectedCount={selectedProperties.size}
                title={`${selectedProperties.size} ${t.selected}`}
                actions={[
                  {
                    id: 'export',
                    label: t.bulkExport,
                    icon: <Download className="w-4 h-4" />,
                    onClick: handleBulkExport,
                  },
                  {
                    id: 'share',
                    label: t.bulkShare,
                    icon: <Share2 className="w-4 h-4" />,
                    onClick: handleBulkShare,
                  },
                  {
                    id: 'archive',
                    label: t.archive,
                    icon: <Trash2 className="w-4 h-4" />,
                    variant: 'danger' as const,
                    onClick: handleBulkArchive,
                  },
                ]}
              />

              {/* Properties Count */}
              <div className="ml-auto text-body-sm text-gray-600 dark:text-gray-400">
                {filteredProperties.length} {language === 'he' ? 'נכסים' : 'properties'}
              </div>
            </div>
          </CardBody>
        </UniversalCard>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => {
              const transactionType = property.transactionType || 'SALE';
              const isSale = transactionType === 'SALE';

              return (
                <UniversalCard key={property.id} variant="default" className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSelectProperty(property.id)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] transition-colors"
                        aria-label={language === 'he' ? 'בחר נכס' : 'Select property'}
                      >
                        {selectedProperties.has(property.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#2979FF]" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{property.city || '-'}</p>
                      </div>
                    </div>
                    <StatusBadge
                      status={isSale ? 'active' : 'pending'}
                      className={isSale ? '!bg-blue-100 !text-blue-700' : '!bg-green-100 !text-green-700'}
                    >
                      {isSale
                        ? (language === 'he' ? 'למכירה' : 'Sale')
                        : (language === 'he' ? 'להשכרה' : 'Rent')
                      }
                    </StatusBadge>
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {isSale ? (
                        property.price ? `₪${property.price.toLocaleString()}` : '-'
                      ) : (
                        property.rentPriceMonthly
                          ? `₪${property.rentPriceMonthly.toLocaleString()}${language === 'he' ? '/חודש' : '/mo'}`
                          : '-'
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">{language === 'he' ? 'ציון:' : 'Score:'}</span>
                      <ScoreBadge property={property} language={language as 'en' | 'he'} size="sm" />
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{language === 'he' ? 'סטטוס: ' : 'Status: '}</span>
                      <StatusBadge status="completed">{property.status}</StatusBadge>
                    </div>
                    {accountType === 'COMPANY' && (
                      <div className="pt-1">
                        <AssignAgentButton
                          propertyId={property.id}
                          currentAgentId={property.assignedAgentId}
                          currentAgentName={property.assignedAgentName}
                          onAssignSuccess={(agentId, agentName) => handleAgentAssigned(property.id, agentId, agentName)}
                          accountType={accountType}
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/real-estate/properties/${property.id}`} className="flex-1">
                      <UniversalButton
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        className="w-full !min-h-[44px]"
                      >
                        {t.view}
                      </UniversalButton>
                    </Link>
                    <UniversalButton
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit className="w-4 h-4" />}
                      onClick={() => handleEditProperty(property)}
                      className="flex-1 !min-h-[44px]"
                    >
                      {t.edit}
                    </UniversalButton>
                    <UniversalButton
                      variant="primary"
                      size="sm"
                      leftIcon={<Sparkles className="w-4 h-4" />}
                      onClick={() => handleGenerateAd(property)}
                      className="w-full !min-h-[44px] !bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      {t.generateAd}
                    </UniversalButton>
                  </div>
                </UniversalCard>
              );
            })
          ) : (
            <UniversalCard variant="default" className="p-8 text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'he' ? 'אין נכסים' : 'No Properties'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {language === 'he'
                  ? 'לחץ "נכס חדש" כדי להוסיף את הנכס הראשון שלך'
                  : 'Click "New Property" to add your first property'}
              </p>
              <UniversalButton
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={handleCreateProperty}
              >
                {language === 'he' ? 'נכס חדש' : 'New Property'}
              </UniversalButton>
            </UniversalCard>
          )}
        </div>

        {/* Desktop Properties Table */}
        <UniversalCard variant="default" className="hidden sm:block">
          <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
            <h2 className="text-heading-4 text-gray-900 dark:text-white">
              {language === 'he' ? 'רשימת נכסים' : 'Properties List'}
            </h2>
          </CardHeader>
          <UniversalTable>
            <UniversalTableHeader>
              <UniversalTableRow>
                <UniversalTableHead className="w-12">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] transition-colors"
                    aria-label={language === 'he' ? 'בחר הכל' : 'Select all'}
                  >
                    {selectedProperties.size === filteredProperties.length && filteredProperties.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-[#2979FF]" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </UniversalTableHead>
                <UniversalTableHead>{language === 'he' ? 'שם' : 'Name'}</UniversalTableHead>
                <UniversalTableHead>{language === 'he' ? 'עיר' : 'City'}</UniversalTableHead>
                <UniversalTableHead>{language === 'he' ? 'סוג' : 'Type'}</UniversalTableHead>
                <UniversalTableHead>{language === 'he' ? 'מחיר' : 'Price'}</UniversalTableHead>
                <UniversalTableHead>{language === 'he' ? 'ציון' : 'Score'}</UniversalTableHead>
                {accountType === 'COMPANY' && (
                  <UniversalTableHead>{language === 'he' ? 'סוכן' : 'Agent'}</UniversalTableHead>
                )}
                <UniversalTableHead>{language === 'he' ? 'סטטוס' : 'Status'}</UniversalTableHead>
                <UniversalTableHead>{language === 'he' ? 'פורסם' : 'Published'}</UniversalTableHead>
                <UniversalTableHead>{language === 'he' ? 'פעולות' : 'Actions'}</UniversalTableHead>
              </UniversalTableRow>
            </UniversalTableHeader>
            <UniversalTableBody>
              {filteredProperties.length > 0 ? (
                filteredProperties.map((r) => {
                  const transactionType = r.transactionType || 'SALE';
                  const isSale = transactionType === 'SALE';

                  return (
                    <UniversalTableRow key={r.id} hoverable>
                      <UniversalTableCell>
                        <button
                          onClick={() => handleSelectProperty(r.id)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] transition-colors"
                          aria-label={language === 'he' ? 'בחר נכס' : 'Select property'}
                        >
                          {selectedProperties.has(r.id) ? (
                            <CheckSquare className="w-5 h-5 text-[#2979FF]" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </UniversalTableCell>
                      <UniversalTableCell className="font-semibold">{r.name}</UniversalTableCell>
                      <UniversalTableCell>{r.city || "-"}</UniversalTableCell>
                      <UniversalTableCell>
                        <StatusBadge
                          status={isSale ? 'active' : 'pending'}
                          className={isSale ? '!bg-blue-100 !text-blue-700' : '!bg-green-100 !text-green-700'}
                        >
                          {isSale
                            ? (language === 'he' ? 'למכירה' : 'For Sale')
                            : (language === 'he' ? 'להשכרה' : 'For Rent')
                          }
                        </StatusBadge>
                      </UniversalTableCell>
                      <UniversalTableCell className="font-semibold">
                        {isSale ? (
                          r.price ? `₪${r.price.toLocaleString()}` : '-'
                        ) : (
                          r.rentPriceMonthly
                            ? `₪${r.rentPriceMonthly.toLocaleString()}${language === 'he' ? '/חודש' : '/mo'}`
                            : '-'
                        )}
                      </UniversalTableCell>
                      <UniversalTableCell>
                        <ScoreBadge property={r} language={language as 'en' | 'he'} size="sm" />
                      </UniversalTableCell>
                      {accountType === 'COMPANY' && (
                        <UniversalTableCell>
                          <AssignAgentButton
                            propertyId={r.id}
                            currentAgentId={r.assignedAgentId}
                            currentAgentName={r.assignedAgentName}
                            onAssignSuccess={(agentId, agentName) => handleAgentAssigned(r.id, agentId, agentName)}
                            accountType={accountType}
                            className="text-xs"
                          />
                        </UniversalTableCell>
                      )}
                      <UniversalTableCell>
                        <StatusBadge status="completed">{r.status}</StatusBadge>
                      </UniversalTableCell>
                      <UniversalTableCell>
                        {r.publishedAt
                          ? new Date(r.publishedAt).toLocaleDateString("he-IL")
                          : "-"}
                      </UniversalTableCell>
                      <UniversalTableCell>
                        <div className="flex gap-2">
                          <UniversalButton
                            variant="primary"
                            size="sm"
                            leftIcon={<Sparkles className="w-4 h-4" />}
                            onClick={() => handleGenerateAd(r)}
                            className="!bg-gradient-to-r from-purple-600 to-blue-600"
                          >
                            AI
                          </UniversalButton>
                          <UniversalButton
                            variant="ghost"
                            size="sm"
                            leftIcon={<Share2 className="w-4 h-4" />}
                            onClick={() => handleShareProperty(r)}
                          >
                            {language === 'he' ? 'שתף' : 'Share'}
                          </UniversalButton>
                          <Link href={`/dashboard/real-estate/properties/${r.id}`}>
                            <UniversalButton variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                              {language === 'he' ? 'צפייה' : 'View'}
                            </UniversalButton>
                          </Link>
                          <UniversalButton
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit className="w-4 h-4" />}
                            onClick={() => handleEditProperty(r)}
                          >
                            {language === 'he' ? 'עריכה' : 'Edit'}
                          </UniversalButton>
                        </div>
                      </UniversalTableCell>
                    </UniversalTableRow>
                  );
                })
              ) : (
                <TableEmptyState
                  icon={<Plus className="w-12 h-12" />}
                  title={language === 'he' ? 'אין נכסים' : 'No Properties'}
                  description={language === 'he'
                    ? 'לחץ "נכס חדש" כדי להוסיף את הנכס הראשון שלך'
                    : 'Click "New Property" to add your first property'}
                  action={
                    <UniversalButton
                      variant="primary"
                      size="md"
                      leftIcon={<Plus className="w-5 h-5" />}
                      onClick={handleCreateProperty}
                    >
                      {language === 'he' ? 'נכס חדש' : 'New Property'}
                    </UniversalButton>
                  }
                />
              )}
            </UniversalTableBody>
          </UniversalTable>
        </UniversalCard>
      </div>

      {/* Ad Generator Modal */}
      {showAdGenerator && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PropertyAdGenerator
            property={selectedProperty}
            onClose={handleCloseAdGenerator}
          />
        </div>
      )}

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={showPropertyForm}
        onClose={() => {
          setShowPropertyForm(false);
          setEditingProperty(null);
        }}
        onSuccess={handlePropertySaved}
        property={editingProperty}
      />

      {/* Import Properties Modal */}
      {showImportModal && (
        <ImportPropertiesModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}

      {/* Share Property Modal */}
      {showShareModal && sharingProperty && (
        <SharePropertyModal
          isOpen={showShareModal}
          property={sharingProperty}
          onClose={handleCloseShareModal}
        />
      )}

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        title={language === 'he' ? 'סינון' : 'Filters'}
        resetLabel={language === 'he' ? 'אפס סינון' : 'Reset'}
        applyLabel={language === 'he' ? 'החל סינון' : 'Apply'}
        width="sm"
      >
        <div className="space-y-6">
          {/* Transaction Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {language === 'he' ? 'סוג עסקה' : 'Transaction Type'}
            </label>
            <select
              value={tempTransactionTypeFilter}
              onChange={(e) => setTempTransactionTypeFilter(e.target.value as 'ALL' | 'SALE' | 'RENT')}
              className="w-full px-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all"
            >
              <option value="ALL">{language === 'he' ? 'כל הנכסים' : 'All Properties'}</option>
              <option value="SALE">{language === 'he' ? 'למכירה' : 'For Sale'}</option>
              <option value="RENT">{language === 'he' ? 'להשכרה' : 'For Rent'}</option>
            </select>
          </div>

          {/* Assigned Agent Filter (Company only) */}
          {accountType === 'COMPANY' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'he' ? 'סוכן מוקצה' : 'Assigned Agent'}
              </label>
              <select
                value={tempAssignedAgentFilter}
                onChange={(e) => setTempAssignedAgentFilter(e.target.value)}
                className="w-full px-4 py-2.5 min-h-[44px] rounded-lg border border-gray-300 dark:border-[#2979FF]/20 bg-white dark:bg-[#1A2F4B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all"
              >
                <option value="ALL">{language === 'he' ? 'כל הסוכנים' : 'All Agents'}</option>
                <option value="UNASSIGNED">{language === 'he' ? 'לא מוקצה' : 'Unassigned'}</option>
                {/* TODO: Fetch and populate actual agents from organization */}
              </select>
            </div>
          )}

          {/* Active Filters Display */}
          {(tempTransactionTypeFilter !== 'ALL' || tempAssignedAgentFilter !== 'ALL') && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === 'he' ? 'סינונים פעילים:' : 'Active Filters:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {tempTransactionTypeFilter !== 'ALL' && (
                  <span className="px-3 py-1 bg-[#2979FF]/10 text-[#2979FF] rounded-full text-sm font-medium">
                    {language === 'he' ? 'סוג: ' : 'Type: '}
                    {tempTransactionTypeFilter === 'SALE'
                      ? (language === 'he' ? 'למכירה' : 'Sale')
                      : (language === 'he' ? 'להשכרה' : 'Rent')
                    }
                  </span>
                )}
                {tempAssignedAgentFilter !== 'ALL' && (
                  <span className="px-3 py-1 bg-[#2979FF]/10 text-[#2979FF] rounded-full text-sm font-medium">
                    {language === 'he' ? 'סוכן: ' : 'Agent: '}
                    {tempAssignedAgentFilter === 'UNASSIGNED'
                      ? (language === 'he' ? 'לא מוקצה' : 'Unassigned')
                      : tempAssignedAgentFilter
                    }
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </main>
  );
}
