'use client';

/**
 * Creative Productions - Project Workspace Client (Redesigned with Design System 2.0)
 * Tabbed interface with modern cards, tables, and forms
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Film,
  AlertCircle,
  Eye,
  Palette,
  Users,
  Edit,
  Download,
} from 'lucide-react';

// Import unified components
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  UniversalBadge,
  StatusBadge,
  FormModal,
  UniversalTable,
  UniversalTableHeader,
  UniversalTableBody,
  UniversalTableRow,
  UniversalTableHead,
  UniversalTableCell,
  TableEmptyState,
  CountBadge,
} from '@/components/shared';

type TabType = 'brief' | 'tasks' | 'assets' | 'reviews' | 'renders';

interface Project {
  id: string;
  name: string;
  objective?: string | null;
  targetAudience?: string | null;
  channels: string[];
  status: string;
  dueDate?: string | null;
  ownerUid: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  assets: Asset[];
  reviews: Review[];
  renders: Render[];
}

interface Task {
  id: string;
  type: string;
  title: string;
  status: string;
  assigneeUid?: string | null;
  priority: number;
  dueAt?: string | null;
  createdAt: string;
}

interface Asset {
  id: string;
  title: string;
  type: string;
  storageUrl: string;
  size?: number | null;
  tags: string[];
  createdAt: string;
}

interface Review {
  id: string;
  reviewerUid: string;
  status: string;
  comments?: string | null;
  requestedAt: string;
  decidedAt?: string | null;
}

interface Render {
  id: string;
  format: string;
  status: string;
  outputUrl?: string | null;
  createdAt: string;
}

export default function ProjectWorkspaceClient() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('brief');

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/productions/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');

      const data = await res.json();
      setProject(data.project);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;

    try {
      const res = await fetch(`/api/productions/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setProject(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const getStatusType = (status: string): 'active' | 'pending' | 'completed' | 'cancelled' => {
    switch (status) {
      case 'DRAFT':
        return 'pending';
      case 'IN_PROGRESS':
        return 'active';
      case 'REVIEW':
        return 'pending';
      case 'APPROVED':
      case 'DELIVERED':
        return 'completed';
      default:
        return 'pending';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-[#1A2F4B] rounded-lg w-64"></div>
          <div className="h-96 bg-gray-200 dark:bg-[#1A2F4B] rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 flex items-center justify-center">
        <UniversalCard variant="outlined" className="max-w-md p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error ? 'Error Loading Project' : 'Project Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The project you are looking for does not exist.'}
          </p>
          <UniversalButton
            variant="primary"
            onClick={() => router.push('/dashboard/productions/projects')}
          >
            Back to Projects
          </UniversalButton>
        </UniversalCard>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'brief', label: 'Brief', icon: <FileText className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', count: project.tasks.length, icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'assets', label: 'Assets', count: project.assets.length, icon: <Film className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews', count: project.reviews.length, icon: <Eye className="w-4 h-4" /> },
    { id: 'renders', label: 'Renders', count: project.renders.length, icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <UniversalButton
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push('/dashboard/productions/projects')}
            className="mb-4"
          >
            Back to Projects
          </UniversalButton>

          <UniversalCard variant="elevated">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Left: Project Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <h1 className="text-heading-1 text-gray-900 dark:text-white">
                      {project.name}
                    </h1>
                  </div>

                  {project.objective && (
                    <p className="text-body-base text-gray-600 dark:text-gray-400 mb-4">
                      {project.objective}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={getStatusType(project.status)} />
                    {project.dueDate && (
                      <UniversalBadge variant="outline" icon={<Calendar className="w-3 h-3" />}>
                        Due {new Date(project.dueDate).toLocaleDateString()}
                      </UniversalBadge>
                    )}
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-col gap-3 min-w-[240px]">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Status
                    </label>
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>

                  {project.channels.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Channels
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {project.channels.map((channel, idx) => (
                          <UniversalBadge key={idx} variant="primary" size="sm">
                            {channel.replace('_', ' ')}
                          </UniversalBadge>
                        ))}
                      </div>
                    </div>
                  )}

                  <UniversalButton variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                    Edit Project
                  </UniversalButton>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-200 dark:border-[#2979FF]/20 px-6">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                      activeTab === tab.id
                        ? 'text-[#2979FF] border-[#2979FF]'
                        : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#2979FF]/40'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <CountBadge count={tab.count} variant="primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </UniversalCard>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'brief' && <BriefTab project={project} />}
          {activeTab === 'tasks' && <TasksTab projectId={project.id} tasks={project.tasks} onRefresh={fetchProject} />}
          {activeTab === 'assets' && <AssetsTab projectId={project.id} assets={project.assets} />}
          {activeTab === 'reviews' && <ReviewsTab reviews={project.reviews} />}
          {activeTab === 'renders' && <RendersTab renders={project.renders} />}
        </div>
      </div>
    </div>
  );
}

// Brief Tab Component
function BriefTab({ project }: { project: Project }) {
  return (
    <div className="max-w-4xl space-y-6">
      <UniversalCard>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2979FF]" />
            <h2 className="text-heading-3 text-gray-900 dark:text-white">Project Brief</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Project Name
              </h3>
              <p className="text-body-lg text-gray-900 dark:text-white">{project.name}</p>
            </div>

            {project.objective && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Objective
                </h3>
                <p className="text-body-base text-gray-900 dark:text-white whitespace-pre-wrap">
                  {project.objective}
                </p>
              </div>
            )}

            {project.targetAudience && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Target Audience
                </h3>
                <p className="text-body-base text-gray-900 dark:text-white">
                  {project.targetAudience}
                </p>
              </div>
            )}

            {project.channels.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Target Channels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.channels.map((channel, idx) => (
                    <UniversalBadge key={idx} variant="primary" size="md">
                      {channel.replace('_', ' ')}
                    </UniversalBadge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-[#2979FF]/20">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </UniversalCard>
    </div>
  );
}

// Tasks Tab Component
interface TasksTabProps {
  projectId: string;
  tasks: Task[];
  onRefresh: () => void;
}

function TasksTab({ projectId, tasks, onRefresh }: TasksTabProps) {
  const [showNewTask, setShowNewTask] = useState(false);

  const tasksByStatus = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    DOING: tasks.filter(t => t.status === 'DOING'),
    REVIEW: tasks.filter(t => t.status === 'REVIEW'),
    DONE: tasks.filter(t => t.status === 'DONE'),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-3 text-gray-900 dark:text-white">Tasks Board</h2>
        <UniversalButton
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowNewTask(true)}
        >
          Add Task
        </UniversalButton>
      </div>

      {tasks.length === 0 ? (
        <UniversalCard>
          <CardBody>
            <TableEmptyState
              icon={<CheckCircle2 className="w-12 h-12" />}
              title="No tasks yet"
              description="Create your first task to start tracking project progress"
              action={
                <UniversalButton
                  variant="primary"
                  onClick={() => setShowNewTask(true)}
                >
                  Create First Task
                </UniversalButton>
              }
            />
          </CardBody>
        </UniversalCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['TODO', 'DOING', 'REVIEW', 'DONE'] as const).map(status => (
            <UniversalCard key={status} variant="default">
              <CardHeader className="border-b border-gray-200 dark:border-[#2979FF]/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {status.replace('_', ' ')}
                  </h3>
                  <CountBadge count={tasksByStatus[status].length} />
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {tasksByStatus[status].map(task => (
                    <UniversalCard key={task.id} variant="flat" hoverable className="p-3">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <UniversalBadge variant="outline" size="sm">
                          {task.type}
                        </UniversalBadge>
                        {task.dueAt && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            Due {new Date(task.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </UniversalCard>
                  ))}
                </div>
              </CardBody>
            </UniversalCard>
          ))}
        </div>
      )}

      {showNewTask && (
        <NewTaskModal
          projectId={projectId}
          onClose={() => setShowNewTask(false)}
          onSuccess={() => {
            setShowNewTask(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// Assets Tab Component
function AssetsTab({ projectId, assets }: { projectId: string; assets: Asset[] }) {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Film className="w-8 h-8" />;
      case 'IMAGE':
        return <FileText className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-3 text-gray-900 dark:text-white">Assets Library</h2>
        <UniversalButton variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Upload Asset
        </UniversalButton>
      </div>

      {assets.length === 0 ? (
        <UniversalCard>
          <CardBody>
            <TableEmptyState
              icon={<Film className="w-12 h-12" />}
              title="No assets uploaded"
              description="Upload videos, images, or documents to this project"
              action={
                <UniversalButton variant="primary">
                  Upload First Asset
                </UniversalButton>
              }
            />
          </CardBody>
        </UniversalCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map(asset => (
            <UniversalCard key={asset.id} hoverable>
              <CardBody>
                <div className="aspect-square bg-gray-100 dark:bg-[#0E1A2B] rounded-lg mb-3 flex items-center justify-center text-[#2979FF]">
                  {getAssetIcon(asset.type)}
                </div>
                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
                  {asset.title}
                </h4>
                <div className="flex items-center justify-between">
                  <UniversalBadge variant="outline" size="sm">{asset.type}</UniversalBadge>
                  {asset.size && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(asset.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>
              </CardBody>
            </UniversalCard>
          ))}
        </div>
      )}
    </div>
  );
}

// Reviews Tab Component
function ReviewsTab({ reviews }: { reviews: Review[] }) {
  const getReviewBadgeVariant = (status: string): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'CHANGES_REQUESTED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-heading-3 text-gray-900 dark:text-white">Review History</h2>

      {reviews.length === 0 ? (
        <UniversalCard>
          <CardBody>
            <TableEmptyState
              icon={<Eye className="w-12 h-12" />}
              title="No reviews yet"
              description="Request reviews from team members or clients"
            />
          </CardBody>
        </UniversalCard>
      ) : (
        <UniversalCard>
          <CardBody>
            <div className="space-y-3">
              {reviews.map(review => (
                <div
                  key={review.id}
                  className="p-4 bg-gray-50 dark:bg-[#0E1A2B] rounded-lg border border-gray-200 dark:border-[#2979FF]/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <UniversalBadge variant={getReviewBadgeVariant(review.status)}>
                      {review.status.replace('_', ' ')}
                    </UniversalBadge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(review.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comments && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {review.comments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </UniversalCard>
      )}
    </div>
  );
}

// Renders Tab Component
function RendersTab({ renders }: { renders: Render[] }) {
  const getRenderStatus = (status: string): 'active' | 'completed' | 'cancelled' | 'pending' => {
    switch (status) {
      case 'READY':
        return 'completed';
      case 'RENDERING':
        return 'active';
      case 'FAILED':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-3 text-gray-900 dark:text-white">Renders</h2>
        <UniversalButton variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          New Render
        </UniversalButton>
      </div>

      {renders.length === 0 ? (
        <UniversalCard>
          <CardBody>
            <TableEmptyState
              icon={<Palette className="w-12 h-12" />}
              title="No renders created"
              description="Create renders for different formats and platforms"
              action={
                <UniversalButton variant="primary">
                  Create First Render
                </UniversalButton>
              }
            />
          </CardBody>
        </UniversalCard>
      ) : (
        <UniversalCard>
          <UniversalTable>
            <UniversalTableHeader>
              <UniversalTableRow>
                <UniversalTableHead>Format</UniversalTableHead>
                <UniversalTableHead>Status</UniversalTableHead>
                <UniversalTableHead>Created</UniversalTableHead>
                <UniversalTableHead></UniversalTableHead>
              </UniversalTableRow>
            </UniversalTableHeader>
            <UniversalTableBody>
              {renders.map(render => (
                <UniversalTableRow key={render.id} hoverable>
                  <UniversalTableCell>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {render.format}
                    </span>
                  </UniversalTableCell>
                  <UniversalTableCell>
                    <StatusBadge status={getRenderStatus(render.status)} />
                  </UniversalTableCell>
                  <UniversalTableCell>
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(render.createdAt).toLocaleDateString()}
                    </span>
                  </UniversalTableCell>
                  <UniversalTableCell>
                    {render.outputUrl && (
                      <UniversalButton
                        variant="ghost"
                        size="sm"
                        leftIcon={<Download className="w-4 h-4" />}
                      >
                        Download
                      </UniversalButton>
                    )}
                  </UniversalTableCell>
                </UniversalTableRow>
              ))}
            </UniversalTableBody>
          </UniversalTable>
        </UniversalCard>
      )}
    </div>
  );
}

// New Task Modal Component
interface NewTaskModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function NewTaskModal({ projectId, onClose, onSuccess }: NewTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'SCRIPT',
    priority: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const res = await fetch('/api/productions/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, projectId }),
      });

      if (!res.ok) throw new Error('Failed to create task');

      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="New Task"
      description="Create a new task for this project"
      submitText="Create Task"
      cancelText="Cancel"
      loading={submitting}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
            placeholder="Write script for Scene 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
          >
            <option value="SCRIPT">Script</option>
            <option value="DESIGN">Design</option>
            <option value="EDIT">Edit</option>
            <option value="VOICEOVER">Voiceover</option>
            <option value="SHOOT">Shoot</option>
            <option value="CUTDOWN">Cutdown</option>
            <option value="LOCALIZATION">Localization</option>
          </select>
        </div>
      </div>
    </FormModal>
  );
}
