'use client';

/**
 * Law Tasks Page
 * Task management with table and Kanban board views
 */

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { PriorityBadge } from '@/components/law/PriorityBadge';
import { Plus, List, LayoutGrid } from 'lucide-react';

const mockTasks = [
  {
    id: '1',
    title: 'Review contract documents',
    case: 'LAW-2025-001',
    assignee: 'John Smith',
    priority: 'high' as const,
    dueDate: '2025-11-10',
    status: 'todo',
    boardColumn: 'todo',
  },
  {
    id: '2',
    title: 'Prepare court brief',
    case: 'LAW-2025-002',
    assignee: 'Sarah Johnson',
    priority: 'urgent' as const,
    dueDate: '2025-11-08',
    status: 'in_progress',
    boardColumn: 'in_progress',
  },
  {
    id: '3',
    title: 'Client meeting notes',
    case: 'LAW-2025-003',
    assignee: 'Michael Brown',
    priority: 'medium' as const,
    dueDate: '2025-11-12',
    status: 'review',
    boardColumn: 'review',
  },
  {
    id: '4',
    title: 'File motion with court',
    case: 'LAW-2025-001',
    assignee: 'John Smith',
    priority: 'high' as const,
    dueDate: '2025-11-05',
    status: 'completed',
    boardColumn: 'done',
  },
];

export default function LawTasksPage() {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');

  const columns = [
    { id: 'todo', title: language === 'he' ? 'לביצוע' : 'To Do', color: 'bg-gray-500' },
    { id: 'in_progress', title: language === 'he' ? 'בעבודה' : 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: language === 'he' ? 'בבדיקה' : 'Review', color: 'bg-yellow-500' },
    { id: 'done', title: language === 'he' ? 'הושלם' : 'Completed', color: 'bg-green-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'he' ? 'משימות' : 'Tasks'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'he' ? 'נהל את המשימות שלך' : 'Manage your tasks'}
          </p>
        </div>
        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#2979FF] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              {language === 'he' ? 'טבלה' : 'Table'}
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[#2979FF] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              {language === 'he' ? 'Kanban' : 'Kanban'}
            </button>
          </div>

          <UniversalButton variant="primary" icon={<Plus className="w-4 h-4" />}>
            {language === 'he' ? 'משימה חדשה' : 'New Task'}
          </UniversalButton>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const columnTasks = mockTasks.filter((task) => task.boardColumn === column.id);

            return (
              <div key={column.id} className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <UniversalCard key={task.id} hoverable>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {task.title}
                          </h4>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                          <p>
                            {language === 'he' ? 'תיק' : 'Case'}: {task.case}
                          </p>
                          <p>
                            {language === 'he' ? 'אחראי' : 'Assignee'}: {task.assignee}
                          </p>
                          <p>
                            {language === 'he' ? 'תאריך יעד' : 'Due'}: {task.dueDate}
                          </p>
                        </div>
                      </div>
                    </UniversalCard>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                      {language === 'he' ? 'אין משימות' : 'No tasks'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <UniversalCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {language === 'he' ? 'משימה' : 'Task'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {language === 'he' ? 'תיק' : 'Case'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {language === 'he' ? 'אחראי' : 'Assignee'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {language === 'he' ? 'עדיפות' : 'Priority'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {language === 'he' ? 'תאריך יעד' : 'Due Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {language === 'he' ? 'סטטוס' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#1A2F4B] divide-y divide-gray-200 dark:divide-gray-700">
                {mockTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {task.case}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {task.assignee}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {task.dueDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {task.status.replace('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UniversalCard>
      )}
    </div>
  );
}
