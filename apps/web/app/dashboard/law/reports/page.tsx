'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard, KPICard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet, BarChart, TrendingUp, Loader } from 'lucide-react';

export default function LawReportsPage() {
  const { language } = useLanguage();
  const [exporting, setExporting] = useState(false);

  const handleExportToExcel = async () => {
    setExporting(true);
    try {
      // Dynamically import XLSX to avoid SSR issues
      const XLSX = await import('xlsx');

      // Fetch all data in parallel
      const [casesRes, clientsRes, tasksRes, invoicesRes] = await Promise.all([
        lawApi.cases.list({ limit: 1000 }),
        lawApi.clients.list({ limit: 1000 }),
        lawApi.tasks.list({ limit: 1000 }),
        lawApi.invoices.list({ limit: 1000 }),
      ]);

      const cases = casesRes.data || [];
      const clients = clientsRes.data || [];
      const tasks = tasksRes.data || [];
      const invoices = invoicesRes.data || [];

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Cases sheet
      const casesSheet = XLSX.utils.json_to_sheet(
        cases.map((c: any) => ({
          'Case Number': c.caseNumber,
          'Title': c.title,
          'Client': c.client?.name || '',
          'Type': c.caseType,
          'Status': c.status,
          'Priority': c.priority,
          'Filing Date': c.filingDate ? new Date(c.filingDate).toLocaleDateString() : '',
          'Next Hearing': c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString() : '',
          'Attorney': c.assignedTo?.name || 'Unassigned',
        }))
      );
      XLSX.utils.book_append_sheet(wb, casesSheet, 'Cases');

      // Clients sheet
      const clientsSheet = XLSX.utils.json_to_sheet(
        clients.map((c: any) => ({
          'Name': c.name,
          'Email': c.email,
          'Phone': c.phone || '',
          'Type': c.clientType,
          'Company': c.company || '',
          'Active Cases': c._count?.cases || 0,
          'Created': new Date(c.createdAt).toLocaleDateString(),
        }))
      );
      XLSX.utils.book_append_sheet(wb, clientsSheet, 'Clients');

      // Tasks sheet
      const tasksSheet = XLSX.utils.json_to_sheet(
        tasks.map((t: any) => ({
          'Title': t.title,
          'Case': t.case?.caseNumber || '',
          'Priority': t.priority,
          'Status': t.status,
          'Due Date': t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
          'Assigned To': t.assignedTo?.name || '',
          'Completed': t.completedDate ? new Date(t.completedDate).toLocaleDateString() : '',
        }))
      );
      XLSX.utils.book_append_sheet(wb, tasksSheet, 'Tasks');

      // Invoices sheet
      const invoicesSheet = XLSX.utils.json_to_sheet(
        invoices.map((i: any) => ({
          'Invoice Number': i.invoiceNumber,
          'Client': i.clientName,
          'Amount': `${i.currency} ${i.totalAmount}`,
          'Status': i.status,
          'Issue Date': new Date(i.issueDate).toLocaleDateString(),
          'Due Date': i.dueDate ? new Date(i.dueDate).toLocaleDateString() : '',
          'Paid Date': i.paidDate ? new Date(i.paidDate).toLocaleDateString() : '',
        }))
      );
      XLSX.utils.book_append_sheet(wb, invoicesSheet, 'Invoices');

      // Generate file
      const fileName = `Law_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(language === 'he' ? 'הדוח יוצא בהצלחה' : 'Report exported successfully');
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error(language === 'he' ? 'שגיאה בייצוא דוח' : 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleFetchStats = async () => {
    try {
      const [casesRes, clientsRes, tasksRes, invoicesRes] = await Promise.all([
        lawApi.cases.list({ limit: 1 }),
        lawApi.clients.list({ limit: 1 }),
        lawApi.tasks.list({ status: 'completed', limit: 1000 }),
        lawApi.invoices.list({ status: 'paid' }),
      ]);

      const casesCount = casesRes.pagination?.total || 0;
      const clientsCount = clientsRes.pagination?.total || 0;
      const tasksCompleted = tasksRes.data?.length || 0;

      // Calculate revenue from paid invoices
      const paidInvoices = invoicesRes.data || [];
      const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

      return {
        totalCases: casesCount,
        totalClients: clientsCount,
        tasksCompleted,
        revenue: totalRevenue,
      };
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'he' ? 'דוחות וניתוח' : 'Reports & Analytics'}
        </h1>
        <UniversalButton
          variant="primary"
          icon={exporting ? <Loader className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          onClick={handleExportToExcel}
          disabled={exporting}
        >
          {exporting
            ? language === 'he' ? 'מייצא...' : 'Exporting...'
            : language === 'he' ? 'ייצא ל-Excel' : 'Export to Excel'}
        </UniversalButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<BarChart className="w-6 h-6" />}
          label={language === 'he' ? 'סה"כ תיקים' : 'Total Cases'}
          value="--"
          change={{ value: '', trend: 'neutral' }}
        />
        <KPICard
          icon={<TrendingUp className="w-6 h-6" />}
          label={language === 'he' ? 'משימות שהושלמו' : 'Tasks Completed'}
          value="--"
          change={{ value: '', trend: 'neutral' }}
        />
        <KPICard
          icon={<Download className="w-6 h-6" />}
          label={language === 'he' ? 'הכנסות' : 'Revenue'}
          value="--"
          change={{ value: '', trend: 'neutral' }}
        />
        <KPICard
          icon={<BarChart className="w-6 h-6" />}
          label={language === 'he' ? 'לקוחות' : 'Clients'}
          value="--"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UniversalCard>
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'he' ? 'תיקים לפי סוג' : 'Cases by Type'}
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'he' ? 'תרשים בקרוב' : 'Chart Coming Soon'}
              </p>
            </div>
          </div>
        </UniversalCard>

        <UniversalCard>
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'he' ? 'הכנסות לפי חודש' : 'Revenue by Month'}
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'he' ? 'תרשים בקרוב' : 'Chart Coming Soon'}
              </p>
            </div>
          </div>
        </UniversalCard>
      </div>

      <UniversalCard>
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'he' ? 'הוראות ייצוא' : 'Export Instructions'}
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'he'
                ? 'לחץ על כפתור "ייצא ל-Excel" כדי להוריד דוח מלא הכולל:'
                : 'Click the "Export to Excel" button to download a comprehensive report containing:'}
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>{language === 'he' ? 'כל התיקים עם פרטים מלאים' : 'All cases with complete details'}</li>
              <li>{language === 'he' ? 'רשימת לקוחות מלאה' : 'Complete client list'}</li>
              <li>{language === 'he' ? 'סטטוס כל המשימות' : 'All tasks status'}</li>
              <li>{language === 'he' ? 'היסטוריית חשבוניות ותשלומים' : 'Invoice and payment history'}</li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              {language === 'he'
                ? 'הקובץ ייווצר בפורמט Excel (.xlsx) וייפתח אוטומטית או יישמר בתיקיית ההורדות שלך.'
                : 'The file will be generated in Excel format (.xlsx) and will either open automatically or be saved to your downloads folder.'}
            </p>
          </div>
        </div>
      </UniversalCard>
    </div>
  );
}
