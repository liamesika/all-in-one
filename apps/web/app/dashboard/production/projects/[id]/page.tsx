'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Archive,
  Trash2,
  Share2,
  Download,
  Upload,
  FileText,
  Image,
  Video,
  Folder,
  TrendingUp,
  AlertTriangle,
  Brain,
  Sparkles,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { ProductionsHeader } from '@/components/productions/ProductionsHeader';

type TabType = 'overview' | 'tasks' | 'files' | 'reports' | 'team';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface File {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'folder';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Mock project data - in real app, fetch from API using params.id
  const project = {
    id: params.id as string,
    name: 'Tech Conference 2024',
    client: 'TechCorp Inc.',
    status: 'ACTIVE',
    type: 'CONFERENCE',
    startDate: '2024-10-01',
    deadline: '2024-12-15',
    budget: 50000,
    usedBudget: 38000,
    progress: 76,
    description: 'Annual technology conference featuring keynote speakers, workshops, and networking events. 3-day event expected to host 2,000+ attendees.',
    priority: 'high',
    tags: ['Live Event', 'Corporate', 'Multi-day'],
    team: [
      { id: '1', name: 'Sarah Chen', role: 'Project Manager', avatar: 'SC' },
      { id: '2', name: 'Mike Ross', role: 'Technical Director', avatar: 'MR' },
      { id: '3', name: 'Emma Wilson', role: 'Creative Lead', avatar: 'EW' },
      { id: '4', name: 'David Park', role: 'Production Assistant', avatar: 'DP' }
    ],
    tasks: [
      { id: '1', title: 'Finalize venue layout', status: 'done' as const, assignee: 'Sarah Chen', dueDate: '2024-11-15', priority: 'high' as const },
      { id: '2', title: 'Coordinate speaker schedules', status: 'in_progress' as const, assignee: 'Mike Ross', dueDate: '2024-11-20', priority: 'high' as const },
      { id: '3', title: 'Design stage graphics', status: 'in_progress' as const, assignee: 'Emma Wilson', dueDate: '2024-11-25', priority: 'medium' as const },
      { id: '4', title: 'Test AV equipment', status: 'todo' as const, assignee: 'David Park', dueDate: '2024-12-01', priority: 'high' as const },
      { id: '5', title: 'Prepare attendee materials', status: 'todo' as const, assignee: 'Sarah Chen', dueDate: '2024-12-05', priority: 'medium' as const }
    ],
    files: [
      { id: '1', name: 'Event Brief.pdf', type: 'document' as const, size: '2.4 MB', uploadedBy: 'Sarah Chen', uploadedAt: '2024-10-05' },
      { id: '2', name: 'Venue Photos', type: 'folder' as const, size: '48 items', uploadedBy: 'Mike Ross', uploadedAt: '2024-10-12' },
      { id: '3', name: 'Stage Design.psd', type: 'image' as const, size: '15.2 MB', uploadedBy: 'Emma Wilson', uploadedAt: '2024-11-01' },
      { id: '4', name: 'Promo Video v2.mp4', type: 'video' as const, size: '124 MB', uploadedBy: 'David Park', uploadedAt: '2024-11-08' }
    ],
    recentActivity: [
      { id: '1', user: 'Sarah Chen', action: 'completed task', target: 'Finalize venue layout', timestamp: '2 hours ago' },
      { id: '2', user: 'Emma Wilson', action: 'uploaded file', target: 'Stage Design.psd', timestamp: '5 hours ago' },
      { id: '3', user: 'Mike Ross', action: 'commented on', target: 'Speaker schedules', timestamp: '1 day ago' },
      { id: '4', user: 'David Park', action: 'uploaded file', target: 'Promo Video v2.mp4', timestamp: '2 days ago' }
    ]
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'files', label: 'Files', icon: Folder },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'team', label: 'Team', icon: Users }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-50 text-green-700 border-green-200',
      PLANNING: 'bg-blue-50 text-blue-700 border-blue-200',
      ON_HOLD: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      COMPLETED: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getTaskStatusColor = (status: string) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      done: 'bg-green-100 text-green-700'
    };
    return colors[status as keyof typeof colors];
  };

  const getFileIcon = (type: string) => {
    const icons = {
      document: FileText,
      image: Image,
      video: Video,
      folder: Folder
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const budgetPercentage = (project.usedBudget / project.budget) * 100;
  const budgetStatus = budgetPercentage >= 90 ? 'critical' : budgetPercentage >= 70 ? 'warning' : 'healthy';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F9FAFB]">
      <ProductionsHeader userName="Production Manager" />

      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link href="/dashboard/production/projects">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Projects</span>
            </button>
          </Link>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold text-gray-900">{project.name}</h1>
                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{project.client}</p>
              <p className="text-gray-700 max-w-3xl">{project.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit2 size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <Calendar className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-semibold text-gray-900">{new Date(project.deadline).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="font-semibold text-gray-900">{project.progress}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${budgetStatus === 'critical' ? 'bg-red-50' : budgetStatus === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'} flex items-center justify-center`}>
                <DollarSign className={budgetStatus === 'critical' ? 'text-red-600' : budgetStatus === 'warning' ? 'text-yellow-600' : 'text-blue-600'} size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="font-semibold text-gray-900">${project.usedBudget.toLocaleString()} / ${project.budget.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Team Size</p>
                <p className="font-semibold text-gray-900">{project.team.length} members</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6"
        >
          <div className="flex items-center gap-1 p-2 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* AI Project Health */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                      <Brain className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">AI Project Health</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-200/50 rounded-full text-xs font-medium text-orange-700">
                          <Sparkles size={12} />
                          Live Analysis
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Project is <strong>on track</strong> with {project.progress}% completion. Budget utilization is healthy at {budgetPercentage.toFixed(0)}%.
                        No major blockers detected.
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">Recommendations:</div>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                            <span>Schedule final AV equipment test before Dec 1st deadline</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                            <span>Consider adding buffer time for attendee material preparation</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Tasks Completed', value: project.tasks.filter(t => t.status === 'done').length, total: project.tasks.length, color: 'green' },
                      { label: 'In Progress', value: project.tasks.filter(t => t.status === 'in_progress').length, total: project.tasks.length, color: 'blue' },
                      { label: 'To Do', value: project.tasks.filter(t => t.status === 'todo').length, total: project.tasks.length, color: 'gray' }
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-semibold text-gray-900">{stat.value} <span className="text-lg text-gray-500">/ {stat.total}</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {project.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-medium">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    <Plus size={18} />
                    Add Task
                  </button>
                </div>

                {project.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      readOnly
                    />
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {task.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTaskStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Project Files</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    <Upload size={18} />
                    Upload File
                  </button>
                </div>

                {project.files.map((file) => {
                  const Icon = getFileIcon(file.type);
                  return (
                    <div key={file.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Icon size={24} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{file.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {file.size} • Uploaded by {file.uploadedBy} on {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                        <Download size={18} />
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Reports</h3>
                <p className="text-gray-600 mb-4">
                  Generate detailed analytics and export project data
                </p>
                <button className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                  Coming Soon
                </button>
              </motion.div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    <Plus size={18} />
                    Add Member
                  </button>
                </div>

                {project.team.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-medium">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
