'use client';

/**
 * Creative Productions - Projects Board Client (Redesigned with Design System 2.0)
 * Kanban view with drag-and-drop, filters, and modern modal
 * Updated to use React Query and real backend data
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Film,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import unified components
import {
  UniversalButton,
  UniversalBadge,
  FormModal,
  UniversalCard,
} from '@/components/shared';

// Import React Query hooks
import {
  useProjects,
  useUpdateProject,
  useCreateProject,
  useProjectStats,
} from '@/hooks/useProductionsData';
import { ProjectStatus, ProjectType, type ProductionProject } from '@/lib/api/productions';

type Project = ProductionProject;

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'info'; icon: React.ReactNode }> = {
  PLANNING: { label: 'Planning', color: 'default', icon: <FileText className="w-4 h-4" /> },
  ACTIVE: { label: 'Active', color: 'primary', icon: <Clock className="w-4 h-4" /> },
  DONE: { label: 'Done', color: 'success', icon: <CheckCircle2 className="w-4 h-4" /> },
  ON_HOLD: { label: 'On Hold', color: 'warning', icon: <AlertCircle className="w-4 h-4" /> },
};

export default function ProjectsBoardClient() {
  const router = useRouter();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [draggedProject, setDraggedProject] = useState<string | null>(null);

  // React Query hooks for data fetching
  const { data: projects = [], isLoading: loading, error, refetch } = useProjects();
  const { data: stats } = useProjectStats();
  const updateProject = useUpdateProject();
  const createProject = useCreateProject();

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        data: { status: newStatus },
      });
      toast.success('Project status updated');
    } catch (err: any) {
      toast.error('Failed to update project status');
      console.error('Error updating project:', err);
    }
  };

  const handleDragStart = (projectId: string) => {
    setDraggedProject(projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: ProjectStatus) => {
    e.preventDefault();
    if (draggedProject) {
      const project = projects.find(p => p.id === draggedProject);
      if (project && project.status !== newStatus) {
        handleStatusChange(draggedProject, newStatus);
      }
      setDraggedProject(null);
    }
  };

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  };

  const formatDueDate = (dueDate?: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const isOverdue = date < now;
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue,
      daysUntil,
    };
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-[#1A2F4B] rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-[600px] bg-gray-200 dark:bg-[#1A2F4B] rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 flex items-center justify-center">
        <UniversalCard variant="outlined" className="max-w-md p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Projects</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error instanceof Error ? error.message : 'An error occurred'}</p>
          <UniversalButton variant="primary" onClick={() => refetch()}>
            Retry
          </UniversalButton>
        </UniversalCard>
      </div>
    );
  }

  // Empty State
  if (!loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <UniversalButton
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.push('/dashboard/productions')}
                className="mb-3"
              >
                Back
              </UniversalButton>
              <h1 className="text-heading-1 text-gray-900 dark:text-white">Projects Board</h1>
            </div>
          </div>

          <UniversalCard variant="outlined" className="p-12 text-center">
            <Film className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No projects yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Get started by creating your first production project. Track conferences, shows, filming, and more.
            </p>
            <UniversalButton
              variant="primary"
              size="lg"
              leftIcon={<Plus className="w-5 h-5" />}
              onClick={() => setShowNewProjectModal(true)}
            >
              Create Your First Project
            </UniversalButton>
          </UniversalCard>

          {showNewProjectModal && (
            <NewProjectModal
              onClose={() => setShowNewProjectModal(false)}
              onSuccess={() => {
                setShowNewProjectModal(false);
                refetch();
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <UniversalButton
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/dashboard/productions')}
              className="mb-3"
            >
              Back
            </UniversalButton>
            <h1 className="text-heading-1 text-gray-900 dark:text-white">Projects Board</h1>
            <p className="text-body-base text-gray-600 dark:text-gray-400 mt-1">
              Drag and drop projects between columns to update their status
            </p>
          </div>
          <UniversalButton
            variant="primary"
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowNewProjectModal(true)}
          >
            New Project
          </UniversalButton>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map(status => (
            <KanbanColumn
              key={status}
              status={status}
              config={STATUS_CONFIG[status]}
              projects={getProjectsByStatus(status)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              onProjectClick={(id) => router.push(`/dashboard/productions/projects/${id}`)}
              onDragStart={handleDragStart}
              formatDueDate={formatDueDate}
            />
          ))}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSuccess={() => {
            setShowNewProjectModal(false);
            refetch(); // React Query refetch
          }}
        />
      )}
    </div>
  );
}

interface KanbanColumnProps {
  status: ProjectStatus;
  config: { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'info'; icon: React.ReactNode };
  projects: Project[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onProjectClick: (id: string) => void;
  onDragStart: (id: string) => void;
  formatDueDate: (date?: string | null) => { text: string; isOverdue: boolean; daysUntil: number } | null;
}

function KanbanColumn({
  status,
  config,
  projects,
  onDragOver,
  onDrop,
  onProjectClick,
  onDragStart,
  formatDueDate,
}: KanbanColumnProps) {
  return (
    <div
      className="flex flex-col min-h-[600px] bg-white dark:bg-[#1A2F4B] rounded-xl border border-gray-200 dark:border-[#2979FF]/20 transition-all hover:border-[#2979FF]/40"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-[#2979FF]">{config.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{config.label}</h3>
          </div>
          <span className="text-sm font-medium px-2 py-1 bg-gray-100 dark:bg-[#0E1A2B] text-gray-700 dark:text-gray-300 rounded">
            {projects.length}
          </span>
        </div>
      </div>

      {/* Projects */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-12">
            <div className="text-4xl mb-2 opacity-50">{config.icon}</div>
            <p>No projects</p>
          </div>
        ) : (
          projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              statusColor={config.color}
              onClick={() => onProjectClick(project.id)}
              onDragStart={() => onDragStart(project.id)}
              formatDueDate={formatDueDate}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  statusColor: 'default' | 'primary' | 'success' | 'warning' | 'info';
  onClick: () => void;
  onDragStart: () => void;
  formatDueDate: (date?: string | null) => { text: string; isOverdue: boolean; daysUntil: number } | null;
}

function ProjectCard({ project, statusColor, onClick, onDragStart, formatDueDate }: ProjectCardProps) {
  const dueInfo = formatDueDate(project.dueDate);

  return (
    <UniversalCard
      variant="default"
      hoverable
      className="cursor-move active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Project Name */}
        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
          {project.name}
        </h4>

        {/* Objective */}
        {project.objective && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.objective}
          </p>
        )}

        {/* Channels */}
        {project.channels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.channels.slice(0, 2).map((channel, idx) => (
              <UniversalBadge
                key={idx}
                variant="primary"
                size="sm"
              >
                {channel.replace('_', ' ')}
              </UniversalBadge>
            ))}
            {project.channels.length > 2 && (
              <UniversalBadge variant="outline" size="sm">
                +{project.channels.length - 2}
              </UniversalBadge>
            )}
          </div>
        )}

        {/* Due Date */}
        {dueInfo && (
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${
              dueInfo.isOverdue
                ? 'text-red-500'
                : dueInfo.daysUntil <= 3
                ? 'text-yellow-500'
                : 'text-gray-400'
            }`} />
            <span className={`text-xs font-medium ${
              dueInfo.isOverdue
                ? 'text-red-500'
                : dueInfo.daysUntil <= 3
                ? 'text-yellow-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {dueInfo.text}
              {dueInfo.isOverdue && ' (Overdue)'}
            </span>
          </div>
        )}

        {/* Counts */}
        {project._count && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-[#2979FF]/20">
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>{project._count.tasks}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <Film className="w-3 h-3" />
              <span>{project._count.assets}</span>
            </div>
            {project._count.reviews > 0 && (
              <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="w-3 h-3" />
                <span>{project._count.reviews}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </UniversalCard>
  );
}

interface NewProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function NewProjectModal({ onClose, onSuccess }: NewProjectModalProps) {
  const createProject = useCreateProject();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'OTHER' as ProjectType,
    startDate: '',
    endDate: '',
  });

  const projectTypes: { value: ProjectType; label: string }[] = [
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'SHOW', label: 'Show' },
    { value: 'FILMING', label: 'Filming' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleSubmit = async () => {
    try {
      await createProject.mutateAsync({
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      });
      toast.success('Project created successfully!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="New Production Project"
      description="Create a new production project for conferences, shows, filming, or other events"
      submitText="Create Project"
      cancelText="Cancel"
      loading={createProject.isPending}
      size="lg"
    >
      <div className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
            placeholder="Tech Conference 2025"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF] resize-none"
            placeholder="Brief description of the production project"
          />
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {projectTypes.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  formData.type === value
                    ? 'bg-[#2979FF] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-[#0E1A2B] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#0E1A2B]/70 border border-gray-300 dark:border-[#2979FF]/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-3 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            />
          </div>
        </div>
      </div>
    </FormModal>
  );
}
