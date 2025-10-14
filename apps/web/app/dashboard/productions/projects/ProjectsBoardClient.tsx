'use client';

/**
 * Creative Productions - Projects Board Client
 * Kanban view with drag-and-drop, filters, and new project modal
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'DELIVERED';

interface Project {
  id: string;
  name: string;
  objective?: string | null;
  targetAudience?: string | null;
  channels: string[];
  status: ProjectStatus;
  dueDate?: string | null;
  ownerUid: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
    assets: number;
    reviews: number;
    renders: number;
  };
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: string }> = {
  DRAFT: { label: 'Draft', color: 'gray', icon: '📝' },
  IN_PROGRESS: { label: 'In Progress', color: 'blue', icon: '⚙️' },
  REVIEW: { label: 'Review', color: 'yellow', icon: '👁️' },
  APPROVED: { label: 'Approved', color: 'green', icon: '✅' },
  DELIVERED: { label: 'Delivered', color: 'purple', icon: '🎉' },
};

export default function ProjectsBoardClient() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [draggedProject, setDraggedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/productions/projects?limit=100');
      if (!res.ok) throw new Error('Failed to fetch projects');

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      const res = await fetch(`/api/productions/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update project');

      // Optimistic update
      setProjects(prev =>
        prev.map(p => (p.id === projectId ? { ...p, status: newStatus } : p))
      );
    } catch (err: any) {
      console.error('Error updating project:', err);
      alert('Failed to update project status');
      fetchProjects(); // Reload on error
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-[#1A2F4B] rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-96 bg-[#1A2F4B] rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1A2B] p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <button
              onClick={() => router.push('/dashboard/productions')}
              className="text-gray-400 hover:text-white mb-2 transition-colors inline-flex items-center gap-2 text-sm"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-white">Projects Board</h1>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-6 py-3 bg-[#2979FF] hover:bg-[#1E5FCC] text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(41,121,255,0.4)] focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
          >
            + New Project
          </button>
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
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

interface KanbanColumnProps {
  status: ProjectStatus;
  config: { label: string; color: string; icon: string };
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
  const colorClasses = {
    gray: 'border-gray-500/30',
    blue: 'border-blue-500/30',
    yellow: 'border-yellow-500/30',
    green: 'border-green-500/30',
    purple: 'border-purple-500/30',
  };

  return (
    <div
      className={`flex flex-col min-h-[500px] bg-[#1A2F4B] rounded-xl border-2 ${colorClasses[config.color as keyof typeof colorClasses]} transition-colors`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className="font-semibold text-white">{config.label}</h3>
          </div>
          <span className="text-sm font-medium text-gray-400 bg-[#0E1A2B] px-2 py-1 rounded">
            {projects.length}
          </span>
        </div>
      </div>

      {/* Projects */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No projects
          </div>
        ) : (
          projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
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
  onClick: () => void;
  onDragStart: () => void;
  formatDueDate: (date?: string | null) => { text: string; isOverdue: boolean; daysUntil: number } | null;
}

function ProjectCard({ project, onClick, onDragStart, formatDueDate }: ProjectCardProps) {
  const dueInfo = formatDueDate(project.dueDate);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-[#0E1A2B] rounded-lg p-4 cursor-pointer hover:bg-[#0E1A2B]/80 transition-all duration-200 border border-white/5 hover:border-[#2979FF]/50 group focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <h4 className="font-medium text-white mb-2 line-clamp-2 group-hover:text-[#2979FF] transition-colors">
        {project.name}
      </h4>

      {project.objective && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.objective}</p>
      )}

      {/* Channels */}
      {project.channels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.channels.slice(0, 2).map((channel, idx) => (
            <span
              key={idx}
              className="text-xs bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded"
            >
              {channel}
            </span>
          ))}
          {project.channels.length > 2 && (
            <span className="text-xs text-gray-400 px-2 py-1">
              +{project.channels.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Due Date */}
      {dueInfo && (
        <div
          className={`text-xs font-medium mb-3 ${
            dueInfo.isOverdue
              ? 'text-red-400'
              : dueInfo.daysUntil <= 3
              ? 'text-yellow-400'
              : 'text-gray-400'
          }`}
        >
          📅 {dueInfo.text}
          {dueInfo.isOverdue && ' (Overdue)'}
        </div>
      )}

      {/* Counts */}
      {project._count && (
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>✓ {project._count.tasks} tasks</span>
          <span>🎬 {project._count.assets}</span>
          {project._count.reviews > 0 && (
            <span className="text-yellow-400">👁️ {project._count.reviews}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface NewProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function NewProjectModal({ onClose, onSuccess }: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    targetAudience: '',
    channels: [] as string[],
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelOptions = [
    'META_FEED',
    'META_STORY',
    'INSTAGRAM_FEED',
    'INSTAGRAM_STORY',
    'INSTAGRAM_REEL',
    'YOUTUBE',
    'TIKTOK',
    'LINKEDIN',
    'TWITTER',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/productions/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1A2F4B] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">New Creative Project</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-[#0E1A2B] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
              placeholder="Summer Campaign 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Objective
            </label>
            <textarea
              value={formData.objective}
              onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-[#0E1A2B] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2979FF] resize-none"
              placeholder="What's the goal of this project?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Audience
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              className="w-full px-4 py-3 bg-[#0E1A2B] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              placeholder="e.g., Women 25-45, Tech enthusiasts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Channels
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {channelOptions.map(channel => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.channels.includes(channel)
                      ? 'bg-[#2979FF] text-white'
                      : 'bg-[#0E1A2B] text-gray-400 hover:bg-[#0E1A2B]/70'
                  }`}
                >
                  {channel.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-4 py-3 bg-[#0E1A2B] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#0E1A2B] hover:bg-[#0E1A2B]/70 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#2979FF] hover:bg-[#1E5FCC] text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(41,121,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
