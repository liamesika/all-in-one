'use client';

/**
 * Invoices list component
 * Displays past invoices with download links
 */

import { Download, ExternalLink } from 'lucide-react';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: Date | null;
  periodStart: Date;
  periodEnd: Date;
  pdfUrl?: string | null;
  hostedInvoiceUrl?: string | null;
}

interface InvoicesListProps {
  invoices: Invoice[];
}

export default function InvoicesList({ invoices }: InvoicesListProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      open: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Open' },
      void: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Void' },
      uncollectible: { bg: 'bg-red-100', text: 'text-red-800', label: 'Uncollectible' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No invoices yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.paidAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </a>
                    )}
                    {invoice.hostedInvoiceUrl && (
                      <a
                        href={invoice.hostedInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
