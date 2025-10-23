'use client';

/**
 * Case Detail Page - Full case view with tabs
 * Tabs: Overview, Documents, Tasks, Notes
 * Mobile-first, accessible, with optimistic updates
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  FileText,
  CheckSquare,
  MessageSquare,
  Info,
  Download,
  Upload,
  Plus,
  Calendar,
  DollarSign,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  LawCard,
  LawCardHeader,
  LawCardTitle,
  LawCardContent,
  LawButton,
  CaseStatusBadge,
  PriorityBadge,
  LawEmptyState,
} from '@/components/law/shared';
import { CaseModal } from '@/components/law/cases/CaseModal';
import { useCase, useDeleteCase } from '@/lib/hooks/law/useCases';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import type { Case } from '@/lib/types/law/case';

type TabType = 'overview' | 'documents' | 'tasks' | 'notes';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
];

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: caseData, isLoading, error } = useCase(caseId);
  const deleteMutation = useDeleteCase();

  // Sync tab with URL query param
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Track page view
  useEffect(() => {
    if (caseData) {
      trackEventWithConsent('case_detail_view', {
        caseId,
        caseType: caseData.type,
        caseStatus: caseData.status,
      });
    }
  }, [caseId, caseData]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());

    trackEventWithConsent('case_tab_switch', {
      caseId,
      tab,
    });
  };

  const handleEdit = () => {
    setShowEditModal(true);
    trackEventWithConsent('case_edit_click', {
      caseId,
      source: 'detail_page',
    });
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(caseId);
      trackEventWithConsent('case_delete', {
        caseId,
        source: 'detail_page',
        success: true,
      });
      router.push('/dashboard/law/cases');
    } catch (error) {
      console.error('Failed to delete case:', error);
      trackEventWithConsent('case_delete', {
        caseId,
        source: 'detail_page',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-law-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-law-sm text-law-text-secondary">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-law-error mx-auto mb-4" />
          <h2 className="text-law-xl font-semibold text-law-text-primary mb-2">
            Case Not Found
          </h2>
          <p className="text-law-sm text-law-text-secondary mb-6">
            The case you're looking for doesn't exist or has been deleted.
          </p>
          <LawButton
            variant="primary"
            onClick={() => router.push('/dashboard/law/cases')}
          >
            Back to Cases
          </LawButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-law-border bg-white sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <button
                onClick={() => router.push('/dashboard/law/cases')}
                className="mt-1 p-2 hover:bg-law-primary-subtle rounded-law-md transition-colors"
                aria-label="Back to cases"
              >
                <ArrowLeft size={20} className="text-law-text-secondary" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-law-2xl font-bold text-law-text-primary truncate">
                    {caseData.title}
                  </h1>
                  <CaseStatusBadge status={caseData.status} size="md" />
                  <PriorityBadge priority={caseData.priority} size="md" />
                </div>
                <div className="flex items-center gap-4 text-law-sm text-law-text-secondary flex-wrap">
                  <span className="font-medium">{caseData.caseNumber}</span>
                  <span>•</span>
                  <span>{caseData.client.name}</span>
                  <span>•</span>
                  <span>Filed {new Date(caseData.filingDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <LawButton
                variant="secondary"
                size="md"
                icon={<Edit2 size={16} />}
                onClick={handleEdit}
              >
                Edit
              </LawButton>
              <LawButton
                variant="ghost"
                size="md"
                icon={<Trash2 size={16} />}
                onClick={() => setShowDeleteConfirm(true)}
                className="text-law-error hover:bg-law-error-bg"
              >
                Delete
              </LawButton>
            </div>
          </div>

          {/* Tabs - Mobile Scroll, Desktop Inline */}
          <div className="mt-6 -mb-px overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-law-sm font-medium transition-colors
                      border-b-2 whitespace-nowrap
                      ${
                        isActive
                          ? 'border-law-primary text-law-primary'
                          : 'border-transparent text-law-text-secondary hover:text-law-text-primary hover:border-law-border'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab caseData={caseData} />}
            {activeTab === 'documents' && <DocumentsTab caseId={caseId} />}
            {activeTab === 'tasks' && <TasksTab caseId={caseId} />}
            {activeTab === 'notes' && <NotesTab caseId={caseId} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <CaseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        caseToEdit={caseData}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-law-lg shadow-law-xl max-w-md w-full p-6"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-law-error-bg rounded-law-lg">
                    <AlertCircle className="w-6 h-6 text-law-error" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-law-lg font-semibold text-law-text-primary mb-1">
                      Delete Case
                    </h3>
                    <p className="text-law-sm text-law-text-secondary">
                      Are you sure you want to delete "{caseData.title}"? This action cannot be
                      undone.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <LawButton
                    variant="ghost"
                    size="md"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </LawButton>
                  <LawButton
                    variant="primary"
                    size="md"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-law-error hover:bg-law-error/90"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Case'}
                  </LawButton>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ caseData }: { caseData: Case }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Case Information */}
      <LawCard padding="lg" shadow="md">
        <LawCardHeader>
          <LawCardTitle>Case Information</LawCardTitle>
        </LawCardHeader>
        <LawCardContent>
          <div className="space-y-4">
            <InfoRow label="Case Type" value={caseData.type} />
            <InfoRow label="Description" value={caseData.description || 'No description'} />
            <InfoRow
              label="Status"
              value={<CaseStatusBadge status={caseData.status} size="sm" />}
            />
            <InfoRow
              label="Priority"
              value={<PriorityBadge priority={caseData.priority} size="sm" />}
            />
            <InfoRow
              label="Filing Date"
              value={new Date(caseData.filingDate).toLocaleDateString()}
              icon={<Calendar size={16} />}
            />
            {caseData.nextHearingDate && (
              <InfoRow
                label="Next Hearing"
                value={new Date(caseData.nextHearingDate).toLocaleDateString()}
                icon={<Calendar size={16} />}
              />
            )}
            {caseData.closedDate && (
              <InfoRow
                label="Closed Date"
                value={new Date(caseData.closedDate).toLocaleDateString()}
                icon={<Calendar size={16} />}
              />
            )}
          </div>
        </LawCardContent>
      </LawCard>

      {/* Client Information */}
      <LawCard padding="lg" shadow="md">
        <LawCardHeader>
          <LawCardTitle>Client Information</LawCardTitle>
        </LawCardHeader>
        <LawCardContent>
          <div className="space-y-4">
            <InfoRow label="Name" value={caseData.client.name} icon={<User size={16} />} />
            {caseData.client.email && (
              <InfoRow label="Email" value={caseData.client.email} />
            )}
            {caseData.client.phone && (
              <InfoRow label="Phone" value={caseData.client.phone} />
            )}
          </div>
        </LawCardContent>
      </LawCard>

      {/* Assignment & Billing */}
      <LawCard padding="lg" shadow="md">
        <LawCardHeader>
          <LawCardTitle>Assignment & Billing</LawCardTitle>
        </LawCardHeader>
        <LawCardContent>
          <div className="space-y-4">
            <InfoRow
              label="Assigned Attorney"
              value={caseData.assignedAttorney.name}
              icon={<User size={16} />}
            />
            {caseData.billingRate && (
              <InfoRow
                label="Billing Rate"
                value={`$${caseData.billingRate}/hour`}
                icon={<DollarSign size={16} />}
              />
            )}
            {caseData.estimatedValue && (
              <InfoRow
                label="Estimated Value"
                value={`$${caseData.estimatedValue.toLocaleString()}`}
                icon={<DollarSign size={16} />}
              />
            )}
          </div>
        </LawCardContent>
      </LawCard>

      {/* Timeline */}
      <LawCard padding="lg" shadow="md">
        <LawCardHeader>
          <LawCardTitle>Timeline</LawCardTitle>
        </LawCardHeader>
        <LawCardContent>
          <div className="space-y-4">
            <InfoRow
              label="Created"
              value={new Date(caseData.createdAt).toLocaleDateString()}
              icon={<Clock size={16} />}
            />
            <InfoRow
              label="Last Updated"
              value={new Date(caseData.updatedAt).toLocaleDateString()}
              icon={<Clock size={16} />}
            />
          </div>
        </LawCardContent>
      </LawCard>
    </div>
  );
}

// Documents Tab Component
function DocumentsTab({ caseId }: { caseId: string }) {
  const [documents] = useState<any[]>([]); // Mock data - will be replaced with real hook

  return (
    <LawCard padding="lg" shadow="md">
      <LawCardHeader>
        <LawCardTitle>Case Documents</LawCardTitle>
        <LawButton variant="primary" size="sm" icon={<Upload size={16} />}>
          Upload Document
        </LawButton>
      </LawCardHeader>
      <LawCardContent>
        {documents.length === 0 ? (
          <LawEmptyState
            title="No documents yet"
            description="Upload your first document to get started"
            action={{
              label: 'Upload Document',
              onClick: () => console.log('Upload document'),
            }}
          />
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-law-border rounded-law-md hover:bg-law-primary-subtle transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-law-primary" size={20} />
                  <div>
                    <p className="text-law-sm font-medium text-law-text-primary">{doc.name}</p>
                    <p className="text-law-xs text-law-text-secondary">
                      {doc.size} • Uploaded {doc.uploadedAt}
                    </p>
                  </div>
                </div>
                <LawButton variant="ghost" size="sm" icon={<Download size={16} />}>
                  Download
                </LawButton>
              </div>
            ))}
          </div>
        )}
      </LawCardContent>
    </LawCard>
  );
}

// Tasks Tab Component
function TasksTab({ caseId }: { caseId: string }) {
  const [tasks] = useState<any[]>([]); // Mock data - will be replaced with real hook

  return (
    <LawCard padding="lg" shadow="md">
      <LawCardHeader>
        <LawCardTitle>Case Tasks</LawCardTitle>
        <LawButton variant="primary" size="sm" icon={<Plus size={16} />}>
          Add Task
        </LawButton>
      </LawCardHeader>
      <LawCardContent>
        {tasks.length === 0 ? (
          <LawEmptyState
            title="No tasks yet"
            description="Create your first task to track case progress"
            action={{
              label: 'Add Task',
              onClick: () => console.log('Add task'),
            }}
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-4 border border-law-border rounded-law-md hover:bg-law-primary-subtle transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => console.log('Toggle task')}
                  className="mt-1 w-4 h-4 rounded border-law-border text-law-primary focus:ring-law-primary"
                />
                <div className="flex-1">
                  <p className="text-law-sm font-medium text-law-text-primary mb-1">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-law-xs text-law-text-secondary">
                      Due {task.dueDate}
                    </span>
                    {task.priority === 'high' && (
                      <>
                        <span className="text-law-xs text-law-text-tertiary">•</span>
                        <PriorityBadge priority={task.priority} size="sm" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </LawCardContent>
    </LawCard>
  );
}

// Notes Tab Component
function NotesTab({ caseId }: { caseId: string }) {
  const [notes] = useState<any[]>([]); // Mock data - will be replaced with real hook
  const [newNote, setNewNote] = useState('');

  return (
    <LawCard padding="lg" shadow="md">
      <LawCardHeader>
        <LawCardTitle>Case Notes</LawCardTitle>
      </LawCardHeader>
      <LawCardContent>
        {/* Add Note Form */}
        <div className="mb-6">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note to this case..."
            className="w-full px-4 py-3 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary resize-none"
            rows={3}
          />
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-law-sm text-law-text-secondary">
              <input type="checkbox" className="rounded border-law-border" />
              Private note (only visible to you)
            </label>
            <LawButton
              variant="primary"
              size="sm"
              disabled={!newNote.trim()}
              onClick={() => {
                console.log('Add note:', newNote);
                setNewNote('');
              }}
            >
              Add Note
            </LawButton>
          </div>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <LawEmptyState
            title="No notes yet"
            description="Add your first note to document case progress"
          />
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 border border-law-border rounded-law-md bg-law-primary-subtle/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-law-sm font-medium text-law-text-primary">
                      {note.author}
                    </span>
                    {note.isPrivate && (
                      <span className="text-law-xs text-law-text-tertiary">(Private)</span>
                    )}
                  </div>
                  <span className="text-law-xs text-law-text-secondary">{note.timestamp}</span>
                </div>
                <p className="text-law-sm text-law-text-primary">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </LawCardContent>
    </LawCard>
  );
}

// Helper Component - Info Row
function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-law-border last:border-0 last:pb-0">
      <span className="text-law-sm font-medium text-law-text-secondary">{label}</span>
      <div className="flex items-center gap-2 text-law-sm text-law-text-primary font-medium text-right">
        {icon && <span className="text-law-text-tertiary">{icon}</span>}
        {value}
      </div>
    </div>
  );
}
