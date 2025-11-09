'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Clock, AlertCircle, Paperclip, User } from 'lucide-react';

interface KanbanBoardProps {
  tasks: any[];
  agents: any[];
  filters: any;
  onTaskClick: (task: any) => void;
  onTaskUpdate: (task: any) => void;
}

const STATUSES = [
  { id: 'BACKLOG', label: { en: 'Backlog', he: 'רשימת המתנה' }, color: 'gray' },
  { id: 'TODO', label: { en: 'To Do', he: 'לביצוע' }, color: 'blue' },
  { id: 'IN_PROGRESS', label: { en: 'In Progress', he: 'בביצוע' }, color: 'yellow' },
  { id: 'REVIEW', label: { en: 'Review', he: 'בבדיקה' }, color: 'purple' },
  { id: 'DONE', label: { en: 'Done', he: 'הושלם' }, color: 'green' },
  { id: 'BLOCKED', label: { en: 'Blocked', he: 'חסום' }, color: 'red' },
];

export default function KanbanBoard({
  tasks,
  agents,
  filters,
  onTaskClick,
  onTaskUpdate,
}: KanbanBoardProps) {
  const { language } = useLanguage();
  const [draggedTask, setDraggedTask] = useState<any>(null);

  const filteredTasks = tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.agentId) {
      const hasAgent = task.assignees?.some((a: any) => a.agentId === filters.agentId);
      if (!hasAgent) return false;
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === newStatus) return;

    try {
      const response = await fetch('/api/real-estate/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draggedTask.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        const { task } = await response.json();
        onTaskUpdate(task);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }

    setDraggedTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'HIGH':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'MEDIUM':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const isUrgent = (task: any) => {
    if (!task.dueDate || task.status === 'DONE') return false;
    const daysUntilDue = Math.ceil(
      (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue <= 3;
  };

  const isOverdue = (task: any) => {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const columnTasks = filteredTasks.filter((task) => task.status === status.id);

        return (
          <div
            key={status.id}
            className="flex-shrink-0 w-80 bg-white dark:bg-[#1A2F4B] rounded-xl border border-gray-200 dark:border-[#2979FF]/20"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.id)}
          >
            <div className="p-4 border-b border-gray-200 dark:border-[#2979FF]/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {status.label[language as 'en' | 'he']}
                </h3>
                <span className="px-2 py-1 bg-gray-100 dark:bg-[#0E1A2B] text-gray-600 dark:text-gray-400 rounded-md text-sm">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => onTaskClick(task)}
                  className={`p-4 bg-white dark:bg-[#0E1A2B] border-2 rounded-lg cursor-move hover:shadow-lg transition-all ${
                    isOverdue(task)
                      ? 'border-red-500 dark:border-red-600'
                      : isUrgent(task)
                      ? 'border-orange-500 dark:border-orange-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#2979FF]'
                  }`}
                >
                  {/* Priority Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    {task.progress > 0 && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {task.progress}%
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {task.title}
                  </h4>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {task.hasAttachments && (
                      <div className="flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {task._count?.attachments || 0}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {task.progress > 0 && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-[#2979FF] h-1.5 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Assignees & Properties */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {task.assignees?.slice(0, 3).map((assignee: any, idx: number) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full bg-[#2979FF] text-white text-xs flex items-center justify-center border-2 border-white dark:border-[#0E1A2B]"
                          title={assignee.agent?.name}
                        >
                          {assignee.agent?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                      ))}
                      {task.assignees?.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center border-2 border-white dark:border-[#0E1A2B]">
                          +{task.assignees.length - 3}
                        </div>
                      )}
                    </div>

                    {task._count?.properties > 0 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {task._count.properties} {language === 'he' ? 'נכסים' : 'properties'}
                      </span>
                    )}
                  </div>

                  {/* Urgent/Overdue Badge */}
                  {isOverdue(task) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      {language === 'he' ? 'באיחור' : 'Overdue'}
                    </div>
                  )}
                  {!isOverdue(task) && isUrgent(task) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                      <AlertCircle className="w-3 h-3" />
                      {language === 'he' ? 'דחוף' : 'Urgent'}
                    </div>
                  )}
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {language === 'he' ? 'אין משימות' : 'No tasks'}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
