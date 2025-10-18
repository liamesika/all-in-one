'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { Upload, FileText, Download, Eye } from 'lucide-react';

const mockDocuments = [
  { id: '1', fileName: 'Contract_Draft_v2.pdf', type: 'contract', case: 'LAW-2025-001', uploadedBy: 'John Smith', date: '2025-10-15', size: '2.4 MB' },
  { id: '2', fileName: 'Evidence_Photos.zip', type: 'evidence', case: 'LAW-2025-002', uploadedBy: 'Sarah Johnson', date: '2025-10-14', size: '15.8 MB' },
];

export default function LawDocumentsPage() {
  const { language } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'he' ? 'מסמכים' : 'Documents'}
        </h1>
        <UniversalButton variant="primary" icon={<Upload className="w-4 h-4" />}>
          {language === 'he' ? 'העלה מסמך' : 'Upload Document'}
        </UniversalButton>
      </div>

      <UniversalCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'שם קובץ' : 'File Name'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'סוג' : 'Type'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'תיק' : 'Case'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'הועלה על ידי' : 'Uploaded By'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'תאריך' : 'Date'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{language === 'he' ? 'פעולות' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">{doc.fileName}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{doc.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{doc.case}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{doc.uploadedBy}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{doc.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-[#2979FF] hover:text-[#1e5bb8]"><Eye className="w-4 h-4" /></button>
                      <button className="text-[#2979FF] hover:text-[#1e5bb8]"><Download className="w-4 h-4" /></button>
                    </div>
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
