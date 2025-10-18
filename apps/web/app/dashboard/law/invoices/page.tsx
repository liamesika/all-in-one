'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { InvoiceModal } from '@/components/law/modals';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';
import { Plus, DollarSign, Send, Check, Eye } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: string;
  paidDate?: string;
  issueDate: string;
  case?: { id: string; caseNumber: string };
}

const statusColors = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function LawInvoicesPage() {
  const { language } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 1000, sortBy: 'issueDate', sortOrder: 'desc' };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await lawApi.invoices.list(params);
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת חשבוניות' : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (id: string) => {
    try {
      await lawApi.invoices.markAsSent(id);
      toast.success(language === 'he' ? 'החשבונית נשלחה בהצלחה' : 'Invoice sent successfully');
      fetchInvoices();
    } catch (error) {
      console.error('Failed to send invoice:', error);
      toast.error(language === 'he' ? 'שגיאה בשליחת חשבונית' : 'Failed to send invoice');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await lawApi.invoices.markAsPaid(id);
      toast.success(language === 'he' ? 'החשבונית סומנה כמשולמת' : 'Invoice marked as paid');
      fetchInvoices();
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
      toast.error(language === 'he' ? 'שגיאה בעדכון חשבונית' : 'Failed to update invoice');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'draft' || !invoice.dueDate) return false;
    return new Date(invoice.dueDate) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'he' ? 'חשבוניות' : 'Invoices'}
        </h1>
        <UniversalButton
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedInvoice(null);
            setIsModalOpen(true);
          }}
        >
          {language === 'he' ? 'חשבונית חדשה' : 'New Invoice'}
        </UniversalButton>
      </div>

      {/* Status Filter */}
      <UniversalCard>
        <div className="p-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
          >
            <option value="all">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
            <option value="draft">{language === 'he' ? 'טיוטה' : 'Draft'}</option>
            <option value="sent">{language === 'he' ? 'נשלח' : 'Sent'}</option>
            <option value="paid">{language === 'he' ? 'שולם' : 'Paid'}</option>
            <option value="overdue">{language === 'he' ? 'באיחור' : 'Overdue'}</option>
          </select>
        </div>
      </UniversalCard>

      {/* Loading State */}
      {loading && (
        <UniversalCard>
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </UniversalCard>
      )}

      {/* Invoices Table */}
      {!loading && invoices.length > 0 && (
        <UniversalCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'מספר' : 'Invoice #'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'לקוח' : 'Client'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'סכום' : 'Amount'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'סטטוס' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'תאריך יעד' : 'Due Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'פעולות' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {invoice.clientName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOverdue(invoice) ? statusColors.overdue : statusColors[invoice.status]
                        }`}
                      >
                        {isOverdue(invoice)
                          ? language === 'he'
                            ? 'באיחור'
                            : 'Overdue'
                          : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsModalOpen(true);
                          }}
                          className="text-[#2979FF] hover:text-[#1e5bb8]"
                          title={language === 'he' ? 'צפה' : 'View'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => handleSendInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-700"
                            title={language === 'he' ? 'שלח' : 'Send'}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {(invoice.status === 'sent' || isOverdue(invoice)) && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            className="text-green-600 hover:text-green-700"
                            title={language === 'he' ? 'סמן כמשולם' : 'Mark as Paid'}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UniversalCard>
      )}

      {/* Empty State */}
      {!loading && invoices.length === 0 && (
        <UniversalCard>
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'he' ? 'לא נמצאו חשבוניות' : 'No invoices found'}
            </p>
          </div>
        </UniversalCard>
      )}

      {/* Invoice Modal */}
      {isModalOpen && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
            fetchInvoices();
            toast.success(
              selectedInvoice
                ? language === 'he' ? 'החשבונית עודכנה בהצלחה' : 'Invoice updated'
                : language === 'he' ? 'החשבונית נוצרה בהצלחה' : 'Invoice created'
            );
          }}
        />
      )}
    </div>
  );
}
