'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, Plus, Search, User, Calendar, Briefcase } from 'lucide-react';
import { UniversalCard, CardHeader, CardBody, UniversalButton } from '@/components/shared';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface LawTask {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  boardColumn: string;
  boardOrder: number;
  dueDate?: string;
  case?: { id: string; caseNumber: string; title: string };
  assignedTo?: { id: string; fullName: string; email: string };
}

export function TasksPageClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [tasks, setTasks] = useState<LawTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<LawTask | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/law/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (task: LawTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (column: string) => {
    if (!draggedTask || draggedTask.boardColumn === column) {
      setDraggedTask(null);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/law/tasks/${draggedTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boardColumn: column, status: column }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setDraggedTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-500/20 text-gray-400',
      medium: 'bg-amber-500/20 text-amber-400',
      high: 'bg-red-500/20 text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  const columns = [
    { id: 'todo', title: lang === 'he' ? 'לביצוע' : 'To Do', color: 'border-gray-300' },
    { id: 'in_progress', title: lang === 'he' ? 'בביצוע' : 'In Progress', color: 'border-amber-300' },
    { id: 'done', title: lang === 'he' ? 'בוצע' : 'Done', color: 'border-green-300' },
  ];

  return (
    <div className="p-8 lg:p-10 min-h-screen bg-gradient-to-br from-[#0f1a2c] to-[#17223c]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {lang === 'he' ? 'משימות' : 'Tasks'}
                </h1>
                <p className="text-gray-300">
                  {lang === 'he' ? 'נהל משימות לוח משפטיות' : 'Manage legal tasks'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-[#0e1a2b] font-semibold rounded-xl px-5 py-2.5 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {lang === 'he' ? 'משימה חדשה' : 'New Task'}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                >
                  <div className={`mb-4 pb-3 border-b-2 ${column.color}`}>
                    <h3 className="text-lg font-semibold text-white flex items-center justify-between">
                      <span>{column.title}</span>
                      <span className="text-sm bg-[#1e3a5f]/40 px-2 py-1 rounded">
                        {tasks.filter(t => t.boardColumn === column.id).length}
                      </span>
                    </h3>
                  </div>

                  <div className="space-y-3 flex-1">
                    {tasks
                      .filter(task => task.boardColumn === column.id)
                      .map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          className="cursor-move border border-white/10 rounded-lg bg-[#1e3a5f]/20 hover:bg-[#2a4a7a]/30 transition-all duration-300 p-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-white">{task.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>

                            {task.description && (
                              <p className="text-sm text-gray-300 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex flex-col gap-2 pt-2 border-t border-white/10 text-xs text-gray-400">
                                {task.case && (
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    <span className="truncate">{task.case.caseNumber}</span>
                                  </div>
                                )}
                                {task.assignedTo && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span className="truncate">{task.assignedTo.fullName}</span>
                                  </div>
                                )}
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                        </div>
                      ))}

                    {tasks.filter(t => t.boardColumn === column.id).length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{lang === 'he' ? 'אין משימות' : 'No tasks'}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchTasks(); }} lang={lang} />
      )}
    </div>
  );
}

function CreateTaskModal({ onClose, onSuccess, lang }: { onClose: () => void; onSuccess: () => void; lang: string }) {
  const [cases, setCases] = useState<Array<{ id: string; caseNumber: string; title: string }>>([]);
  const [formData, setFormData] = useState({
    title: '', description: '', caseId: '', priority: 'medium', status: 'todo', dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch('/api/law/cases?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const response = await fetch('/api/law/tasks', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create task');
      }
      onSuccess();
    } catch (err: any) {
      console.error('[Create Task Error]', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{lang === 'he' ? 'משימה חדשה' : 'New Task'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'he' ? 'כותרת *' : 'Title *'}
            </label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder={lang === 'he' ? 'הזן כותרת משימה' : 'Enter task title'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {lang === 'he' ? 'תיאור' : 'Description'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={lang === 'he' ? 'הזן תיאור המשימה' : 'Enter task description'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'תיק קשור' : 'Related Case'}
              </label>
              <select
                value={formData.caseId}
                onChange={(e) => setFormData({...formData, caseId: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">{lang === 'he' ? 'ללא תיק' : 'None'}</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'עדיפות' : 'Priority'}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="low">{lang === 'he' ? 'נמוכה' : 'Low'}</option>
                <option value="medium">{lang === 'he' ? 'בינונית' : 'Medium'}</option>
                <option value="high">{lang === 'he' ? 'גבוהה' : 'High'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'סטטוס' : 'Status'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="todo">{lang === 'he' ? 'לביצוע' : 'To Do'}</option>
                <option value="in_progress">{lang === 'he' ? 'בביצוע' : 'In Progress'}</option>
                <option value="done">{lang === 'he' ? 'הושלם' : 'Done'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'he' ? 'תאריך יעד' : 'Due Date'}
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <UniversalButton
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              {lang === 'he' ? 'ביטול' : 'Cancel'}
            </UniversalButton>
            <UniversalButton
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (lang === 'he' ? 'יוצר...' : 'Creating...') : (lang === 'he' ? 'צור משימה' : 'Create Task')}
            </UniversalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
