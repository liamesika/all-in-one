'use client';

/**
 * Productions - Project Workspace Client
 * Tabbed interface with Overview, Tasks, Budget, and Files
 * Connected to ProductionProject backend via React Query
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  DollarSign,
  Folder,
  LayoutDashboard,
  ListTodo,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import unified components
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
  UniversalBadge,
  FormModal,
  UniversalTable,
  UniversalTableHeader,
  UniversalTableBody,
  UniversalTableRow,
  UniversalTableHead,
  UniversalTableCell,
  TableEmptyState,
} from '@/components/shared';

// Import React Query hooks
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useBudget,
  useCreateBudgetItem,
  useUpdateBudgetItem,
  useDeleteBudgetItem,
  useFiles,
  useUploadFile,
  useDeleteFile,
} from '@/hooks/useProductionsData';

import {
  ProjectStatus,
  ProjectType,
  ProductionTaskStatus,
  TaskDomain,
  BudgetCategory,
  type ProductionProject,
  type ProductionTask,
  type ProductionBudgetItem,
  type ProductionFileAsset,
} from '@/lib/api/productions';

type TabType = 'overview' | 'tasks' | 'budget' | 'files';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' }> = {
  PLANNING: { label: 'Planning', color: 'default' },
  ACTIVE: { label: 'Active', color: 'primary' },
  DONE: { label: 'Done', color: 'success' },
  ON_HOLD: { label: 'On Hold', color: 'warning' },
};

const TASK_STATUS_CONFIG: Record<ProductionTaskStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' }> = {
  OPEN: { label: 'Open', color: 'default' },
  IN_PROGRESS: { label: 'In Progress', color: 'primary' },
  DONE: { label: 'Done', color: 'success' },
  BLOCKED: { label: 'Blocked', color: 'warning' },
};

export default function ProjectWorkspaceClient() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);

  // Fetch project data
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  // Fetch tab data
  const { data: tasks = [] } = useTasks({ projectId });
  const { data: budgetItems = [] } = useBudget({ projectId });
  const { data: files = [] } = useFiles({ projectId });

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-[#1A2F4B] rounded-lg w-64"></div>
            <div className="h-[600px] bg-gray-200 dark:bg-[#1A2F4B] rounded-xl"></div>
          </div>
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
            {error instanceof Error ? error.message : 'This project may have been deleted or you may not have access.'}
          </p>
          <div className="flex gap-3 justify-center">
            <UniversalButton variant="ghost" onClick={() => router.push('/dashboard/productions/projects')}>
              Back to Projects
            </UniversalButton>
            {error && (
              <UniversalButton variant="primary" onClick={() => refetch()}>
                Retry
              </UniversalButton>
            )}
          </div>
        </UniversalCard>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      await updateProject.mutateAsync({ id: projectId, data: { status: newStatus } });
      toast.success('Project status updated');
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProject.mutateAsync(projectId);
      toast.success('Project deleted');
      router.push('/dashboard/productions/projects');
    } catch (err: any) {
      toast.error('Failed to delete project');
    }
  };

  const tabs: { id: TabType; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', count: tasks.length, icon: <ListTodo className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget', count: budgetItems.length, icon: <DollarSign className="w-4 h-4" /> },
    { id: 'files', label: 'Files', count: files.length, icon: <Folder className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <UniversalButton
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/dashboard/productions/projects')}
              className="mb-3"
            >
              Back to Projects
            </UniversalButton>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">{project.name}</h1>
                {project.description && (
                  <p className="text-body-base text-gray-600 dark:text-gray-400">{project.description}</p>
                )}
              </div>
              <UniversalBadge variant={STATUS_CONFIG[project.status].color}>
                {STATUS_CONFIG[project.status].label}
              </UniversalBadge>
            </div>
          </div>
          <div className="flex gap-2">
            <UniversalButton
              variant="ghost"
              size="md"
              onClick={handleDeleteProject}
              disabled={deleteProject.isPending}
            >
              Delete Project
            </UniversalButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-[#2979FF]/20">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#2979FF] border-b-2 border-[#2979FF]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-[#1A2F4B] rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab project={project} onStatusChange={handleStatusChange} />}
        {activeTab === 'tasks' && (
          <TasksTab
            projectId={projectId}
            tasks={tasks}
            onNewTask={() => setShowNewTaskModal(true)}
          />
        )}
        {activeTab === 'budget' && (
          <BudgetTab
            projectId={projectId}
            budgetItems={budgetItems}
            onNewItem={() => setShowNewBudgetModal(true)}
          />
        )}
        {activeTab === 'files' && <FilesTab projectId={projectId} files={files} />}

        {/* Modals */}
        {showNewTaskModal && (
          <NewTaskModal
            projectId={projectId}
            onClose={() => setShowNewTaskModal(false)}
            onSuccess={() => setShowNewTaskModal(false)}
          />
        )}

        {showNewBudgetModal && (
          <NewBudgetModal
            projectId={projectId}
            onClose={() => setShowNewBudgetModal(false)}
            onSuccess={() => setShowNewBudgetModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// ==================== Overview Tab ====================

interface OverviewTabProps {
  project: ProductionProject;
  onStatusChange: (status: ProjectStatus) => void;
}

function OverviewTab({ project, onStatusChange }: OverviewTabProps) {
  const projectTypes = {
    CONFERENCE: 'Conference',
    SHOW: 'Show',
    FILMING: 'Filming',
    OTHER: 'Other',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Info */}
      <UniversalCard>
        <CardHeader title="Project Information" />
        <CardBody>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
              <dd className="mt-1 text-base text-gray-900 dark:text-white">{projectTypes[project.type]}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1">
                <select
                  value={project.status}
                  onChange={(e) => onStatusChange(e.target.value as ProjectStatus)}
                  className="px-3 py-2 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                >
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </dd>
            </div>
            {project.startDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</dt>
                <dd className="mt-1 text-base text-gray-900 dark:text-white">
                  {new Date(project.startDate).toLocaleDateString()}
                </dd>
              </div>
            )}
            {project.endDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</dt>
                <dd className="mt-1 text-base text-gray-900 dark:text-white">
                  {new Date(project.endDate).toLocaleDateString()}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="mt-1 text-base text-gray-900 dark:text-white">
                {new Date(project.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardBody>
      </UniversalCard>

      {/* Quick Stats */}
      <UniversalCard>
        <CardHeader title="Quick Stats" />
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Tasks</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {project._count?.tasks || 0}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">Budget Items</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {project._count?.budgetItems || 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Files</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {project._count?.files || 0}
              </p>
            </div>
          </div>
        </CardBody>
      </UniversalCard>
    </div>
  );
}

// ==================== Tasks Tab ====================

interface TasksTabProps {
  projectId: string;
  tasks: ProductionTask[];
  onNewTask: () => void;
}

function TasksTab({ projectId, tasks, onNewTask }: TasksTabProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleStatusChange = async (taskId: string, newStatus: ProductionTaskStatus) => {
    try {
      await updateTask.mutateAsync({ id: taskId, data: { status: newStatus } });
      toast.success('Task updated');
    } catch (err: any) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted');
    } catch (err: any) {
      toast.error('Failed to delete task');
    }
  };

  if (tasks.length === 0) {
    return (
      <UniversalCard>
        <CardBody>
          <TableEmptyState
            icon={<ListTodo className="w-16 h-16" />}
            title="No tasks yet"
            description="Create your first task to get started"
            action={
              <UniversalButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={onNewTask}>
                New Task
              </UniversalButton>
            }
          />
        </CardBody>
      </UniversalCard>
    );
  }

  return (
    <UniversalCard>
      <CardHeader
        title="Tasks"
        action={
          <UniversalButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onNewTask}>
            New Task
          </UniversalButton>
        }
      />
      <CardBody>
        <UniversalTable>
          <UniversalTableHeader>
            <UniversalTableRow>
              <UniversalTableHead>Title</UniversalTableHead>
              <UniversalTableHead>Domain</UniversalTableHead>
              <UniversalTableHead>Status</UniversalTableHead>
              <UniversalTableHead>Due Date</UniversalTableHead>
              <UniversalTableHead>Actions</UniversalTableHead>
            </UniversalTableRow>
          </UniversalTableHeader>
          <UniversalTableBody>
            {tasks.map((task) => (
              <UniversalTableRow key={task.id}>
                <UniversalTableCell>{task.title}</UniversalTableCell>
                <UniversalTableCell>
                  <UniversalBadge variant="default">{task.domain}</UniversalBadge>
                </UniversalTableCell>
                <UniversalTableCell>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as ProductionTaskStatus)}
                    className="px-2 py-1 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2979FF]"
                  >
                    {Object.entries(TASK_STATUS_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </UniversalTableCell>
                <UniversalTableCell>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </UniversalTableCell>
                <UniversalTableCell>
                  <UniversalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    disabled={deleteTask.isPending}
                  >
                    Delete
                  </UniversalButton>
                </UniversalTableCell>
              </UniversalTableRow>
            ))}
          </UniversalTableBody>
        </UniversalTable>
      </CardBody>
    </UniversalCard>
  );
}

// ==================== Budget Tab ====================

interface BudgetTabProps {
  projectId: string;
  budgetItems: ProductionBudgetItem[];
  onNewItem: () => void;
}

function BudgetTab({ projectId, budgetItems, onNewItem }: BudgetTabProps) {
  const deleteBudgetItem = useDeleteBudgetItem();

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this budget item?')) return;

    try {
      await deleteBudgetItem.mutateAsync(itemId);
      toast.success('Budget item deleted');
    } catch (err: any) {
      toast.error('Failed to delete budget item');
    }
  };

  const totalPlanned = budgetItems.reduce((sum, item) => sum + item.planned, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actual, 0);

  if (budgetItems.length === 0) {
    return (
      <UniversalCard>
        <CardBody>
          <TableEmptyState
            icon={<DollarSign className="w-16 h-16" />}
            title="No budget items yet"
            description="Add budget items to track your project expenses"
            action={
              <UniversalButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={onNewItem}>
                Add Budget Item
              </UniversalButton>
            }
          />
        </CardBody>
      </UniversalCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UniversalCard>
          <CardBody>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Planned</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₪{totalPlanned.toLocaleString()}</p>
          </CardBody>
        </UniversalCard>
        <UniversalCard>
          <CardBody>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Actual</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₪{totalActual.toLocaleString()}</p>
          </CardBody>
        </UniversalCard>
        <UniversalCard>
          <CardBody>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Variance</p>
            <p className={`text-2xl font-bold ${totalActual > totalPlanned ? 'text-red-600' : 'text-green-600'}`}>
              {totalActual > totalPlanned ? '+' : ''}₪{(totalActual - totalPlanned).toLocaleString()}
            </p>
          </CardBody>
        </UniversalCard>
      </div>

      {/* Budget Items Table */}
      <UniversalCard>
        <CardHeader
          title="Budget Items"
          action={
            <UniversalButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onNewItem}>
              Add Item
            </UniversalButton>
          }
        />
        <CardBody>
          <UniversalTable>
            <UniversalTableHeader>
              <UniversalTableRow>
                <UniversalTableHead>Category</UniversalTableHead>
                <UniversalTableHead>Planned</UniversalTableHead>
                <UniversalTableHead>Actual</UniversalTableHead>
                <UniversalTableHead>Variance</UniversalTableHead>
                <UniversalTableHead>Actions</UniversalTableHead>
              </UniversalTableRow>
            </UniversalTableHeader>
            <UniversalTableBody>
              {budgetItems.map((item) => {
                const variance = item.actual - item.planned;
                return (
                  <UniversalTableRow key={item.id}>
                    <UniversalTableCell>
                      <UniversalBadge variant="default">{item.category}</UniversalBadge>
                    </UniversalTableCell>
                    <UniversalTableCell>₪{item.planned.toLocaleString()}</UniversalTableCell>
                    <UniversalTableCell>₪{item.actual.toLocaleString()}</UniversalTableCell>
                    <UniversalTableCell>
                      <span className={variance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {variance > 0 ? '+' : ''}₪{variance.toLocaleString()}
                      </span>
                    </UniversalTableCell>
                    <UniversalTableCell>
                      <UniversalButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteBudgetItem.isPending}
                      >
                        Delete
                      </UniversalButton>
                    </UniversalTableCell>
                  </UniversalTableRow>
                );
              })}
            </UniversalTableBody>
          </UniversalTable>
        </CardBody>
      </UniversalCard>
    </div>
  );
}

// ==================== Files Tab ====================

interface FilesTabProps {
  projectId: string;
  files: ProductionFileAsset[];
}

function FilesTab({ projectId, files }: FilesTabProps) {
  const deleteFile = useDeleteFile();

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      await deleteFile.mutateAsync(fileId);
      toast.success('File deleted');
    } catch (err: any) {
      toast.error('Failed to delete file');
    }
  };

  if (files.length === 0) {
    return (
      <UniversalCard>
        <CardBody>
          <TableEmptyState
            icon={<Folder className="w-16 h-16" />}
            title="No files yet"
            description="Upload files to share with your team"
          />
        </CardBody>
      </UniversalCard>
    );
  }

  return (
    <UniversalCard>
      <CardHeader title="Files" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-4 bg-gray-50 dark:bg-[#1A2F4B] rounded-lg border border-gray-200 dark:border-[#2979FF]/20"
            >
              <div className="flex items-start justify-between mb-2">
                <FileText className="w-8 h-8 text-[#2979FF]" />
                <UniversalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(file.id)}
                  disabled={deleteFile.isPending}
                >
                  Delete
                </UniversalButton>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">{file.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{file.folder}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </UniversalCard>
  );
}

// ==================== Modals ====================

interface NewTaskModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function NewTaskModal({ projectId, onClose, onSuccess }: NewTaskModalProps) {
  const createTask = useCreateTask();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: 'LOGISTICS' as TaskDomain,
    dueDate: '',
  });

  const handleSubmit = async () => {
    try {
      await createTask.mutateAsync({
        projectId,
        title: formData.title,
        description: formData.description || null,
        domain: formData.domain,
        dueDate: formData.dueDate || null,
      });
      toast.success('Task created');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
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
      loading={createTask.isPending}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            placeholder="Task title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF] resize-none"
            placeholder="Task description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Domain</label>
          <select
            value={formData.domain}
            onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value as TaskDomain }))}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
          >
            <option value="LOGISTICS">Logistics</option>
            <option value="CONTENT">Content</option>
            <option value="MARKETING">Marketing</option>
            <option value="SUPPLIERS">Suppliers</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
          />
        </div>
      </div>
    </FormModal>
  );
}

interface NewBudgetModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function NewBudgetModal({ projectId, onClose, onSuccess }: NewBudgetModalProps) {
  const createBudgetItem = useCreateBudgetItem();
  const [formData, setFormData] = useState({
    category: 'OTHER' as BudgetCategory,
    planned: '',
    actual: '',
  });

  const handleSubmit = async () => {
    try {
      await createBudgetItem.mutateAsync({
        projectId,
        category: formData.category,
        planned: parseFloat(formData.planned) || 0,
        actual: parseFloat(formData.actual) || 0,
      });
      toast.success('Budget item added');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add budget item');
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="New Budget Item"
      description="Add a budget item to track expenses"
      submitText="Add Item"
      cancelText="Cancel"
      loading={createBudgetItem.isPending}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as BudgetCategory }))}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
          >
            <option value="STAGE">Stage</option>
            <option value="LIGHTING">Lighting</option>
            <option value="CATERING">Catering</option>
            <option value="MARKETING">Marketing</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Planned Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            value={formData.planned}
            onChange={(e) => setFormData((prev) => ({ ...prev, planned: e.target.value }))}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actual Amount</label>
          <input
            type="number"
            value={formData.actual}
            onChange={(e) => setFormData((prev) => ({ ...prev, actual: e.target.value }))}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </FormModal>
  );
}
