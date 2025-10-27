'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, Clock } from 'lucide-react';
import { UniversalButton } from '@/components/shared';

export interface TutorialTask {
  id: number;
  title: string;
  titleHe: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface TaskProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TutorialTask[];
  onUpdateTask: (taskId: number, status: TutorialTask['status']) => Promise<void>;
  lang: 'en' | 'he';
}

export function TaskProgressModal({
  isOpen,
  onClose,
  tasks,
  onUpdateTask,
  lang,
}: TaskProgressModalProps) {
  const [localTasks, setLocalTasks] = useState<TutorialTask[]>(tasks);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  if (!isOpen) return null;

  const completed = localTasks.filter((t) => t.status === 'completed').length;
  const total = localTasks.length;
  const progress = Math.round((completed / total) * 100);

  const handleUpdateStatus = async (taskId: number, status: TutorialTask['status']) => {
    setUpdating(taskId);
    try {
      await onUpdateTask(taskId, status);
      setLocalTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status } : task))
      );
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status: TutorialTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: TutorialTask['status']) => {
    if (lang === 'he') {
      switch (status) {
        case 'completed':
          return 'הושלם';
        case 'in_progress':
          return 'בתהליך';
        default:
          return 'לא התחיל';
      }
    }
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {lang === 'he' ? 'התקדמות הדרכות' : 'Tutorial Progress'}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {lang === 'he'
                ? `${completed} מתוך ${total} הדרכות הושלמו`
                : `${completed} of ${total} tutorials completed`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {progress}%
            </span>
          </div>
        </div>

        {/* Tasks List */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          <div className="space-y-3">
            {localTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {lang === 'he' ? task.titleHe : task.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {getStatusLabel(task.status)}
                      </p>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'not_started')}
                      disabled={updating === task.id}
                      className={`p-2 rounded-lg transition-colors ${
                        task.status === 'not_started'
                          ? 'bg-gray-200 dark:bg-gray-700'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={lang === 'he' ? 'לא התחיל' : 'Not Started'}
                    >
                      <Circle className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      disabled={updating === task.id}
                      className={`p-2 rounded-lg transition-colors ${
                        task.status === 'in_progress'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={lang === 'he' ? 'בתהליך' : 'In Progress'}
                    >
                      <Clock className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      disabled={updating === task.id}
                      className={`p-2 rounded-lg transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={lang === 'he' ? 'הושלם' : 'Completed'}
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <UniversalButton
            onClick={onClose}
            variant="secondary"
            className="px-6"
          >
            {lang === 'he' ? 'סגור' : 'Close'}
          </UniversalButton>
        </div>
      </div>
    </div>
  );
}
