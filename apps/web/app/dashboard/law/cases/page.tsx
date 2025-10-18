'use client';

/**
 * Law Cases Page
 * Displays all cases with filtering, search, and CRUD operations
 */

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { CaseStatusBadge } from '@/components/law/CaseStatusBadge';
import { PriorityBadge } from '@/components/law/PriorityBadge';
import { Search, Plus, Filter, Eye } from 'lucide-react';

// Mock data for demonstration
const mockCases = [
  {
    id: '1',
    caseNumber: 'LAW-2025-001',
    title: 'Contract Dispute - Tech Corp vs. StartupX',
    client: 'Tech Corporation Ltd.',
    attorney: 'John Smith',
    caseType: 'corporate',
    status: 'active' as const,
    priority: 'high' as const,
    nextHearingDate: '2025-11-15',
    filingDate: '2025-10-01',
  },
  {
    id: '2',
    caseNumber: 'LAW-2025-002',
    title: 'Employment Termination Case',
    client: 'Jane Doe',
    attorney: 'Sarah Johnson',
    caseType: 'civil',
    status: 'pending' as const,
    priority: 'medium' as const,
    nextHearingDate: null,
    filingDate: '2025-10-10',
  },
  {
    id: '3',
    caseNumber: 'LAW-2025-003',
    title: 'Real Estate Transaction Review',
    client: 'ABC Properties Inc.',
    attorney: 'Michael Brown',
    caseType: 'corporate',
    status: 'active' as const,
    priority: 'low' as const,
    nextHearingDate: '2025-11-20',
    filingDate: '2025-09-15',
  },
];

export default function LawCasesPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCases = mockCases.filter((case_) => {
    const matchesSearch =
      case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.client.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        <UniversalButton variant="primary" icon={<Plus className="w-4 h-4" />}>
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
                  {language === 'he' ? 'עורך דין' : 'Attorney'}
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
              {filteredCases.map((case_) => (
                <tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {case_.caseNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {case_.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {case_.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {case_.attorney}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CaseStatusBadge status={case_.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={case_.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-[#2979FF] hover:text-[#1e5bb8] font-medium flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {language === 'he' ? 'צפה' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'he' ? 'לא נמצאו תיקים' : 'No cases found'}
            </p>
          </div>
        )}
      </UniversalCard>
    </div>
  );
}
