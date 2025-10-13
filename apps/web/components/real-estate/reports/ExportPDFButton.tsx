'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface ExportPDFButtonProps {
  reportData: any;
  dateRange: string;
  language: string;
}

export function ExportPDFButton({ reportData, dateRange, language }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      // Find the reports container
      const reportsElement = document.getElementById('reports-container');
      if (!reportsElement) {
        throw new Error('Reports container not found');
      }

      // Capture the reports container as canvas
      const canvas = await html2canvas(reportsElement, {
        scale: 2,
        backgroundColor: '#0E1A2B',
        logging: false,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(41, 121, 255);
      pdf.text('EFFINITY', 15, 15);

      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      const title = language === 'he' ? 'דוח ניתוח' : 'Analytics Report';
      pdf.text(title, 15, 25);

      pdf.setFontSize(10);
      pdf.setTextColor(156, 163, 175);
      const dateLabel = language === 'he' ? 'טווח תאריכים' : 'Date Range';
      pdf.text(`${dateLabel}: ${dateRange}`, 15, 32);

      // Add captured image
      pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, imgHeight);

      // Add footer
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      const timestamp = new Date().toLocaleString(language === 'he' ? 'he-IL' : 'en-US');
      const generatedText = language === 'he' ? `נוצר ב: ${timestamp}` : `Generated: ${timestamp}`;
      pdf.text(generatedText, 15, pageHeight - 10);

      // Download
      const filename = `effinity-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('PDF export failed:', error);
      alert(language === 'he' ? 'ייצוא PDF נכשל' : 'PDF export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const buttonText = language === 'he' ? 'ייצא PDF' : 'Export PDF';

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {buttonText}
    </button>
  );
}
