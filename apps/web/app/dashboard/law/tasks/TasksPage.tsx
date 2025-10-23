'use client';

/**
 * TasksPage - Kanban Board View
 * Drag & drop task management with @dnd-kit
 * Filters, search, optimistic updates
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
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
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  User,
  Flag,
  MoreVertical,
  Edit2,
  Trash2,
  GripVertical,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  LawCard,
  LawCardHeader,
  LawCardTitle,
  LawCardDescription,
  LawCardContent,
  LawButton,
  PriorityBadge,
  LawEmptyState,
} from '@/components/law/shared';
import { TaskModal } from '@/components/law/tasks/TaskModal';
import { useTasksBoard, useUpdateTaskStatus, useDeleteTask } from '@/lib/hooks/law/useTasks';
import type { Task, TaskStatus, TaskPriority, TaskFilters } from '@/lib/types/law/task';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import { preserveUTMParams } from '@/lib/utils/utm';
import toast from 'react-hot-toast';

const BOARD_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'law-text-tertiary' },
  { id: 'in_progress', title: 'In Progress', color: 'law-info' },
  { id: 'review', title: 'Review', color: 'law-accent' },
  { id: 'done', title: 'Done', color: 'law-success' },
  { id: 'cancelled', title: 'Cancelled', color: 'law-error' },
];

// Sortable Task Card Component
function SortableTaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
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

  const [showActions, setShowActions] = useState(false);

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    task.status !== 'cancelled' &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-law-md border border-law-border p-law-3 mb-law-3 shadow-law-sm hover:shadow-law-md transition-all ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-law-text-tertiary hover:text-law-primary transition-colors focus:outline-none"
          aria-label="Drag task"
        >
          <GripVertical size={16} />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-law-sm font-semibold text-law-text-primary line-clamp-2">
              {task.title}
            </h4>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-law-sm hover:bg-law-border transition-colors"
                aria-label="Task actions"
              >
                <MoreVertical size={14} className="text-law-text-tertiary" />
              </button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-6 z-20 bg-white rounded-law-md shadow-law-lg border border-law-border overflow-hidden min-w-[140px]">
                    <button
                      onClick={() => {
                        onEdit(task);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-law-sm text-law-text-primary hover:bg-law-primary-subtle transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete(task);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-law-sm text-law-error hover:bg-law-error-subtle transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-law-xs text-law-text-secondary line-clamp-2 mb-2">
              {task.description}
            </p>
          )}

          {/* Task Meta */}
          <div className="flex flex-wrap items-center gap-2">
            {task.priority !== 'medium' && (
              <PriorityBadge priority={task.priority} size="sm" />
            )}

            {task.dueDate && (
              <div
                className={`flex items-center gap-1 text-law-xs ${
                  isOverdue ? 'text-law-error' : 'text-law-text-tertiary'
                }`}
              >
                <Calendar size={12} />
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            )}

            {task.assigneeId && (
              <div className="flex items-center gap-1 text-law-xs text-law-text-tertiary">
                <User size={12} />
                <span className="truncate max-w-[80px]">
                  {task.assigneeId === 'att-1'
                    ? 'Sarah M.'
                    : task.assigneeId === 'att-2'
                      ? 'James W.'
                      : task.assigneeId === 'att-3'
                        ? 'Robert C.'
                        : 'Emily D.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Board Column Component
function BoardColumn({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
}: {
  column: (typeof BOARD_COLUMNS)[number];
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}) {
  return (
    <div className="flex-1 min-w-[280px] max-w-[400px]">
      <LawCard padding="none" shadow="md" className="h-full flex flex-col">
        {/* Column Header */}
        <div className="px-law-4 py-law-3 border-b border-law-border">
          <div className="flex items-center justify-between">
            <h3 className="text-law-base font-semibold text-law-text-primary">
              {column.title}
            </h3>
            <span
              className={`px-2 py-1 rounded-law-sm text-law-xs font-medium bg-${column.color}-subtle text-${column.color}`}
            >
              {tasks.length}
            </span>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 p-law-4 overflow-y-auto max-h-[calc(100vh-400px)]">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-law-text-tertiary text-law-sm">
                No tasks
              </div>
            ) : (
              tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </SortableContext>
        </div>
      </LawCard>
    </div>
  );
}

export function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    assigneeId: undefined,
    priority: undefined,
    caseId: undefined,
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, isLoading, error } = useTasksBoard(filters);
  const updateStatusMutation = useUpdateTaskStatus();
  const deleteMutation = useDeleteTask();

  useEffect(() => {
    preserveUTMParams();
    trackEventWithConsent('law_task_board_view', {
      page_title: 'Tasks Board',
      page_path: '/dashboard/law/tasks',
      vertical: 'law',
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Client-side search filter
  const filteredBoard = useMemo(() => {
    if (!data?.board || !searchQuery.trim()) return data?.board;

    const query = searchQuery.toLowerCase();
    const filtered: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
      cancelled: [],
    };

    Object.entries(data.board).forEach(([status, tasks]) => {
      filtered[status as TaskStatus] = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    });

    return filtered;
  }, [data?.board, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overColumnId = over.id as TaskStatus;

    // Find the task and its current status
    let activeTask: Task | undefined;
    let oldStatus: TaskStatus | undefined;

    Object.entries(data?.board || {}).forEach(([status, tasks]) => {
      const task = tasks.find((t) => t.id === activeTaskId);
      if (task) {
        activeTask = task;
        oldStatus = status as TaskStatus;
      }
    });

    if (!activeTask || !oldStatus) return;

    // If dropped on a column (not another task), update status
    if (BOARD_COLUMNS.some((col) => col.id === overColumnId)) {
      if (oldStatus !== overColumnId) {
        try {
          await updateStatusMutation.mutateAsync({
            taskId: activeTaskId,
            newStatus: overColumnId,
            oldStatus,
          });
        } catch (error) {
          console.error('Failed to update task status:', error);
          toast.error('Failed to move task');
        }
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteMutation.mutateAsync(taskToDelete.id);
      toast.success('Task deleted');
      setTaskToDelete(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleFilterChange = (key: keyof TaskFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));

    trackEventWithConsent('law_task_filter', {
      filter_type: key,
      filter_value: value,
    });
  };

  return (
    <div className="law-page min-h-screen">
      {/* Page Header */}
      <div className="law-page-header mb-law-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="law-page-title">Tasks Board</h1>
            <p className="law-page-subtitle">
              Manage tasks with drag & drop Kanban board
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LawButton
              variant="secondary"
              size="md"
              icon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </LawButton>
            <LawButton
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => {
                setTaskToEdit(null);
                setIsModalOpen(true);
              }}
            >
              New Task
            </LawButton>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-law-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-law-text-tertiary"
            size={20}
          />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-law-lg border border-law-border bg-white text-law-text-primary placeholder:text-law-text-tertiary focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-law-6 overflow-hidden"
          >
            <LawCard padding="md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Assignee Filter */}
                <div>
                  <label className="block text-law-sm font-medium text-law-text-primary mb-2">
                    Assigned To
                  </label>
                  <select
                    value={filters.assigneeId || 'all'}
                    onChange={(e) => handleFilterChange('assigneeId', e.target.value)}
                    className="w-full px-3 py-2 rounded-law-md border border-law-border bg-white text-law-text-primary focus:outline-none focus:ring-2 focus:ring-law-primary"
                  >
                    <option value="all">All Attorneys</option>
                    <option value="att-1">Sarah Miller</option>
                    <option value="att-2">James Wilson</option>
                    <option value="att-3">Robert Chen</option>
                    <option value="att-4">Emily Davis</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-law-sm font-medium text-law-text-primary mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority || 'all'}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 rounded-law-md border border-law-border bg-white text-law-text-primary focus:outline-none focus:ring-2 focus:ring-law-primary"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Case Filter */}
                <div>
                  <label className="block text-law-sm font-medium text-law-text-primary mb-2">
                    Related Case
                  </label>
                  <select
                    value={filters.caseId || 'all'}
                    onChange={(e) => handleFilterChange('caseId', e.target.value)}
                    className="w-full px-3 py-2 rounded-law-md border border-law-border bg-white text-law-text-primary focus:outline-none focus:ring-2 focus:ring-law-primary"
                  >
                    <option value="all">All Cases</option>
                    <option value="case-1">Johnson v. Smith Estate Planning</option>
                    <option value="case-2">Corporate Restructuring - TechCorp</option>
                    <option value="case-3">Martinez Family Law Matter</option>
                    <option value="case-4">Property Dispute - Greenfield LLC</option>
                  </select>
                </div>
              </div>
            </LawCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-law-4">
          {[...Array(5)].map((_, i) => (
            <LawCard key={i} padding="md" shadow="md">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-law-border rounded w-1/2" />
                <div className="h-20 bg-law-border rounded" />
                <div className="h-20 bg-law-border rounded" />
              </div>
            </LawCard>
          ))}
        </div>
      ) : error ? (
        <LawCard padding="lg">
          <div className="text-center py-8">
            <AlertCircle size={48} className="text-law-error mx-auto mb-4" />
            <p className="text-law-base text-law-text-primary font-semibold mb-2">
              Failed to load tasks
            </p>
            <p className="text-law-sm text-law-text-secondary mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <LawButton
              variant="secondary"
              size="md"
              onClick={() => window.location.reload()}
            >
              Retry
            </LawButton>
          </div>
        </LawCard>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-law-4 overflow-x-auto pb-4">
            {BOARD_COLUMNS.map((column) => (
              <SortableContext
                key={column.id}
                id={column.id}
                items={filteredBoard?.[column.id]?.map((t) => t.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <BoardColumn
                  column={column}
                  tasks={filteredBoard?.[column.id] || []}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </SortableContext>
            ))}
          </div>

          <DragOverlay>
            {activeId && (
              <div className="bg-white rounded-law-md border-2 border-law-primary p-law-3 shadow-law-xl opacity-90">
                <p className="text-law-sm font-semibold text-law-text-primary">
                  Dragging task...
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setTaskToDelete(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-law-xl shadow-law-2xl max-w-md w-full p-law-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-law-4">
              <div className="p-3 rounded-law-lg bg-law-error-subtle">
                <AlertCircle size={24} className="text-law-error" />
              </div>
              <div className="flex-1">
                <h3 className="text-law-lg font-semibold text-law-text-primary mb-1">
                  Delete Task
                </h3>
                <p className="text-law-sm text-law-text-secondary">
                  Are you sure you want to delete "{taskToDelete.title}"? This action
                  cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setTaskToDelete(null)}
                className="text-law-text-tertiary hover:text-law-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <LawButton
                variant="ghost"
                size="md"
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </LawButton>
              <LawButton
                variant="primary"
                size="md"
                onClick={confirmDelete}
                className="bg-law-error hover:bg-law-error/90"
              >
                Delete Task
              </LawButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
