'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { lawApi } from '@/lib/api/law';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { CaseStatusBadge } from '@/components/law/CaseStatusBadge';
import { PriorityBadge } from '@/components/law/PriorityBadge';
import { CaseModal } from '@/components/law/modals';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, FileText, CheckSquare, Activity, Download, Trash2 } from 'lucide-react';

interface LawCase {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  client?: { id: string; name: string; email: string; phone?: string };
  assignedTo?: { id: string; name: string };
  caseType: string;
  status: 'active' | 'pending' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  filingDate?: string;
  nextHearingDate?: string;
  closingDate?: string;
  createdAt: string;
}

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  dueDate?: string;
  completedDate?: string;
  assignedTo?: { name: string };
}

interface TimelineActivity {
  id?: string;
  action: string;
  details?: string;
  timestamp: string;
  user?: { name: string };
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();

  const [lawCase, setLawCase] = useState<LawCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'documents' | 'tasks' | 'activity'>('summary');

  // Tab-specific data
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeline, setTimeline] = useState<TimelineActivity[]>([]);
  const [loadingTabData, setLoadingTabData] = useState(false);

  // Modal state
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [params.id]);

  useEffect(() => {
    if (activeTab === 'documents') fetchDocuments();
    else if (activeTab === 'tasks') fetchTasks();
    else if (activeTab === 'activity') fetchTimeline();
  }, [activeTab]);

  const fetchCase = async () => {
    setLoading(true);
    try {
      const response = await lawApi.cases.get(params.id as string);
      setLawCase(response);
    } catch (error) {
      console.error('Failed to load case:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת תיק' : 'Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoadingTabData(true);
    try {
      const response = await lawApi.documents.list({ caseId: params.id as string, limit: 100 });
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoadingTabData(false);
    }
  };

  const fetchTasks = async () => {
    setLoadingTabData(true);
    try {
      const response = await lawApi.tasks.list({ caseId: params.id as string, limit: 100 });
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoadingTabData(false);
    }
  };

  const fetchTimeline = async () => {
    setLoadingTabData(true);
    try {
      const response = await lawApi.cases.getTimeline(params.id as string);
      setTimeline(response || []);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    } finally {
      setLoadingTabData(false);
    }
  };

  const handleDownloadDocument = async (docId: string) => {
    try {
      const response = await lawApi.documents.getDownloadUrl(docId);
      if (response.url) {
        window.open(response.url, '_blank');
      }
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהורדת מסמך' : 'Failed to download document');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm(language === 'he' ? 'האם למחוק מסמך זה?' : 'Delete this document?')) return;

    try {
      await lawApi.documents.delete(docId);
      toast.success(language === 'he' ? 'המסמך נמחק' : 'Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקה' : 'Failed to delete');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!lawCase) {
    return (
      <div className="p-6">
        <p className="text-gray-500">{language === 'he' ? 'תיק לא נמצא' : 'Case not found'}</p>
      </div>
    );
  }

  const tabs = [
    { id: 'summary' as const, label: language === 'he' ? 'סיכום' : 'Summary', icon: FileText },
    { id: 'documents' as const, label: language === 'he' ? 'מסמכים' : 'Documents', icon: FileText },
    { id: 'tasks' as const, label: language === 'he' ? 'משימות' : 'Tasks', icon: CheckSquare },
    { id: 'activity' as const, label: language === 'he' ? 'פעילות' : 'Activity', icon: Activity },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/law/cases')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{lawCase.caseNumber}</h1>
              <CaseStatusBadge status={lawCase.status} />
              <PriorityBadge priority={lawCase.priority} />
            </div>
            <p className="text-gray-600 dark:text-gray-400">{lawCase.title}</p>
          </div>
        </div>
        <button
          onClick={() => setIsCaseModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          {language === 'he' ? 'ערוך' : 'Edit'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UniversalCard title={language === 'he' ? 'פרטי לקוח' : 'Client Information'}>
              <div className="p-6 space-y-2">
                <p>
                  <strong>{language === 'he' ? 'שם:' : 'Name:'}</strong> {lawCase.client?.name || 'N/A'}
                </p>
                <p>
                  <strong>{language === 'he' ? 'אימייל:' : 'Email:'}</strong> {lawCase.client?.email || 'N/A'}
                </p>
                <p>
                  <strong>{language === 'he' ? 'טלפון:' : 'Phone:'}</strong> {lawCase.client?.phone || 'N/A'}
                </p>
              </div>
            </UniversalCard>

            <UniversalCard title={language === 'he' ? 'פרטי תיק' : 'Case Details'}>
              <div className="p-6 space-y-2">
                <p>
                  <strong>{language === 'he' ? 'סוג:' : 'Type:'}</strong> {lawCase.caseType}
                </p>
                <p>
                  <strong>{language === 'he' ? 'עורך דין:' : 'Attorney:'}</strong>{' '}
                  {lawCase.assignedTo?.name || 'Unassigned'}
                </p>
                <p>
                  <strong>{language === 'he' ? 'תאריך הגשה:' : 'Filing Date:'}</strong>{' '}
                  {lawCase.filingDate ? new Date(lawCase.filingDate).toLocaleDateString() : 'N/A'}
                </p>
                <p>
                  <strong>{language === 'he' ? 'דיון הבא:' : 'Next Hearing:'}</strong>{' '}
                  {lawCase.nextHearingDate ? new Date(lawCase.nextHearingDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </UniversalCard>

            {lawCase.description && (
              <UniversalCard title={language === 'he' ? 'תיאור' : 'Description'} className="md:col-span-2">
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300">{lawCase.description}</p>
                </div>
              </UniversalCard>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <UniversalCard title={language === 'he' ? 'מסמכים' : 'Documents'}>
            {loadingTabData ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">{language === 'he' ? 'אין מסמכים' : 'No documents'}</p>
              </div>
            ) : (
              <div className="p-6 space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{doc.title || doc.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()} • {formatFileSize(doc.fileSize)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadDocument(doc.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title={language === 'he' ? 'הורד' : 'Download'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700"
                        title={language === 'he' ? 'מחק' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </UniversalCard>
        )}

        {activeTab === 'tasks' && (
          <UniversalCard title={language === 'he' ? 'משימות' : 'Tasks'}>
            {loadingTabData ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">{language === 'he' ? 'אין משימות' : 'No tasks'}</p>
              </div>
            ) : (
              <div className="p-6 space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        {language === 'he' ? 'תאריך יעד:' : 'Due:'}{' '}
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            )}
          </UniversalCard>
        )}

        {activeTab === 'activity' && (
          <UniversalCard title={language === 'he' ? 'פעילות אחרונה' : 'Recent Activity'}>
            {loadingTabData ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">{language === 'he' ? 'טוען...' : 'Loading...'}</p>
              </div>
            ) : timeline.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">{language === 'he' ? 'אין פעילות' : 'No activity'}</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {timeline.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      {activity.details && <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </UniversalCard>
        )}
      </div>

      {/* Case Edit Modal */}
      {isCaseModalOpen && (
        <CaseModal
          lawCase={lawCase}
          onClose={() => setIsCaseModalOpen(false)}
          onSuccess={() => {
            setIsCaseModalOpen(false);
            fetchCase();
            toast.success(language === 'he' ? 'התיק עודכן בהצלחה' : 'Case updated successfully');
          }}
        />
      )}
    </div>
  );
}
