'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Plus, Search, Filter, User, Briefcase, Calendar, Download } from 'lucide-react';
import { UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface LawInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate?: string;
  paidDate?: string;
  client?: { id: string; name: string; email: string };
  case?: { id: string; caseNumber: string; title: string };
  createdAt: string;
}

export function BillingPageClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [invoices, setInvoices] = useState<LawInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInvoices();
  }, [page, search, status]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(status && { status }),
      });

      const response = await fetch(`/api/law/billing?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const getStatusColor = (invoiceStatus: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      sent: 'bg-blue-500/20 text-blue-400',
      paid: 'bg-green-500/20 text-green-400',
      overdue: 'bg-red-500/20 text-red-400',
      cancelled: 'bg-gray-500/20 text-gray-400',
    };
    return colors[invoiceStatus] || colors.draft;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="p-8 lg:p-10 min-h-screen bg-gradient-to-br from-[#0f1a2c] to-[#17223c]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {lang === 'he' ? 'חשבוניות' : 'Billing'}
                </h1>
                <p className="text-gray-300">
                  {lang === 'he' ? 'נהל חשבוניות ותשלומים' : 'Manage invoices and payments'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-[#0e1a2b] font-semibold rounded-xl px-5 py-2.5 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {lang === 'he' ? 'חשבונית חדשה' : 'New Invoice'}
            </button>
          </div>

          <UniversalCard variant="elevated" className="mb-6 bg-gradient-to-br from-[#0f1a2c] to-[#1a2841] border border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
            <CardBody>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={lang === 'he' ? 'חפש חשבוניות...' : 'Search invoices...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-lg bg-[#1e3a5f]/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={status}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="px-4 py-2 border border-white/10 rounded-lg bg-[#1e3a5f]/20 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">{lang === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
                    <option value="draft">{lang === 'he' ? 'טיוטה' : 'Draft'}</option>
                    <option value="sent">{lang === 'he' ? 'נשלח' : 'Sent'}</option>
                    <option value="paid">{lang === 'he' ? 'שולם' : 'Paid'}</option>
                    <option value="overdue">{lang === 'he' ? 'באיחור' : 'Overdue'}</option>
                    <option value="cancelled">{lang === 'he' ? 'בוטל' : 'Cancelled'}</option>
                  </select>
                </div>
              </div>
            </CardBody>
          </UniversalCard>

          <UniversalCard variant="elevated" className="bg-gradient-to-br from-[#0f1a2c] to-[#1a2841] border border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
            <CardBody>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">{lang === 'he' ? 'לא נמצאו חשבוניות' : 'No invoices found'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-white">{lang === 'he' ? 'מספר' : 'Invoice #'}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-white">{lang === 'he' ? 'לקוח' : 'Client'}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-white">{lang === 'he' ? 'תיק' : 'Case'}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-white">{lang === 'he' ? 'סכום' : 'Amount'}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-white">{lang === 'he' ? 'סטטוס' : 'Status'}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-white">{lang === 'he' ? 'תאריך יעד' : 'Due Date'}</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b border-white/10 hover:bg-[#1e3a5f]/30 transition-all duration-300 cursor-pointer"
                          onClick={() => router.push(`/dashboard/law/billing/${invoice.id}`)}
                        >
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm font-medium text-blue-400">
                              {invoice.invoiceNumber}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {invoice.client ? (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-white">{invoice.client.name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {invoice.case ? (
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-white">{invoice.case.caseNumber}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold text-white">{formatCurrency(invoice.amount, invoice.currency)}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {invoice.dueDate ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(invoice.dueDate).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Download invoice logic here
                              }}
                              className="bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white font-medium rounded-lg px-3 py-1.5 transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white font-medium rounded-lg px-4 py-2 transition-all disabled:opacity-50"
                  >
                    {lang === 'he' ? 'הקודם' : 'Previous'}
                  </button>
                  <span className="text-sm px-4 py-2 text-white">
                    {lang === 'he' ? `עמוד ${page} מתוך ${totalPages}` : `Page ${page} of ${totalPages}`}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white font-medium rounded-lg px-4 py-2 transition-all disabled:opacity-50"
                  >
                    {lang === 'he' ? 'הבא' : 'Next'}
                  </button>
                </div>
              )}
            </CardBody>
          </UniversalCard>

      {showCreateModal && (
        <CreateInvoiceModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchInvoices(); }} lang={lang} />
      )}
    </div>
  );
}

function CreateInvoiceModal({ onClose, onSuccess, lang }: { onClose: () => void; onSuccess: () => void; lang: string }) {
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [cases, setCases] = useState<Array<{ id: string; caseNumber: string; title: string }>>([]);
  const [formData, setFormData] = useState({
    clientId: '', caseId: '', description: '', amount: '', currency: 'USD', status: 'draft', dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClientsAndCases();
  }, []);

  const fetchClientsAndCases = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const [clientsRes, casesRes] = await Promise.all([
        fetch('/api/law/clients?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/law/cases?limit=100', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients);
      }
      if (casesRes.ok) {
        const data = await casesRes.json();
        setCases(data.cases);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
      const response = await fetch('/api/law/billing', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create invoice');
      }
      onSuccess();
    } catch (err: any) {
      console.error('[Create Invoice Error]', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{lang === 'he' ? 'חשבונית חדשה' : 'New Invoice'}</h2>
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
                {lang === 'he' ? 'תיק קשור' : 'Related Case'}
              </label>
              <select
                value={formData.caseId}
                onChange={(e) => setFormData({...formData, caseId: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">{lang === 'he' ? 'ללא תיק' : 'None'}</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'תיאור' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={lang === 'he' ? 'הזן תיאור החשבונית' : 'Enter invoice description'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'סכום *' : 'Amount *'}
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'מטבע' : 'Currency'}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ILS">ILS</option>
              </select>
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
                <option value="draft">{lang === 'he' ? 'טיוטה' : 'Draft'}</option>
                <option value="sent">{lang === 'he' ? 'נשלח' : 'Sent'}</option>
                <option value="paid">{lang === 'he' ? 'שולם' : 'Paid'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'תאריך יעד' : 'Due Date'}
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
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
              {loading ? (lang === 'he' ? 'יוצר...' : 'Creating...') : (lang === 'he' ? 'צור חשבונית' : 'Create Invoice')}
            </UniversalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
