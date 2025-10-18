'use client';

/**
 * Law Tasks Page
 * Task management with table and Kanban board views
 * Features: Drag-and-drop Kanban, real API integration, task CRUD
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { PriorityBadge } from '@/components/law/PriorityBadge';
import { TaskModal } from '@/components/law/modals';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';
import { Plus, List, LayoutGrid, Calendar, User } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  dueDate?: string;
  boardColumn: 'todo' | 'in_progress' | 'review' | 'done';
  boardOrder: number;
  case?: { id: string; caseNumber: string; title: string };
  assignedTo?: { id: string; name: string };
}

function SortableTaskCard({ task, language }: { task: Task; language: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move"
    >
      <UniversalCard hoverable>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {task.title}
            </h4>
            <PriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            {task.case && (
              <div className="flex items-center gap-1">
                <span className="font-medium">{task.case.caseNumber}</span>
              </div>
            )}
            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.assignedTo.name}
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </UniversalCard>
    </div>
  );
}

export default function LawTasksPage() {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { id: 'todo', title: language === 'he' ? 'לביצוע' : 'To Do', color: 'bg-gray-500' },
    { id: 'in_progress', title: language === 'he' ? 'בעבודה' : 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: language === 'he' ? 'בבדיקה' : 'Review', color: 'bg-yellow-500' },
    { id: 'done', title: language === 'he' ? 'הושלם' : 'Completed', color: 'bg-green-500' },
  ];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await lawApi.tasks.list({ limit: 1000 });
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת משימות' : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Check if dropped on a different column
    const overColumn = over.id as string;
    const validColumns = ['todo', 'in_progress', 'review', 'done'];

    if (validColumns.includes(overColumn)) {
      // Dropped on column header - move to that column
      const columnTasks = tasks.filter(t => t.boardColumn === overColumn);
      const newOrder = columnTasks.length;

      // Optimistic update
      setTasks(prev => prev.map(t =>
        t.id === activeTask.id
          ? { ...t, boardColumn: overColumn as any, boardOrder: newOrder }
          : t
      ));

      try {
        await lawApi.tasks.move(activeTask.id, {
          boardColumn: overColumn as any,
          boardOrder: newOrder,
        });
        toast.success(language === 'he' ? 'המשימה הועברה בהצלחה' : 'Task moved successfully');
      } catch (error) {
        console.error('Failed to move task:', error);
        toast.error(language === 'he' ? 'שגיאה בהעברת משימה' : 'Failed to move task');
        loadTasks(); // Reload to revert optimistic update
      }
    } else {
      // Dropped on another task - reorder within same column
      const overTask = tasks.find(t => t.id === over.id);
      if (!overTask || activeTask.boardColumn !== overTask.boardColumn) return;

      const columnTasks = tasks.filter(t => t.boardColumn === activeTask.boardColumn);
      const oldIndex = columnTasks.findIndex(t => t.id === activeTask.id);
      const newIndex = columnTasks.findIndex(t => t.id === overTask.id);

      const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex).map((t, idx) => ({
        ...t,
        boardOrder: idx,
      }));

      // Optimistic update
      setTasks(prev => {
        const otherTasks = prev.filter(t => t.boardColumn !== activeTask.boardColumn);
        return [...otherTasks, ...reorderedTasks].sort((a, b) => {
          if (a.boardColumn !== b.boardColumn) return 0;
          return a.boardOrder - b.boardOrder;
        });
      });

      try {
        await lawApi.tasks.move(activeTask.id, {
          boardColumn: activeTask.boardColumn,
          boardOrder: newIndex,
        });
      } catch (error) {
        console.error('Failed to reorder task:', error);
        loadTasks(); // Reload to revert optimistic update
      }
    }
  };

  const handleTaskCreated = () => {
    loadTasks();
    setIsTaskModalOpen(false);
    setSelectedTask(undefined);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            {language === 'he' ? 'טוען...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

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

          <UniversalButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedTask(undefined);
              setIsTaskModalOpen(true);
            }}
          >
            {language === 'he' ? 'משימה חדשה' : 'New Task'}
          </UniversalButton>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => {
              const columnTasks = tasks
                .filter((task) => task.boardColumn === column.id)
                .sort((a, b) => a.boardOrder - b.boardOrder);

              return (
                <div
                  key={column.id}
                  id={column.id}
                  className="space-y-4"
                >
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
                  <SortableContext
                    items={columnTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[200px]">
                      {columnTasks.map((task) => (
                        <div key={task.id} onClick={() => handleEditTask(task)}>
                          <SortableTaskCard task={task} language={language} />
                        </div>
                      ))}

                      {columnTasks.length === 0 && (
                        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                          {language === 'he' ? 'אין משימות' : 'No tasks'}
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </DndContext>
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
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleEditTask(task)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {task.case?.caseNumber || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {task.assignedTo?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {task.status.replace('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'he' ? 'לא נמצאו משימות' : 'No tasks found'}
              </p>
            </div>
          )}
        </UniversalCard>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(undefined);
        }}
        onSuccess={handleTaskCreated}
        taskData={selectedTask}
      />
    </div>
  );
}
