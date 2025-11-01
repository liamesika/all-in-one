'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Search, Plus, Filter, ChevronRight, AlertCircle, User } from 'lucide-react';
import { UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface LawCase {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  caseType: string;
  status: string;
  priority: string;
  filingDate?: string;
  nextHearingDate?: string;
  client?: { id: string; name: string; email: string };
  assignedTo?: { id: string; fullName: string; email: string };
  tasks?: Array<{ id: string; status: string }>;
  createdAt: string;
}

export function CasesPageClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [cases, setCases] = useState<LawCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCases();
  }, [page, search, status]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/law/cases?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCases(data.cases);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (caseStatus: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      archived: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colors[caseStatus] || colors.active;
  };

  return (
    <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {lang === 'he' ? 'תיקים' : 'Cases'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {lang === 'he' ? 'נהל תיקים משפטיים' : 'Manage legal cases'}
                </p>
              </div>
            </div>
            <UniversalButton variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              {lang === 'he' ? 'תיק חדש' : 'New Case'}
            </UniversalButton>
          </div>

          <UniversalCard variant="elevated" className="mb-6">
            <CardBody>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={lang === 'he' ? 'חפש תיקים...' : 'Search cases...'}
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={status}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">{lang === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
                    <option value="active">{lang === 'he' ? 'פעיל' : 'Active'}</option>
                    <option value="pending">{lang === 'he' ? 'ממתין' : 'Pending'}</option>
                    <option value="closed">{lang === 'he' ? 'סגור' : 'Closed'}</option>
                    <option value="archived">{lang === 'he' ? 'בארכיון' : 'Archived'}</option>
                  </select>
                </div>
              </div>
            </CardBody>
          </UniversalCard>

          <UniversalCard variant="elevated">
            <CardBody>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : cases.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{lang === 'he' ? 'לא נמצאו תיקים' : 'No cases found'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'מספר תיק' : 'Case #'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'כותרת' : 'Title'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'לקוח' : 'Client'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'סטטוס' : 'Status'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'עדיפות' : 'Priority'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'סוג' : 'Type'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'משימות' : 'Tasks'}</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((caseItem) => (
                        <tr
                          key={caseItem.id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => router.push(`/dashboard/law/cases/${caseItem.id}`)}
                        >
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                              {caseItem.caseNumber}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium">{caseItem.title}</p>
                              {caseItem.description && (
                                <p className="text-sm text-gray-500 truncate max-w-xs">{caseItem.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {caseItem.client ? (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{caseItem.client.name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(caseItem.status)}`}>
                              {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${getPriorityColor(caseItem.priority)}`}>
                              {caseItem.priority.charAt(0).toUpperCase() + caseItem.priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">{caseItem.caseType}</td>
                          <td className="px-4 py-4">
                            {caseItem.tasks && caseItem.tasks.length > 0 ? (
                              <span className="text-sm">
                                {caseItem.tasks.filter(t => t.status !== 'done').length} / {caseItem.tasks.length}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6 pt-6 border-t">
                  <UniversalButton variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    {lang === 'he' ? 'הקודם' : 'Previous'}
                  </UniversalButton>
                  <span className="text-sm px-4 py-2">
                    {lang === 'he' ? `עמוד ${page} מתוך ${totalPages}` : `Page ${page} of ${totalPages}`}
                  </span>
                  <UniversalButton variant="secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    {lang === 'he' ? 'הבא' : 'Next'}
                  </UniversalButton>
                </div>
              )}
            </CardBody>
          </UniversalCard>

      {showCreateModal && (
        <CreateCaseModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchCases(); }} lang={lang} />
      )}
    </div>
  );
}

function CreateCaseModal({ onClose, onSuccess, lang }: { onClose: () => void; onSuccess: () => void; lang: string }) {
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    title: '', description: '', clientId: '', caseType: '', status: 'active', priority: 'medium', filingDate: '', nextHearingDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch('/api/law/clients?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const response = await fetch('/api/law/cases', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create case');
      }
      onSuccess();
    } catch (err: any) {
      console.error('[Create Case Error]', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{lang === 'he' ? 'תיק חדש' : 'New Case'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'כותרת *' : 'Title *'}
              </label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={lang === 'he' ? 'הזן כותרת תיק' : 'Enter case title'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'תיאור' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={lang === 'he' ? 'הזן תיאור התיק' : 'Enter case description'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'לקוח *' : 'Client *'}
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">{lang === 'he' ? 'בחר לקוח' : 'Select client'}</option>
                {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'סוג תיק *' : 'Case Type *'}
              </label>
              <input
                required
                type="text"
                value={formData.caseType}
                onChange={(e) => setFormData({...formData, caseType: e.target.value})}
                placeholder={lang === 'he' ? 'אזרחי, פלילי, מסחרי...' : 'Civil, Criminal, Corporate...'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'סטטוס' : 'Status'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="active">{lang === 'he' ? 'פעיל' : 'Active'}</option>
                <option value="pending">{lang === 'he' ? 'ממתין' : 'Pending'}</option>
                <option value="closed">{lang === 'he' ? 'סגור' : 'Closed'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'עדיפות' : 'Priority'}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="low">{lang === 'he' ? 'נמוכה' : 'Low'}</option>
                <option value="medium">{lang === 'he' ? 'בינונית' : 'Medium'}</option>
                <option value="high">{lang === 'he' ? 'גבוהה' : 'High'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'תאריך הגשה' : 'Filing Date'}
              </label>
              <input
                type="date"
                value={formData.filingDate}
                onChange={(e) => setFormData({...formData, filingDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'דיון הבא' : 'Next Hearing'}
              </label>
              <input
                type="date"
                value={formData.nextHearingDate}
                onChange={(e) => setFormData({...formData, nextHearingDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <UniversalButton
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              {lang === 'he' ? 'ביטול' : 'Cancel'}
            </UniversalButton>
            <UniversalButton
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (lang === 'he' ? 'יוצר...' : 'Creating...') : (lang === 'he' ? 'צור תיק' : 'Create Case')}
            </UniversalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
