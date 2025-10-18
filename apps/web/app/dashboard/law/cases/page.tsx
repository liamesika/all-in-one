'use client';

/**
 * Law Cases Page
 * Displays all cases with filtering, search, and CRUD operations
 * Features: Real API integration, CaseModal for create/edit
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { CaseStatusBadge } from '@/components/law/CaseStatusBadge';
import { PriorityBadge } from '@/components/law/PriorityBadge';
import { CaseModal } from '@/components/law/modals';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';
import { Search, Plus, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  client: { id: string; name: string } | null;
  attorney: { id: string; name: string } | null;
  caseType: string;
  status: 'active' | 'pending' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  nextHearingDate?: string;
  filingDate?: string;
}

export default function LawCasesPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | undefined>();

  useEffect(() => {
    loadCases();
  }, [statusFilter, caseTypeFilter, priorityFilter, searchQuery]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 1000 };

      if (searchQuery) params.q = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (caseTypeFilter !== 'all') params.caseType = caseTypeFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const response = await lawApi.cases.list(params);
      setCases(response.data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת תיקים' : 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseCreated = () => {
    loadCases();
    setIsCaseModalOpen(false);
    setSelectedCase(undefined);
  };

  const handleEditCase = (case_: Case) => {
    setSelectedCase(case_);
    setIsCaseModalOpen(true);
  };

  const handleDeleteCase = async (caseId: string) => {
    const confirmed = confirm(
      language === 'he' ? 'האם אתה בטוח שברצונך למחוק תיק זה?' : 'Are you sure you want to delete this case?'
    );

    if (!confirmed) return;

    try {
      await lawApi.cases.delete(caseId);
      toast.success(language === 'he' ? 'התיק נמחק בהצלחה' : 'Case deleted successfully');
      loadCases();
    } catch (error: any) {
      console.error('Failed to delete case:', error);
      toast.error(error.message || (language === 'he' ? 'שגיאה במחיקת התיק' : 'Failed to delete case'));
    }
  };

  const handleViewCase = (caseId: string) => {
    router.push(`/dashboard/law/cases/${caseId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            {language === 'he' ? 'טוען...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'he' ? 'תיקים' : 'Cases'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'he'
              ? 'נהל את כל התיקים המשפטיים שלך'
              : 'Manage all your legal cases'}
          </p>
        </div>
        <UniversalButton
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedCase(undefined);
            setIsCaseModalOpen(true);
          }}
        >
          {language === 'he' ? 'תיק חדש' : 'New Case'}
        </UniversalButton>
      </div>

      {/* Search and Filters */}
      <UniversalCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'he' ? 'חפש תיקים...' : 'Search cases...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <UniversalButton
              variant="secondary"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {language === 'he' ? 'סינון' : 'Filters'}
            </UniversalButton>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'he' ? 'סטטוס' : 'Status'}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">{language === 'he' ? 'הכל' : 'All'}</option>
                    <option value="active">{language === 'he' ? 'פעיל' : 'Active'}</option>
                    <option value="pending">{language === 'he' ? 'ממתין' : 'Pending'}</option>
                    <option value="closed">{language === 'he' ? 'סגור' : 'Closed'}</option>
                    <option value="archived">{language === 'he' ? 'בארכיון' : 'Archived'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'he' ? 'סוג תיק' : 'Case Type'}
                  </label>
                  <select
                    value={caseTypeFilter}
                    onChange={(e) => setCaseTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">{language === 'he' ? 'הכל' : 'All'}</option>
                    <option value="civil">{language === 'he' ? 'אזרחי' : 'Civil'}</option>
                    <option value="criminal">{language === 'he' ? 'פלילי' : 'Criminal'}</option>
                    <option value="corporate">{language === 'he' ? 'עסקי' : 'Corporate'}</option>
                    <option value="family">{language === 'he' ? 'משפחה' : 'Family'}</option>
                    <option value="immigration">{language === 'he' ? 'הגירה' : 'Immigration'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'he' ? 'עדיפות' : 'Priority'}
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">{language === 'he' ? 'הכל' : 'All'}</option>
                    <option value="low">{language === 'he' ? 'נמוכה' : 'Low'}</option>
                    <option value="medium">{language === 'he' ? 'בינונית' : 'Medium'}</option>
                    <option value="high">{language === 'he' ? 'גבוהה' : 'High'}</option>
                    <option value="urgent">{language === 'he' ? 'דחוף' : 'Urgent'}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </UniversalCard>

      {/* Cases Table */}
      <UniversalCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'he' ? 'מספר תיק' : 'Case #'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'he' ? 'כותרת' : 'Title'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'he' ? 'לקוח' : 'Client'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'he' ? 'סטטוס' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'he' ? 'עדיפות' : 'Priority'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'he' ? 'פעולות' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1A2F4B] divide-y divide-gray-200 dark:divide-gray-700">
              {cases.map((case_) => (
                <tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {case_.caseNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {case_.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {case_.client?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CaseStatusBadge status={case_.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={case_.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewCase(case_.id)}
                        className="text-[#2979FF] hover:text-[#1e5bb8] font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        {language === 'he' ? 'צפה' : 'View'}
                      </button>
                      <button
                        onClick={() => handleEditCase(case_)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCase(case_.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'he' ? 'לא נמצאו תיקים' : 'No cases found'}
            </p>
          </div>
        )}
      </UniversalCard>

      {/* Case Modal */}
      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => {
          setIsCaseModalOpen(false);
          setSelectedCase(undefined);
        }}
        onSuccess={handleCaseCreated}
        caseData={selectedCase}
      />
    </div>
  );
}
