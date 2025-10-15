"use client";

/**
 * Properties List - Redesigned with Design System 2.0
 */

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Plus, Upload, Share2, Eye, Edit } from "lucide-react";
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
            <div className="flex flex-wrap gap-4 items-center">
              {/* Transaction Type Filter */}
              <div className="flex items-center gap-2">
                <label className="text-body-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'he' ? 'סוג עסקה:' : 'Transaction Type:'}
                </label>
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value as 'ALL' | 'SALE' | 'RENT')}
                  className="px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
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
                    className="px-4 py-2 bg-white dark:bg-[#1A2F4B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                  >
                    <option value="ALL">{language === 'he' ? 'כל הסוכנים' : 'All Agents'}</option>
                    <option value="UNASSIGNED">{language === 'he' ? 'לא מוקצה' : 'Unassigned'}</option>
                    {/* TODO: Fetch and populate actual agents from organization */}
                  </select>
                </div>
              )}

              <div className="ml-auto text-body-sm text-gray-600 dark:text-gray-400">
                {filteredProperties.length} {language === 'he' ? 'נכסים' : 'properties'}
              </div>
            </div>
          </CardBody>
        </UniversalCard>

        {/* Properties Table */}
        <UniversalCard variant="default">
          <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
            <h2 className="text-heading-4 text-gray-900 dark:text-white">
              {language === 'he' ? 'רשימת נכסים' : 'Properties List'}
            </h2>
          </CardHeader>
          <UniversalTable>
            <UniversalTableHeader>
              <UniversalTableRow>
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
    </main>
  );
}
