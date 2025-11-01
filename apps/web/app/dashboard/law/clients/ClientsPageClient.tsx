'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Plus, Filter, ChevronRight, Mail, Phone, Building2, User } from 'lucide-react';
import { UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface LawClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  clientType: string;
  cases?: Array<{ id: string; caseNumber: string; title: string; status: string }>;
  createdAt: string;
}

export function ClientsPageClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [clients, setClients] = useState<LawClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientType, setClientType] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchClients();
  }, [page, search, clientType]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(clientType && { clientType }),
      });

      const response = await fetch(`/api/law/clients?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (type: string) => {
    setClientType(type);
    setPage(1);
  };

  return (
    <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {lang === 'he' ? 'לקוחות' : 'Clients'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {lang === 'he' ? 'נהל את לקוחות משרד עורכי הדין' : 'Manage your law firm clients'}
                </p>
              </div>
            </div>
            <UniversalButton variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              {lang === 'he' ? 'לקוח חדש' : 'New Client'}
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
                      placeholder={lang === 'he' ? 'חפש לקוחות...' : 'Search clients...'}
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={clientType}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">{lang === 'he' ? 'כל הסוגים' : 'All Types'}</option>
                    <option value="individual">{lang === 'he' ? 'פרטי' : 'Individual'}</option>
                    <option value="corporate">{lang === 'he' ? 'תאגיד' : 'Corporate'}</option>
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
              ) : clients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{lang === 'he' ? 'לא נמצאו לקוחות' : 'No clients found'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'שם' : 'Name'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'אימייל' : 'Email'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'טלפון' : 'Phone'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'סוג' : 'Type'}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{lang === 'he' ? 'תיקים' : 'Cases'}</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr
                          key={client.id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => router.push(`/dashboard/law/clients/${client.id}`)}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                {client.clientType === 'corporate' ? (
                                  <Building2 className="w-5 h-5 text-amber-600" />
                                ) : (
                                  <User className="w-5 h-5 text-amber-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{client.name}</p>
                                {client.company && <p className="text-sm text-gray-500">{client.company}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4" />
                              {client.email}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">{client.phone || '-'}</td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              client.clientType === 'corporate' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {client.clientType === 'corporate' ? 'Corporate' : 'Individual'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">{client.cases?.length || 0}</td>
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
        <CreateClientModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchClients(); }} lang={lang} />
      )}
    </div>
  );
}

function CreateClientModal({ onClose, onSuccess, lang }: { onClose: () => void; onSuccess: () => void; lang: string }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', address: '', city: '', country: '', clientType: 'individual', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const response = await fetch('/api/law/clients', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create client');
      }
      onSuccess();
    } catch (err: any) {
      console.error('[Create Client Error]', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{lang === 'he' ? 'לקוח חדש' : 'New Client'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'שם מלא *' : 'Full Name *'}
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={lang === 'he' ? 'הזן שם מלא' : 'Enter full name'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'אימייל *' : 'Email *'}
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder={lang === 'he' ? 'example@domain.com' : 'example@domain.com'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'טלפון' : 'Phone'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder={lang === 'he' ? '+972-50-123-4567' : '+1-555-123-4567'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'סוג לקוח *' : 'Client Type *'}
              </label>
              <select
                value={formData.clientType}
                onChange={(e) => setFormData({...formData, clientType: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="individual">{lang === 'he' ? 'פרטי' : 'Individual'}</option>
                <option value="corporate">{lang === 'he' ? 'תאגיד' : 'Corporate'}</option>
              </select>
            </div>
            {formData.clientType === 'corporate' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {lang === 'he' ? 'שם חברה' : 'Company Name'}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder={lang === 'he' ? 'הזן שם חברה' : 'Enter company name'}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            )}
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
              {loading ? (lang === 'he' ? 'יוצר...' : 'Creating...') : (lang === 'he' ? 'צור לקוח' : 'Create Client')}
            </UniversalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
