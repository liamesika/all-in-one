'use client';

/**
 * Creative Productions - Project Workspace Client
 * Tabbed interface: Brief, Tasks, Assets, Reviews, Renders
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
  const [isEditing, setIsEditing] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-10 bg-[#1A2F4B] rounded w-48 mb-8"></div>
          <div className="h-96 bg-[#1A2F4B] rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error || 'Project not found'}</p>
          <button
            onClick={() => router.push('/dashboard/productions/projects')}
            className="px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white rounded-lg transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; count?: number; icon: string }[] = [
    { id: 'brief', label: 'Brief', icon: '📋' },
    { id: 'tasks', label: 'Tasks', count: project.tasks.length, icon: '✓' },
    { id: 'assets', label: 'Assets', count: project.assets.length, icon: '🎬' },
    { id: 'reviews', label: 'Reviews', count: project.reviews.length, icon: '👁️' },
    { id: 'renders', label: 'Renders', count: project.renders.length, icon: '🎨' },
  ];

  return (
    <div className="min-h-screen bg-[#0E1A2B]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#1A2F4B] border-b border-white/10 px-4 md:px-8 py-6">
          <button
            onClick={() => router.push('/dashboard/productions/projects')}
            className="text-gray-400 hover:text-white mb-4 transition-colors inline-flex items-center gap-2 text-sm"
          >
            ← Back to Projects
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 truncate">
                {project.name}
              </h1>
              {project.objective && (
                <p className="text-gray-400 text-sm md:text-base">{project.objective}</p>
              )}
            </div>

            {/* Right Rail - Status & Actions */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E1A2B] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              {project.dueDate && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Due Date</label>
                  <div className="text-sm text-white">
                    {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}

              {project.channels.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Channels</label>
                  <div className="flex flex-wrap gap-1">
                    {project.channels.map((channel, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1A2F4B] border-b border-white/10 px-4 md:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#2979FF] border-[#2979FF]'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-[#0E1A2B] px-2 py-0.5 rounded text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-8">
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
    <div className="max-w-4xl">
      <div className="bg-[#1A2F4B] rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Project Name</h3>
          <p className="text-lg text-white">{project.name}</p>
        </div>

        {project.objective && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Objective</h3>
            <p className="text-white whitespace-pre-wrap">{project.objective}</p>
          </div>
        )}

        {project.targetAudience && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Target Audience</h3>
            <p className="text-white">{project.targetAudience}</p>
          </div>
        )}

        {project.channels.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Target Channels</h3>
            <div className="flex flex-wrap gap-2">
              {project.channels.map((channel, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-[#2979FF]/20 text-[#2979FF] rounded-lg text-sm font-medium"
                >
                  {channel.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 text-sm text-gray-400">
          <p>Created {new Date(project.createdAt).toLocaleDateString()}</p>
          <p>Last updated {new Date(project.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
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
        <h2 className="text-xl font-semibold text-white">Tasks</h2>
        <button
          onClick={() => setShowNewTask(true)}
          className="px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
        >
          + Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-[#1A2F4B] rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No tasks yet</p>
          <button
            onClick={() => setShowNewTask(true)}
            className="text-[#2979FF] hover:text-[#1E5FCC] font-medium"
          >
            Create your first task →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['TODO', 'DOING', 'REVIEW', 'DONE'] as const).map(status => (
            <div key={status} className="bg-[#1A2F4B] rounded-xl p-4">
              <h3 className="font-medium text-white mb-3 flex items-center justify-between">
                <span>{status.replace('_', ' ')}</span>
                <span className="text-sm text-gray-400">{tasksByStatus[status].length}</span>
              </h3>
              <div className="space-y-2">
                {tasksByStatus[status].map(task => (
                  <div
                    key={task.id}
                    className="bg-[#0E1A2B] rounded-lg p-3 text-sm"
                  >
                    <p className="text-white font-medium mb-1">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.type}</p>
                    {task.dueAt && (
                      <p className="text-xs text-yellow-400 mt-1">
                        Due {new Date(task.dueAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Assets</h2>
        <button className="px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white text-sm font-medium rounded-lg transition-colors">
          + Upload Asset
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="bg-[#1A2F4B] rounded-xl p-12 text-center">
          <p className="text-gray-400">No assets uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="bg-[#1A2F4B] rounded-xl p-4 hover:bg-[#234060] transition-colors">
              <div className="aspect-square bg-[#0E1A2B] rounded-lg mb-3 flex items-center justify-center text-4xl">
                {asset.type === 'VIDEO' ? '🎬' : asset.type === 'IMAGE' ? '🖼️' : '📄'}
              </div>
              <p className="text-white font-medium text-sm truncate">{asset.title}</p>
              <p className="text-xs text-gray-400 mt-1">{asset.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Reviews Tab Component
function ReviewsTab({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Reviews</h2>

      {reviews.length === 0 ? (
        <div className="bg-[#1A2F4B] rounded-xl p-12 text-center">
          <p className="text-gray-400">No reviews requested yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="bg-[#1A2F4B] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  review.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                  review.status === 'CHANGES_REQUESTED' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {review.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(review.requestedAt).toLocaleDateString()}
                </span>
              </div>
              {review.comments && (
                <p className="text-gray-300 text-sm">{review.comments}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Renders Tab Component
function RendersTab({ renders }: { renders: Render[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Renders</h2>
        <button className="px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white text-sm font-medium rounded-lg transition-colors">
          + New Render
        </button>
      </div>

      {renders.length === 0 ? (
        <div className="bg-[#1A2F4B] rounded-xl p-12 text-center">
          <p className="text-gray-400">No renders created yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {renders.map(render => (
            <div key={render.id} className="bg-[#1A2F4B] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{render.format}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(render.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                render.status === 'READY' ? 'bg-green-500/20 text-green-400' :
                render.status === 'RENDERING' ? 'bg-blue-500/20 text-blue-400' :
                render.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {render.status}
              </span>
            </div>
          ))}
        </div>
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
    type: 'SCRIPT' as const,
    priority: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A2F4B] rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">New Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 bg-[#0E1A2B] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-4 py-2 bg-[#0E1A2B] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
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

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-[#0E1A2B] text-white rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white rounded-lg disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
