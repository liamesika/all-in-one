import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import type {
  Task,
  TaskFilters,
  TasksListResponse,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskBoard,
  getTasksByStatus,
} from '@/lib/types/law/task';

/**
 * React Query Hooks for Task Management
 * Features: Optimistic updates, board view, drag & drop, analytics
 */

// ============================================================================
// API Functions
// ============================================================================

async function fetchTasks(filters: TaskFilters = {}): Promise<TasksListResponse> {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
  if (filters.caseId) params.append('caseId', filters.caseId);
  if (filters.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom);
  if (filters.dueDateTo) params.append('dueDateTo', filters.dueDateTo);
  if (filters.search) params.append('search', filters.search);

  const response = await fetch(`/api/law/tasks?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

async function fetchTask(id: string): Promise<{ task: Task }> {
  const response = await fetch(`/api/law/tasks/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }
  return response.json();
}

async function createTask(input: CreateTaskInput): Promise<{ task: Task }> {
  const startTime = Date.now();

  const response = await fetch('/api/law/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create task');
  }

  const data = await response.json();

  // Track analytics
  trackEventWithConsent('law_task_create', {
    source: 'tasks_page',
    success: true,
    duration_ms: Date.now() - startTime,
    task_status: input.status,
    task_priority: input.priority,
    case_id: input.caseId,
  });

  return data;
}

async function updateTask(input: UpdateTaskInput): Promise<{ task: Task }> {
  const startTime = Date.now();

  const response = await fetch(`/api/law/tasks/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update task');
  }

  const data = await response.json();

  // Track analytics
  trackEventWithConsent('law_task_update', {
    source: 'tasks_page',
    success: true,
    duration_ms: Date.now() - startTime,
    task_id: input.id,
  });

  return data;
}

async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/law/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }

  // Track analytics
  trackEventWithConsent('law_task_delete', {
    source: 'tasks_page',
    success: true,
    task_id: id,
  });
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch list of tasks with optional filters
 */
export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['law', 'tasks', 'list', filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch tasks organized by status for board view
 */
export function useTasksBoard(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['law', 'tasks', 'board', filters],
    queryFn: async () => {
      const response = await fetchTasks(filters);
      // Transform into board structure
      const { getTasksByStatus: organizeByStatus } = await import('@/lib/types/law/task');
      return organizeByStatus(response.tasks);
    },
    staleTime: 30000,
  });
}

/**
 * Fetch single task by ID
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: ['law', 'tasks', 'detail', id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new task with optimistic update
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate all task lists and boards
      queryClient.invalidateQueries({ queryKey: ['law', 'tasks', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['law', 'tasks', 'board'] });
    },
    onError: (error) => {
      trackEventWithConsent('law_task_create', {
        source: 'tasks_page',
        success: false,
        error: error.message,
      });
    },
  });
}

/**
 * Update task with optimistic update and rollback on error
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    // Optimistic update
    onMutate: async (updatedTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['law', 'tasks', 'detail', updatedTask.id] });

      // Snapshot previous value
      const previousTask = queryClient.getQueryData(['law', 'tasks', 'detail', updatedTask.id]);

      // Optimistically update cache
      queryClient.setQueryData(
        ['law', 'tasks', 'detail', updatedTask.id],
        (old: { task: Task } | undefined) => {
          if (!old) return old;
          return {
            task: {
              ...old.task,
              ...updatedTask,
              updatedAt: new Date().toISOString(),
            },
          };
        }
      );

      return { previousTask };
    },
    onError: (error, updatedTask, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(['law', 'tasks', 'detail', updatedTask.id], context.previousTask);
      }

      trackEventWithConsent('law_task_update', {
        source: 'tasks_page',
        success: false,
        error: error.message,
        task_id: updatedTask.id,
      });
    },
    onSettled: (data, error, updatedTask) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['law', 'tasks', 'detail', updatedTask.id] });
      queryClient.invalidateQueries({ queryKey: ['law', 'tasks', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['law', 'tasks', 'board'] });
    },
  });
}

/**
 * Delete task with optimistic update
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    // Optimistic update
    onMutate: async (taskId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['law', 'tasks', 'list'] });
      await queryClient.cancelQueries({ queryKey: ['law', 'tasks', 'board'] });

      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ queryKey: ['law', 'tasks', 'list'] });
      const previousBoards = queryClient.getQueriesData({ queryKey: ['law', 'tasks', 'board'] });

      // Optimistically remove from all lists
      queryClient.setQueriesData({ queryKey: ['law', 'tasks', 'list'] }, (old: any) => {
        if (!old?.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t: Task) => t.id !== taskId),
          total: old.total - 1,
        };
      });

      // Optimistically remove from board
      queryClient.setQueriesData({ queryKey: ['law', 'tasks', 'board'] }, (old: any) => {
        if (!old) return old;
        const updated = { ...old };
        Object.keys(updated).forEach((status) => {
          updated[status] = updated[status].filter((t: Task) => t.id !== taskId);
        });
        return updated;
      });

      return { previousLists, previousBoards };
    },
    onError: (error, taskId, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousBoards) {
        context.previousBoards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      trackEventWithConsent('law_task_delete', {
        source: 'tasks_page',
        success: false,
        error: error.message,
        task_id: taskId,
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['law', 'tasks', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['law', 'tasks', 'board'] });
    },
  });
}

/**
 * Update task status (for drag & drop in board view)
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) => {
      const response = await fetch(`/api/law/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      return response.json();
    },
    onMutate: async ({ taskId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['law', 'tasks', 'board'] });

      // Snapshot previous board
      const previousBoards = queryClient.getQueriesData({ queryKey: ['law', 'tasks', 'board'] });

      // Optimistically move task in board
      queryClient.setQueriesData({ queryKey: ['law', 'tasks', 'board'] }, (old: any) => {
        if (!old) return old;

        const updated = { ...old };
        let taskToMove: Task | null = null;
        let oldStatus: TaskStatus | null = null;

        // Find and remove task from old column
        Object.keys(updated).forEach((status) => {
          const index = updated[status].findIndex((t: Task) => t.id === taskId);
          if (index !== -1) {
            taskToMove = updated[status][index];
            oldStatus = status as TaskStatus;
            updated[status] = updated[status].filter((t: Task) => t.id !== taskId);
          }
        });

        // Add to new column if task found
        if (taskToMove && oldStatus) {
          taskToMove = { ...taskToMove, status: newStatus, updatedAt: new Date().toISOString() };
          updated[newStatus] = [...updated[newStatus], taskToMove];

          // Track drag event
          trackEventWithConsent('law_task_drag_status_change', {
            task_id: taskId,
            from_status: oldStatus,
            to_status: newStatus,
          });
        }

        return updated;
      });

      return { previousBoards };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        context.previousBoards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['law', 'tasks', 'board'] });
      queryClient.invalidateQueries({ queryKey: ['law', 'tasks', 'list'] });
    },
  });
}
