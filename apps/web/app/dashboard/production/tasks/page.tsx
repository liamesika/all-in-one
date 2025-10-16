'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  Brain,
  Sparkles,
  Zap
} from 'lucide-react';
import { ProductionsHeader } from '@/components/productions/ProductionsHeader';

type ViewMode = 'board' | 'list';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  project: string;
  dueDate: string;
  tags: string[];
  subtasks?: { id: string; title: string; completed: boolean }[];
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Finalize venue layout',
    description: 'Complete floor plan with seating arrangements and AV placement',
    status: 'done',
    priority: 'high',
    assignee: 'Sarah Chen',
    project: 'Tech Conference 2024',
    dueDate: '2024-11-15',
    tags: ['Venue', 'Planning'],
    subtasks: [
      { id: '1a', title: 'Measure venue dimensions', completed: true },
      { id: '1b', title: 'Design seating layout', completed: true },
      { id: '1c', title: 'Approve with client', completed: true }
    ]
  },
  {
    id: '2',
    title: 'Coordinate speaker schedules',
    description: 'Confirm availability and create detailed timeline for all keynote speakers',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Mike Ross',
    project: 'Tech Conference 2024',
    dueDate: '2024-11-20',
    tags: ['Speakers', 'Coordination'],
    subtasks: [
      { id: '2a', title: 'Email all speakers', completed: true },
      { id: '2b', title: 'Collect bio and headshots', completed: true },
      { id: '2c', title: 'Create presentation schedule', completed: false }
    ]
  },
  {
    id: '3',
    title: 'Design stage graphics',
    description: 'Create LED backdrop visuals and presentation templates',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Emma Wilson',
    project: 'Tech Conference 2024',
    dueDate: '2024-11-25',
    tags: ['Design', 'Graphics']
  },
  {
    id: '4',
    title: 'Edit promotional video',
    description: 'Final cut of 60-second social media promo',
    status: 'review',
    priority: 'medium',
    assignee: 'David Park',
    project: 'Brand Video Campaign Q1',
    dueDate: '2024-11-18',
    tags: ['Video', 'Marketing']
  },
  {
    id: '5',
    title: 'Test AV equipment',
    description: 'Full technical rehearsal with all audio/visual systems',
    status: 'todo',
    priority: 'high',
    assignee: 'David Park',
    project: 'Tech Conference 2024',
    dueDate: '2024-12-01',
    tags: ['Technical', 'Testing']
  },
  {
    id: '6',
    title: 'Prepare attendee materials',
    description: 'Print badges, programs, and swag bags',
    status: 'todo',
    priority: 'medium',
    assignee: 'Sarah Chen',
    project: 'Tech Conference 2024',
    dueDate: '2024-12-05',
    tags: ['Logistics', 'Materials']
  },
  {
    id: '7',
    title: 'Color grade documentary scenes',
    description: 'Apply cinematic color grading to all footage',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Alex Turner',
    project: 'Documentary Post-Production',
    dueDate: '2024-11-22',
    tags: ['Post-Production', 'Color']
  },
  {
    id: '8',
    title: 'Sound mixing final pass',
    description: 'Balance audio levels and add sound effects',
    status: 'todo',
    priority: 'critical',
    assignee: 'Maya Rodriguez',
    project: 'Documentary Post-Production',
    dueDate: '2024-11-28',
    tags: ['Audio', 'Post-Production']
  }
];

const statusColumns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'gray' },
  { id: 'in_progress', label: 'In Progress', color: 'blue' },
  { id: 'review', label: 'Review', color: 'yellow' },
  { id: 'done', label: 'Done', color: 'green' }
];

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      low: 'text-gray-500 bg-gray-100',
      medium: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    };
    return colors[priority];
  };

  const getStatusIcon = (status: TaskStatus) => {
    const icons = {
      todo: Circle,
      in_progress: Clock,
      review: AlertCircle,
      done: CheckCircle2
    };
    return icons[status];
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      todo: 'text-gray-500',
      in_progress: 'text-blue-500',
      review: 'text-yellow-500',
      done: 'text-green-500'
    };
    return colors[status];
  };

  const aiSuggestions = [
    {
      id: '1',
      title: 'Schedule buffer time for AV testing',
      reason: 'Tech Conference deadline is approaching - recommend adding 2-day buffer',
      priority: 'high' as TaskPriority,
      project: 'Tech Conference 2024',
      assignee: 'David Park'
    },
    {
      id: '2',
      title: 'Request client approval on stage design',
      reason: 'Design tasks are 80% complete - early approval prevents last-minute changes',
      priority: 'medium' as TaskPriority,
      project: 'Tech Conference 2024',
      assignee: 'Emma Wilson'
    },
    {
      id: '3',
      title: 'Book backup audio engineer',
      reason: 'Critical sound mixing task has single assignee - recommend backup resource',
      priority: 'high' as TaskPriority,
      project: 'Documentary Post-Production',
      assignee: 'Maya Rodriguez'
    }
  ];

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
              <h1 className="text-3xl font-semibold text-gray-900">Tasks</h1>
              <p className="text-gray-600 mt-1">
                Manage and track all production tasks across projects
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md">
              <Plus size={20} />
              New Task
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {statusColumns.map((status, index) => (
              <motion.div
                key={status.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{status.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {getTasksByStatus(status.id).length}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-${status.color}-50 flex items-center justify-center`}>
                    {(() => {
                      const Icon = getStatusIcon(status.id);
                      return <Icon className={`text-${status.color}-600`} size={24} />;
                    })()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Suggestions */}
          <AnimatePresence>
            {showAISuggestions && aiSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 mb-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                      <Brain className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">AI Task Suggestions</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-200/50 rounded-full text-xs font-medium text-orange-700">
                          <Sparkles size={12} />
                          {aiSuggestions.length} New
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Based on project analysis and upcoming deadlines
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAISuggestions(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  {aiSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-white rounded-lg p-4 border border-orange-200/50 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Tag size={12} />
                              {suggestion.project}
                            </span>
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {suggestion.assignee}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                            Add Task
                          </button>
                          <button className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters & View Modes */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-1 items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks or projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded ${viewMode === 'board' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Board View"
              >
                <LayoutGrid size={18} className={viewMode === 'board' ? 'text-orange-600' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="List View"
              >
                <List size={18} className={viewMode === 'list' ? 'text-orange-600' : 'text-gray-600'} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Board View */}
        {viewMode === 'board' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statusColumns.map((column) => {
              const tasks = getTasksByStatus(column.id);
              return (
                <div key={column.id} className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{column.label}</h3>
                      <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600 font-medium">
                        {tasks.length}
                      </span>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200">
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors flex-1">
                            {task.title}
                          </h4>
                          <button className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                            <CheckCircle2 size={14} />
                            <span>
                              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock size={14} />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-medium">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {tasks.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-8">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((task) => {
                    const StatusIcon = getStatusIcon(task.status);
                    return (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          {task.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{task.project}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={getStatusColor(task.status)} size={16} />
                            <span className="text-sm text-gray-600 capitalize">
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-medium">
                              {task.assignee.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm text-gray-900">{task.assignee}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
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

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center"
          >
            <CheckCircle2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first task'}
            </p>
            {!searchQuery && (
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all">
                Create New Task
              </button>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
