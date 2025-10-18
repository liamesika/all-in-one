'use client';

/**
 * Export Excel Button Component
 * Exports comprehensive report data to Excel with multiple sheets
 */

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { UniversalButton } from '@/components/shared';
import * as XLSX from 'xlsx';

interface ReportData {
  kpis: {
    totalLeads: number;
    totalLeadsTrend: number;
    conversionRate: number;
    conversionRateTrend: number;
    avgResponseTime: string;
    avgResponseTimeTrend: number;
    totalRevenue: number;
    totalRevenueTrend: number;
  };
  leadsOverTime: Array<{ date: string; count: number }>;
  leadsBySource: Array<{ source: string; count: number; percentage: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  topProperties: Array<{ name: string; views: number; leads: number }>;
  responseTimeTrend: Array<{ date: string; avgHours: number }>;
  revenueByType: Array<{ type: 'SALE' | 'RENT'; amount: number }>;
}

interface ExportExcelButtonProps {
  reportData: ReportData;
  dateRange: string;
  language: string;
}

export function ExportExcelButton({
  reportData,
  dateRange,
  language,
}: ExportExcelButtonProps) {
  const [exporting, setExporting] = useState(false);

  const t = {
    export: language === 'he' ? 'ייצא לאקסל' : 'Export to Excel',
    exporting: language === 'he' ? 'מייצא...' : 'Exporting...',
  };

  const formatDateRange = (range: string) => {
    const labels: Record<string, string> = {
      last7: language === 'he' ? '7 ימים אחרונים' : 'Last 7 Days',
      last30: language === 'he' ? '30 ימים אחרונים' : 'Last 30 Days',
      last90: language === 'he' ? '90 ימים אחרונים' : 'Last 90 Days',
    };
    return labels[range] || range;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: KPIs Summary
      const kpisData = [
        [language === 'he' ? 'מדד' : 'Metric', language === 'he' ? 'ערך' : 'Value', language === 'he' ? 'מגמה' : 'Trend'],
        [language === 'he' ? 'סה"כ לידים' : 'Total Leads', reportData.kpis.totalLeads, `${reportData.kpis.totalLeadsTrend > 0 ? '+' : ''}${reportData.kpis.totalLeadsTrend.toFixed(1)}%`],
        [language === 'he' ? 'שיעור המרה' : 'Conversion Rate', `${reportData.kpis.conversionRate.toFixed(1)}%`, `${reportData.kpis.conversionRateTrend > 0 ? '+' : ''}${reportData.kpis.conversionRateTrend.toFixed(1)}%`],
        [language === 'he' ? 'זמן תגובה ממוצע' : 'Avg Response Time', reportData.kpis.avgResponseTime, `${reportData.kpis.avgResponseTimeTrend > 0 ? '+' : ''}${reportData.kpis.avgResponseTimeTrend.toFixed(1)}%`],
        [language === 'he' ? 'סה"כ הכנסות' : 'Total Revenue', `₪${reportData.kpis.totalRevenue.toLocaleString()}`, `${reportData.kpis.totalRevenueTrend > 0 ? '+' : ''}${reportData.kpis.totalRevenueTrend.toFixed(1)}%`],
      ];
      const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData);
      XLSX.utils.book_append_sheet(workbook, kpisSheet, language === 'he' ? 'מדדים' : 'KPIs');

      // Sheet 2: Leads Over Time
      const leadsOverTimeData = [
        [language === 'he' ? 'תאריך' : 'Date', language === 'he' ? 'מספר לידים' : 'Lead Count'],
        ...reportData.leadsOverTime.map(item => [item.date, item.count]),
      ];
      const leadsOverTimeSheet = XLSX.utils.aoa_to_sheet(leadsOverTimeData);
      XLSX.utils.book_append_sheet(workbook, leadsOverTimeSheet, language === 'he' ? 'לידים לפי תאריך' : 'Leads Over Time');

      // Sheet 3: Leads by Source
      const leadsBySourceData = [
        [language === 'he' ? 'מקור' : 'Source', language === 'he' ? 'כמות' : 'Count', language === 'he' ? 'אחוז' : 'Percentage'],
        ...reportData.leadsBySource.map(item => [item.source, item.count, `${item.percentage.toFixed(1)}%`]),
      ];
      const leadsBySourceSheet = XLSX.utils.aoa_to_sheet(leadsBySourceData);
      XLSX.utils.book_append_sheet(workbook, leadsBySourceSheet, language === 'he' ? 'לידים לפי מקור' : 'Leads by Source');

      // Sheet 4: Leads by Status
      const leadsByStatusData = [
        [language === 'he' ? 'סטטוס' : 'Status', language === 'he' ? 'כמות' : 'Count'],
        ...reportData.leadsByStatus.map(item => [item.status, item.count]),
      ];
      const leadsByStatusSheet = XLSX.utils.aoa_to_sheet(leadsByStatusData);
      XLSX.utils.book_append_sheet(workbook, leadsByStatusSheet, language === 'he' ? 'לידים לפי סטטוס' : 'Leads by Status');

      // Sheet 5: Top Properties
      const topPropertiesData = [
        [language === 'he' ? 'נכס' : 'Property', language === 'he' ? 'צפיות' : 'Views', language === 'he' ? 'לידים' : 'Leads'],
        ...reportData.topProperties.map(item => [item.name, item.views, item.leads]),
      ];
      const topPropertiesSheet = XLSX.utils.aoa_to_sheet(topPropertiesData);
      XLSX.utils.book_append_sheet(workbook, topPropertiesSheet, language === 'he' ? 'נכסים מובילים' : 'Top Properties');

      // Sheet 6: Response Time Trend
      const responseTimeTrendData = [
        [language === 'he' ? 'תאריך' : 'Date', language === 'he' ? 'שעות ממוצעות' : 'Avg Hours'],
        ...reportData.responseTimeTrend.map(item => [item.date, item.avgHours.toFixed(2)]),
      ];
      const responseTimeTrendSheet = XLSX.utils.aoa_to_sheet(responseTimeTrendData);
      XLSX.utils.book_append_sheet(workbook, responseTimeTrendSheet, language === 'he' ? 'מגמת זמן תגובה' : 'Response Time Trend');

      // Sheet 7: Revenue by Type
      const revenueByTypeData = [
        [language === 'he' ? 'סוג' : 'Type', language === 'he' ? 'הכנסה' : 'Revenue'],
        ...reportData.revenueByType.map(item => [
          item.type === 'SALE' ? (language === 'he' ? 'מכירה' : 'Sale') : (language === 'he' ? 'השכרה' : 'Rent'),
          `₪${item.amount.toLocaleString()}`
        ]),
      ];
      const revenueByTypeSheet = XLSX.utils.aoa_to_sheet(revenueByTypeData);
      XLSX.utils.book_append_sheet(workbook, revenueByTypeSheet, language === 'he' ? 'הכנסות לפי סוג' : 'Revenue by Type');

      // Generate filename
      const today = new Date().toISOString().split('T')[0];
      const filename = `real-estate-report-${today}.xlsx`;

      // Export the workbook
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert(language === 'he' ? 'הייצוא נכשל' : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <UniversalButton
      variant="outline"
      size="md"
      leftIcon={exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? t.exporting : t.export}
    </UniversalButton>
  );
}
