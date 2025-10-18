'use client';

import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { Plus, DollarSign } from 'lucide-react';

const mockInvoices = [
  { id: '1', invoiceNumber: 'INV-2025-001', client: 'Tech Corporation Ltd.', amount: '$15,000', status: 'paid', issueDate: '2025-10-01', dueDate: '2025-10-31' },
  { id: '2', invoiceNumber: 'INV-2025-002', client: 'Jane Doe', amount: '$3,500', status: 'sent', issueDate: '2025-10-10', dueDate: '2025-11-10' },
  { id: '3', invoiceNumber: 'INV-2025-003', client: 'ABC Properties', amount: '$7,200', status: 'overdue', issueDate: '2025-09-15', dueDate: '2025-10-15' },
];

const statusColors = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function LawInvoicesPage() {
  const { language } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'he' ? 'חשבוניות' : 'Invoices'}
        </h1>
        <UniversalButton variant="primary" icon={<Plus className="w-4 h-4" />}>
          {language === 'he' ? 'חשבונית חדשה' : 'New Invoice'}
        </UniversalButton>
      </div>

      <UniversalCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'מספר' : 'Invoice #'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'לקוח' : 'Client'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'סכום' : 'Amount'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'סטטוס' : 'Status'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'תאריך יעד' : 'Due Date'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'פעולות' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{invoice.client}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{invoice.dueDate}</td>
                  <td className="px-6 py-4">
                    <button className="text-[#2979FF] hover:text-[#1e5bb8] text-sm font-medium">
                      {language === 'he' ? 'צפה' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UniversalCard>
    </div>
  );
}
