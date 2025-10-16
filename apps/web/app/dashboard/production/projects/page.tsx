'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Calendar,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Archive,
  FolderKanban,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { ProductionsHeader } from '@/components/productions/ProductionsHeader';

type ViewMode = 'grid' | 'table' | 'timeline';
type ProjectStatus = 'ACTIVE' | 'PLANNING' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
type ProjectType = 'CONFERENCE' | 'SHOW' | 'FILMING' | 'POST_PRODUCTION' | 'PHOTOGRAPHY' | 'OTHER';

interface Project {
  id: string;
  name: string;
  client: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  budget: number;
  usedBudget: number;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  team: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  tags?: string[];
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Tech Conference 2024',
    client: 'TechCorp Inc.',
    type: 'CONFERENCE',
    status: 'ACTIVE',
    startDate: '2024-10-01',
    deadline: '2024-12-15',
    budget: 50000,
    usedBudget: 38000,
    progress: 76,
    totalTasks: 24,
    completedTasks: 18,
    team: ['Sarah Chen', 'Mike Ross', 'Emma Wilson'],
    priority: 'high',
    tags: ['Live Event', 'Corporate', 'Multi-day']
  },
  {
    id: '2',
    name: 'Brand Video Campaign Q1',
    client: 'StartupXYZ',
    type: 'FILMING',
    status: 'ACTIVE',
    startDate: '2024-11-01',
    deadline: '2025-01-30',
    budget: 35000,
    usedBudget: 12000,
    progress: 34,
    totalTasks: 18,
    completedTasks: 6,
    team: ['David Park', 'Lisa Chang'],
    priority: 'medium',
    tags: ['Video Production', 'Social Media']
  },
  {
    id: '3',
    name: 'Product Launch Event',
    client: 'Innovation Labs',
    type: 'SHOW',
    status: 'PLANNING',
    startDate: '2025-01-10',
    deadline: '2025-03-20',
    budget: 75000,
    usedBudget: 5000,
    progress: 12,
    totalTasks: 32,
    completedTasks: 4,
    team: ['Rachel Green', 'Tom Hardy', 'Nina Patel'],
    priority: 'critical',
    tags: ['Product Launch', 'B2B', 'Hybrid Event']
  },
  {
    id: '4',
    name: 'Documentary Post-Production',
    client: 'Nature Films Ltd',
    type: 'POST_PRODUCTION',
    status: 'ACTIVE',
    startDate: '2024-09-15',
    deadline: '2024-11-30',
    budget: 28000,
    usedBudget: 24000,
    progress: 86,
    totalTasks: 14,
    completedTasks: 12,
    team: ['Alex Turner', 'Maya Rodriguez'],
    priority: 'high',
    tags: ['Documentary', 'Color Grading', 'Sound Design']
  },
  {
    id: '5',
    name: 'Wedding Photography Package',
    client: 'Private Client',
    type: 'PHOTOGRAPHY',
    status: 'COMPLETED',
    startDate: '2024-09-01',
    deadline: '2024-10-15',
    budget: 5000,
    usedBudget: 4800,
    progress: 100,
    totalTasks: 8,
    completedTasks: 8,
    team: ['Jennifer Lee'],
    priority: 'low',
    tags: ['Wedding', 'Photography', 'Editing']
  },
  {
    id: '6',
    name: 'Corporate Training Videos',
    client: 'MegaCorp International',
    type: 'FILMING',
    status: 'ON_HOLD',
    startDate: '2024-08-20',
    deadline: '2024-12-01',
    budget: 42000,
    usedBudget: 18000,
    progress: 43,
    totalTasks: 20,
    completedTasks: 8,
    team: ['Chris Evans', 'Sandra Bullock'],
    priority: 'medium',
    tags: ['Corporate', 'Training', 'Series']
  }
];

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const statusOptions: { value: ProjectStatus | 'ALL'; label: string; color: string }[] = [
    { value: 'ALL', label: 'All Projects', color: 'gray' },
    { value: 'ACTIVE', label: 'Active', color: 'green' },
    { value: 'PLANNING', label: 'Planning', color: 'blue' },
    { value: 'ON_HOLD', label: 'On Hold', color: 'yellow' },
    { value: 'COMPLETED', label: 'Completed', color: 'purple' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'red' }
  ];

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ProjectStatus) => {
    const colors = {
      ACTIVE: 'bg-green-50 text-green-700 border-green-200',
      PLANNING: 'bg-blue-50 text-blue-700 border-blue-200',
      ON_HOLD: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      COMPLETED: 'bg-purple-50 text-purple-700 border-purple-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      critical: 'text-red-500'
    };
    return colors[priority as keyof typeof colors];
  };

  const getBudgetStatus = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return { color: 'bg-red-500', label: 'Critical' };
    if (percentage >= 70) return { color: 'bg-yellow-500', label: 'Warning' };
    return { color: 'bg-green-500', label: 'Healthy' };
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F9FAFB]">
      <ProductionsHeader userName="Production Manager" />

      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-1">
                Manage and track all production projects in one place
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              New Project
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Projects', value: mockProjects.length, icon: FolderKanban, color: 'orange' },
              { label: 'Active', value: mockProjects.filter(p => p.status === 'ACTIVE').length, icon: CheckCircle2, color: 'green' },
              { label: 'On Schedule', value: '75%', icon: Clock, color: 'blue' },
              { label: 'Total Budget', value: '$' + (mockProjects.reduce((sum, p) => sum + p.budget, 0) / 1000).toFixed(0) + 'K', icon: DollarSign, color: 'purple' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                    <stat.icon className={`text-${stat.color}-600`} size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters & View Modes */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-1 items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects or clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'ALL')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* View Mode & Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title="Grid View"
                >
                  <Grid3x3 size={18} className={viewMode === 'grid' ? 'text-orange-600' : 'text-gray-600'} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title="Table View"
                >
                  <List size={18} className={viewMode === 'table' ? 'text-orange-600' : 'text-gray-600'} />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title="Timeline View"
                >
                  <Calendar size={18} className={viewMode === 'timeline' ? 'text-orange-600' : 'text-gray-600'} />
                </button>
              </div>

              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Download size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Upload size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid View */}
        {viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => {
              const budgetStatus = getBudgetStatus(project.usedBudget, project.budget);
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link href={`/dashboard/production/projects/${project.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                          {project.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600">{project.client}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Status & Priority */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 size={16} />
                      <span>Tasks</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {project.completedTasks}/{project.totalTasks}
                    </span>
                  </div>

                  {/* Budget */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium text-gray-900">
                        ${project.usedBudget.toLocaleString()} / ${project.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${budgetStatus.color} h-2 rounded-full transition-all`}
                        style={{ width: `${Math.min((project.usedBudget / project.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                    <Clock size={16} />
                    <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>

                  {/* Team */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                          title={member}
                        >
                          {member.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/production/projects/${project.id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
                        <Eye size={16} />
                        View
                      </button>
                    </Link>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      <Edit2 size={16} />
                      Edit
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Deadline</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.map((project) => {
                    const budgetStatus = getBudgetStatus(project.usedBudget, project.budget);
                    return (
                      <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/production/projects/${project.id}`}>
                            <div className="text-sm font-medium text-gray-900 hover:text-orange-600">
                              {project.name}
                            </div>
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">{project.type.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{project.client}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            ${project.usedBudget.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            of ${project.budget.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(project.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {project.team.slice(0, 3).map((member, i) => (
                              <div
                                key={i}
                                className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                                title={member}
                              >
                                {member.split(' ').map(n => n[0]).join('')}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/production/projects/${project.id}`}>
                              <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                <Eye size={18} />
                              </button>
                            </Link>
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 size={18} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Timeline View Placeholder */}
        {viewMode === 'timeline' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center"
          >
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline View</h3>
            <p className="text-gray-600 mb-4">
              Visualize project timelines, milestones, and dependencies
            </p>
            <button className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
              Coming Soon
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center"
          >
            <FolderKanban size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first project'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Create New Project
              </button>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
