'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { DocumentUploadModal } from '@/components/law/modals';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';
import { Upload, FileText, Download, Eye, Trash2, Search } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  documentType?: string;
  fileSize: number;
  uploadedBy?: { name: string };
  case?: { caseNumber: string };
  createdAt: string;
}

export default function LawDocumentsPage() {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [searchQuery, fileTypeFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 1000 };
      if (searchQuery) params.q = searchQuery;
      if (fileTypeFilter !== 'all') params.fileType = fileTypeFilter;

      const response = await lawApi.documents.list(params);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת מסמכים' : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await lawApi.documents.getDownloadUrl(doc.id);
      if (response.url) {
        window.open(response.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error(language === 'he' ? 'שגיאה בהורדת מסמך' : 'Failed to download document');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      language === 'he' ? 'האם אתה בטוח שברצונך למחוק מסמך זה?' : 'Are you sure you want to delete this document?'
    );

    if (!confirmed) return;

    try {
      await lawApi.documents.delete(id);
      toast.success(language === 'he' ? 'המסמך נמחק בהצלחה' : 'Document deleted');
      fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error(language === 'he' ? 'שגיאה במחיקת מסמך' : 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'he' ? 'מסמכים' : 'Documents'}
        </h1>
        <UniversalButton
          variant="primary"
          icon={<Upload className="w-4 h-4" />}
          onClick={() => setIsUploadModalOpen(true)}
        >
          {language === 'he' ? 'העלה מסמך' : 'Upload Document'}
        </UniversalButton>
      </div>

      {/* Search and Filter */}
      <UniversalCard>
        <div className="p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'he' ? 'חפש מסמכים...' : 'Search documents...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
            />
          </div>
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
          >
            <option value="all">{language === 'he' ? 'כל הקבצים' : 'All Files'}</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
            <option value="jpg">Image</option>
          </select>
        </div>
      </UniversalCard>

      {/* Loading State */}
      {loading && (
        <UniversalCard>
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </UniversalCard>
      )}

      {/* Documents Table */}
      {!loading && documents.length > 0 && (
        <UniversalCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'שם קובץ' : 'File Name'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'סוג' : 'Type'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'תיק' : 'Case'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'גודל' : 'Size'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'תאריך' : 'Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'he' ? 'פעולות' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-white">{doc.title || doc.fileName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {doc.fileType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {doc.case?.caseNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-[#2979FF] hover:text-[#1e5bb8]"
                          title={language === 'he' ? 'הורד' : 'Download'}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-700"
                          title={language === 'he' ? 'מחק' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      {!loading && documents.length === 0 && (
        <UniversalCard>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'he' ? 'לא נמצאו מסמכים' : 'No documents found'}
            </p>
          </div>
        </UniversalCard>
      )}

      {/* Document Upload Modal */}
      {isUploadModalOpen && (
        <DocumentUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            fetchDocuments();
            toast.success(language === 'he' ? 'המסמך הועלה בהצלחה' : 'Document uploaded successfully');
          }}
        />
      )}
    </div>
  );
}
