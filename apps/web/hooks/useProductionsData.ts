/**
 * React Query hooks for Productions data
 * Provides caching, automatic refetching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  projectsAPI,
  tasksAPI,
  clientsAPI,
  eventsAPI,
  filesAPI,
  budgetAPI,
  analyticsAPI,
  ProductionProject,
  ProductionTask,
  ProductionClient,
  ProductionEvent,
  ProductionFileAsset,
  ProductionBudgetItem
} from '@/lib/api/productions';
import { ProjectStatus, ProductionTaskStatus, ProjectType } from '@prisma/client';
import { useProductionsAnalytics } from './useProductionsAnalytics';
import { AnalyticsAction } from '@/lib/analytics/productions-analytics';

// ============= Query Keys =============

export const productionsKeys = {
  all: ['productions'] as const,
  projects: () => [...productionsKeys.all, 'projects'] as const,
  project: (id: string) => [...productionsKeys.projects(), id] as const,
  projectStats: () => [...productionsKeys.projects(), 'stats'] as const,
  tasks: () => [...productionsKeys.all, 'tasks'] as const,
  task: (id: string) => [...productionsKeys.tasks(), id] as const,
  tasksByProject: (projectId: string) => [...productionsKeys.tasks(), 'project', projectId] as const,
  clients: () => [...productionsKeys.all, 'clients'] as const,
  client: (id: string) => [...productionsKeys.clients(), id] as const,
  events: () => [...productionsKeys.all, 'events'] as const,
  event: (id: string) => [...productionsKeys.events(), id] as const,
  files: (projectId: string) => [...productionsKeys.all, 'files', projectId] as const,
  budget: (projectId: string) => [...productionsKeys.all, 'budget', projectId] as const,
  analytics: () => [...productionsKeys.all, 'analytics'] as const,
};

// ============= Projects Hooks =============

export function useProjects(params?: { status?: ProjectStatus; type?: ProjectType; search?: string }) {
  return useQuery({
    queryKey: [...productionsKeys.projects(), params],
    queryFn: () => projectsAPI.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProject(id: string, options?: UseQueryOptions<ProductionProject>) {
  return useQuery({
    queryKey: productionsKeys.project(id),
    queryFn: () => projectsAPI.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useProjectStats() {
  return useQuery({
    queryKey: productionsKeys.projectStats(),
    queryFn: () => projectsAPI.getStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes for stats
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { trackProject } = useProductionsAnalytics();

  return useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: (newProject) => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: productionsKeys.projects() });
      queryClient.invalidateQueries({ queryKey: productionsKeys.projectStats() });

      // Track analytics
      trackProject(AnalyticsAction.PROJECT_CREATED, newProject.id, {
        type: newProject.type,
        status: newProject.status,
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { trackProject } = useProductionsAnalytics();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionProject> }) =>
      projectsAPI.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productionsKeys.project(id) });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData<ProductionProject>(productionsKeys.project(id));

      // Optimistically update
      if (previousProject) {
        queryClient.setQueryData<ProductionProject>(productionsKeys.project(id), {
          ...previousProject,
          ...data,
        });
      }

      return { previousProject };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(productionsKeys.project(id), context.previousProject);
      }
    },
    onSuccess: (updatedProject, { data }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productionsKeys.projects() });
      queryClient.invalidateQueries({ queryKey: productionsKeys.projectStats() });

      // Track analytics
      trackProject(AnalyticsAction.PROJECT_UPDATED, updatedProject.id, {
        changes: Object.keys(data),
      });

      if (data.status) {
        trackProject(AnalyticsAction.PROJECT_STATUS_CHANGED, updatedProject.id, {
          newStatus: data.status,
        });
      }
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { trackProject } = useProductionsAnalytics();

  return useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.projects() });
      queryClient.invalidateQueries({ queryKey: productionsKeys.projectStats() });
      queryClient.removeQueries({ queryKey: productionsKeys.project(deletedId) });

      trackProject(AnalyticsAction.PROJECT_DELETED, deletedId);
    },
  });
}

// ============= Tasks Hooks =============

export function useTasks(params?: { projectId?: string; status?: ProductionTaskStatus; assigneeId?: string }) {
  return useQuery({
    queryKey: [...productionsKeys.tasks(), params],
    queryFn: () => tasksAPI.getAll(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: productionsKeys.task(id),
    queryFn: () => tasksAPI.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { trackTask } = useProductionsAnalytics();

  return useMutation({
    mutationFn: tasksAPI.create,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: productionsKeys.project(newTask.projectId) });

      trackTask(AnalyticsAction.TASK_CREATED, newTask.id, {
        projectId: newTask.projectId,
        domain: newTask.domain,
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { trackTask } = useProductionsAnalytics();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionTask> }) =>
      tasksAPI.update(id, data),
    onSuccess: (updatedTask, { data }) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: productionsKeys.task(updatedTask.id) });
      queryClient.invalidateQueries({ queryKey: productionsKeys.project(updatedTask.projectId) });

      trackTask(AnalyticsAction.TASK_UPDATED, updatedTask.id, {
        changes: Object.keys(data),
      });

      if (data.status === 'DONE') {
        trackTask(AnalyticsAction.TASK_COMPLETED, updatedTask.id);
      } else if (data.status) {
        trackTask(AnalyticsAction.TASK_STATUS_CHANGED, updatedTask.id, {
          newStatus: data.status,
        });
      }

      if (data.assigneeId) {
        trackTask(AnalyticsAction.TASK_ASSIGNED, updatedTask.id, {
          assigneeId: data.assigneeId,
        });
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { trackTask } = useProductionsAnalytics();

  return useMutation({
    mutationFn: tasksAPI.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.tasks() });
      queryClient.removeQueries({ queryKey: productionsKeys.task(deletedId) });

      trackTask(AnalyticsAction.TASK_DELETED, deletedId);
    },
  });
}

// ============= Clients Hooks =============

export function useClients(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: [...productionsKeys.clients(), params],
    queryFn: () => clientsAPI.getAll(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: productionsKeys.client(id),
    queryFn: () => clientsAPI.getById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { trackClient } = useProductionsAnalytics();

  return useMutation({
    mutationFn: clientsAPI.create,
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.clients() });

      trackClient(AnalyticsAction.CLIENT_CREATED, newClient.id, {
        type: newClient.type,
      });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { trackClient } = useProductionsAnalytics();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionClient> }) =>
      clientsAPI.update(id, data),
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.clients() });
      queryClient.setQueryData(productionsKeys.client(updatedClient.id), updatedClient);

      trackClient(AnalyticsAction.CLIENT_UPDATED, updatedClient.id);
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { trackClient } = useProductionsAnalytics();

  return useMutation({
    mutationFn: clientsAPI.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.clients() });
      queryClient.removeQueries({ queryKey: productionsKeys.client(deletedId) });

      trackClient(AnalyticsAction.CLIENT_DELETED, deletedId);
    },
  });
}

// ============= Events Hooks =============

export function useEvents(params?: { startDate?: string; endDate?: string; type?: string }) {
  return useQuery({
    queryKey: [...productionsKeys.events(), params],
    queryFn: () => eventsAPI.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: productionsKeys.event(id),
    queryFn: () => eventsAPI.getById(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.events() });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionEvent> }) =>
      eventsAPI.update(id, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.events() });
      queryClient.setQueryData(productionsKeys.event(updatedEvent.id), updatedEvent);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsAPI.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.events() });
      queryClient.removeQueries({ queryKey: productionsKeys.event(deletedId) });
    },
  });
}

// ============= Analytics Hooks =============

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: [...productionsKeys.analytics(), 'overview'],
    queryFn: () => analyticsAPI.getOverview(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useRevenueData(period: '7d' | '30d' | '90d' | '1y') {
  return useQuery({
    queryKey: [...productionsKeys.analytics(), 'revenue', period],
    queryFn: () => analyticsAPI.getRevenueData(period),
    staleTime: 1000 * 60 * 15,
  });
}

export function useProjectDistribution() {
  return useQuery({
    queryKey: [...productionsKeys.analytics(), 'projects', 'distribution'],
    queryFn: () => analyticsAPI.getProjectDistribution(),
    staleTime: 1000 * 60 * 15,
  });
}

export function useTaskMetrics() {
  return useQuery({
    queryKey: [...productionsKeys.analytics(), 'tasks', 'metrics'],
    queryFn: () => analyticsAPI.getTaskMetrics(),
    staleTime: 1000 * 60 * 15,
  });
}

// ============= Budget Hooks =============

export function useBudget(params: { projectId: string }) {
  return useQuery({
    queryKey: productionsKeys.budget(params.projectId),
    queryFn: () => budgetAPI.getAll(params.projectId),
    enabled: !!params.projectId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<ProductionBudgetItem> }) =>
      budgetAPI.create(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.budget(projectId) });
      queryClient.invalidateQueries({ queryKey: productionsKeys.project(projectId) });
    },
  });
}

export function useUpdateBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionBudgetItem> }) =>
      budgetAPI.update(id, data),
    onSuccess: (updatedItem) => {
      if (updatedItem.projectId) {
        queryClient.invalidateQueries({ queryKey: productionsKeys.budget(updatedItem.projectId) });
      }
    },
  });
}

export function useDeleteBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      budgetAPI.delete(id),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.budget(projectId) });
      queryClient.invalidateQueries({ queryKey: productionsKeys.project(projectId) });
    },
  });
}

// ============= Files Hooks =============

export function useFiles(params: { projectId: string }) {
  return useQuery({
    queryKey: productionsKeys.files(params.projectId),
    queryFn: () => filesAPI.getAll(params.projectId),
    enabled: !!params.projectId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, file, data }: { projectId: string; file: File; data?: Partial<ProductionFileAsset> }) =>
      filesAPI.upload(projectId, file, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.files(projectId) });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      filesAPI.delete(id),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: productionsKeys.files(projectId) });
    },
  });
}
