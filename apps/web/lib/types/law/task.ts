import { z } from 'zod';

/**
 * Task Management Types for Law Practice
 * Complete type system with Zod validation
 */

// ============================================================================
// Enums
// ============================================================================

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'review', 'done', 'cancelled']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

// ============================================================================
// Core Interfaces
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  // Relationships
  caseId?: string;
  case?: {
    id: string;
    caseNumber: string;
    title: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: string;
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

// Create Task Schema
export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional().or(z.literal('')),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  caseId: z.string().optional().or(z.literal('')),
  assigneeId: z.string().min(1, 'Assignee is required'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// Update Task Schema
export const updateTaskSchema = createTaskSchema.extend({
  id: z.string(),
  completedAt: z.string().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// ============================================================================
// Filter & Sort Types
// ============================================================================

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  caseId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export type TaskSortField = 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';

export interface TaskSortOptions {
  field: TaskSortField;
  direction: 'asc' | 'desc';
}

// ============================================================================
// Board View Types
// ============================================================================

export interface TaskBoard {
  todo: Task[];
  in_progress: Task[];
  review: Task[];
  done: Task[];
  cancelled: Task[];
}

export interface TaskDragEvent {
  taskId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  fromIndex: number;
  toIndex: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface TasksListResponse {
  tasks: Task[];
  total: number;
  page?: number;
  limit?: number;
}

export interface TaskDetailResponse {
  task: Task;
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

// ============================================================================
// React Query Keys
// ============================================================================

export const taskKeys = {
  all: ['law', 'tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  board: (filters: TaskFilters) => [...taskKeys.all, 'board', filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  comments: (taskId: string) => [...taskKeys.detail(taskId), 'comments'] as const,
  attachments: (taskId: string) => [...taskKeys.detail(taskId), 'attachments'] as const,
};

// ============================================================================
// Display Helpers
// ============================================================================

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const taskStatusColors: Record<
  TaskStatus,
  { bg: string; text: string; border: string }
> = {
  todo: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
  in_progress: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  review: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  done: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  cancelled: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const taskPriorityColors: Record<
  TaskPriority,
  { bg: string; text: string; border: string }
> = {
  low: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
  medium: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  high: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
  },
  urgent: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done' || task.status === 'cancelled') {
    return false;
  }
  return new Date(task.dueDate) < new Date();
}

export function getTasksByStatus(tasks: Task[]): TaskBoard {
  return tasks.reduce(
    (board, task) => {
      board[task.status].push(task);
      return board;
    },
    {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
      cancelled: [],
    } as TaskBoard
  );
}

export function calculateTaskCompletion(tasks: Task[]): {
  total: number;
  completed: number;
  percentage: number;
} {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'done').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percentage };
}
