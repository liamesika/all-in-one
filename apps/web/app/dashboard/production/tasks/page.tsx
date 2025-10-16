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
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/useProductionsData';
import { ProductionTaskStatus } from '@prisma/client';
import toast from 'react-hot-toast';

type ViewMode = 'board' | 'list';

// Map ProductionTaskStatus to display columns
const statusColumns: { id: ProductionTaskStatus; label: string; color: string }[] = [
  { id: 'OPEN', label: 'To Do', color: 'gray' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { id: 'DONE', label: 'Done', color: 'green' },
  { id: 'BLOCKED', label: 'Blocked', color: 'red' }
];

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductionTaskStatus | 'all'>('all');

  // Fetch tasks with React Query
  const { data: allTasks = [], isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Filter tasks
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTasksByStatus = (status: ProductionTaskStatus) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getStatusIcon = (status: ProductionTaskStatus) => {
    const icons = {
      OPEN: Circle,
      IN_PROGRESS: Clock,
      DONE: CheckCircle2,
      BLOCKED: AlertCircle
    };
    return icons[status];
  };

  const getStatusColor = (status: ProductionTaskStatus) => {
    const colors = {
      OPEN: 'text-gray-500',
      IN_PROGRESS: 'text-blue-500',
      DONE: 'text-green-500',
      BLOCKED: 'text-red-500'
    };
    return colors[status];
  };

  const handleStatusChange = async (taskId: string, newStatus: ProductionTaskStatus) => {
    try {
      await updateTask.mutateAsync({ id: taskId, data: { status: newStatus } });
      toast.success('Task status updated');
    } catch (err: any) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted');
    } catch (err: any) {
      toast.error('Failed to delete task');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#F9FAFB]">
        <ProductionsHeader userName="Production Manager" />
        <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProductionTaskStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
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
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors flex-1">
                            {task.title}
                          </h4>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                            {task.domain}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            {task.dueDate ? (
                              <>
                                <Clock size={14} />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">No due date</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {task.assigneeId && (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-medium">
                                A
                              </div>
                            )}
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
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
                        <td className="px-6 py-4 text-sm text-gray-600">{task.domain}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={getStatusColor(task.status)} size={16} />
                            <span className="text-sm text-gray-600 capitalize">
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as ProductionTaskStatus)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="DONE">Done</option>
                              <option value="BLOCKED">Blocked</option>
                            </select>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
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
