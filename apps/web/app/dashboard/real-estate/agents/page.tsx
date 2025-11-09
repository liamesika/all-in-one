'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import {
  Users,
  Plus,
  Calendar,
  LayoutGrid,
  Filter,
  Search,
  Loader2,
} from 'lucide-react';
import KanbanBoard from './components/KanbanBoard';
import TaskCalendar from './components/TaskCalendar';
import CreateTaskModal from './components/CreateTaskModal';
import AgentsPanel from './components/AgentsPanel';
import TaskDetailPanel from './components/TaskDetailPanel';

type View = 'board' | 'calendar';

export default function AgentsTasksPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [view, setView] = useState<View>('board');
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAgentsPanel, setShowAgentsPanel] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    agentId: '',
    search: '',
  });

  const t = {
    title: language === 'he' ? 'סוכנים ומשימות' : 'Agents & Tasks',
    board: language === 'he' ? 'לוח' : 'Board',
    calendar: language === 'he' ? 'יומן' : 'Calendar',
    agents: language === 'he' ? 'סוכנים' : 'Agents',
    newTask: language === 'he' ? 'משימה חדשה' : 'New Task',
    search: language === 'he' ? 'חיפוש...' : 'Search...',
    filters: language === 'he' ? 'פילטרים' : 'Filters',
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, agentsRes] = await Promise.all([
        fetch('/api/real-estate/tasks'),
        fetch('/api/real-estate/agents'),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData.agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask: any) => {
    setTasks([newTask, ...tasks]);
    setShowCreateTask(false);
  };

  const handleTaskUpdated = (updatedTask: any) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2979FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A2F4B] border-b border-gray-200 dark:border-[#2979FF]/20">
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2979FF]/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#2979FF]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tasks.length} tasks • {agents.length} agents
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAgentsPanel(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-[#0E1A2B] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                {t.agents}
              </button>
              <button
                onClick={() => setShowCreateTask(true)}
                className="px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-[#1e5bb8] transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                {t.newTask}
              </button>
            </div>
          </div>

          {/* View Toggle & Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('board')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  view === 'board'
                    ? 'bg-[#2979FF] text-white'
                    : 'bg-gray-100 dark:bg-[#0E1A2B] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                {t.board}
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  view === 'calendar'
                    ? 'bg-[#2979FF] text-white'
                    : 'bg-gray-100 dark:bg-[#0E1A2B] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {t.calendar}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#0E1A2B] border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2979FF]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 lg:px-8 py-6">
        {view === 'board' ? (
          <KanbanBoard
            tasks={tasks}
            agents={agents}
            filters={filters}
            onTaskClick={setSelectedTask}
            onTaskUpdate={handleTaskUpdated}
          />
        ) : (
          <TaskCalendar
            tasks={tasks}
            onTaskClick={setSelectedTask}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          agents={agents}
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {showAgentsPanel && (
        <AgentsPanel
          agents={agents}
          onClose={() => setShowAgentsPanel(false)}
          onAgentsChange={fetchData}
        />
      )}

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          agents={agents}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdated}
          onTaskDelete={handleTaskDeleted}
        />
      )}
    </div>
  );
}
