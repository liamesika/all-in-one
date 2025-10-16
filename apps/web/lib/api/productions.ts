/**
 * Productions API Client
 * Centralized API calls for Productions vertical with type safety
 */

import { ProjectType, ProjectStatus, ProductionTaskStatus, TaskDomain, BudgetCategory } from '@prisma/client';

// ============= Types =============

export interface ProductionProject {
  id: string;
  name: string;
  description: string | null;
  type: ProjectType;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  ownerUid: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: ProductionTask[];
  budgetItems?: ProductionBudgetItem[];
  files?: ProductionFileAsset[];
  suppliers?: ProductionProjectSupplier[];
  _count?: {
    tasks: number;
    budgetItems: number;
    files: number;
  };
}

export interface ProductionTask {
  id: string;
  title: string;
  description: string | null;
  domain: TaskDomain;
  status: ProductionTaskStatus;
  dueDate: Date | null;
  predecessorId: string | null;
  assigneeId: string | null;
  projectId: string;
  ownerUid: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface ProductionBudgetItem {
  id: string;
  category: BudgetCategory;
  planned: number;
  actual: number;
  invoiceUrl: string | null;
  quoteUrl: string | null;
  notes: string | null;
  projectId: string;
  supplierId: string | null;
  ownerUid: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionClient {
  id: string;
  name: string;
  type: 'corporate' | 'individual' | 'agency';
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  rating: number | null;
  status: 'active' | 'inactive' | 'prospect';
  tags: string[];
  ownerUid: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionEvent {
  id: string;
  title: string;
  project: string;
  type: 'deadline' | 'milestone' | 'meeting' | 'production';
  startDate: Date;
  endDate: Date | null;
  time: string | null;
  location: string | null;
  attendees: string[];
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  description: string | null;
  ownerUid: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionFileAsset {
  id: string;
  name: string;
  folder: string;
  url: string;
  version: number;
  notes: string | null;
  mimeType: string | null;
  size: number | null;
  projectId: string;
  ownerUid: string;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionProjectSupplier {
  id: string;
  role: string | null;
  projectId: string;
  supplierId: string;
  ownerUid: string;
  organizationId: string;
}

// ============= API Client =============

const API_BASE = '/api/productions-v2';

/**
 * Get Firebase auth token from client
 * This assumes Firebase auth is initialized and user is logged in
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    // Dynamic import to avoid SSR issues
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    return await user.getIdToken();
  } catch (error) {
    console.error('[Productions API] Failed to get auth token:', error);
    throw error;
  }
}

/**
 * Get organization ID from context
 * This should be implemented based on how the app manages active org
 */
function getOrgId(): string {
  if (typeof window === 'undefined') return '';

  // Try to get from localStorage or context
  // For now, using a placeholder - this should be replaced with actual org context
  const orgId = localStorage.getItem('activeOrgId') || 'demo';
  return orgId;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const orgId = getOrgId();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-org-id': orgId,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============= Projects API =============

export const projectsAPI = {
  getAll: (params?: { status?: ProjectStatus; type?: ProjectType; search?: string }) =>
    fetchAPI<ProductionProject[]>(`/projects?${new URLSearchParams(params as any)}`),

  getById: (id: string) =>
    fetchAPI<ProductionProject>(`/projects/${id}`),

  create: (data: Omit<ProductionProject, 'id' | 'createdAt' | 'updatedAt' | 'ownerUid' | 'organizationId'>) =>
    fetchAPI<ProductionProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ProductionProject>) =>
    fetchAPI<ProductionProject>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/projects/${id}`, { method: 'DELETE' }),

  getStats: () =>
    fetchAPI<{
      total: number;
      active: number;
      planning: number;
      done: number;
      byType: Record<ProjectType, number>;
    }>('/projects/stats'),
};

// ============= Tasks API =============

export const tasksAPI = {
  getAll: (params?: { projectId?: string; status?: ProductionTaskStatus; assigneeId?: string }) =>
    fetchAPI<ProductionTask[]>(`/tasks?${new URLSearchParams(params as any)}`),

  getById: (id: string) =>
    fetchAPI<ProductionTask>(`/tasks/${id}`),

  create: (data: Omit<ProductionTask, 'id' | 'createdAt' | 'updatedAt' | 'ownerUid' | 'organizationId'>) =>
    fetchAPI<ProductionTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ProductionTask>) =>
    fetchAPI<ProductionTask>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/tasks/${id}`, { method: 'DELETE' }),

  updateStatus: (id: string, status: ProductionTaskStatus) =>
    fetchAPI<ProductionTask>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  assign: (id: string, assigneeId: string) =>
    fetchAPI<ProductionTask>(`/tasks/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigneeId }),
    }),
};

// ============= Clients API =============

export const clientsAPI = {
  getAll: (params?: { status?: string; search?: string }) =>
    fetchAPI<ProductionClient[]>(`/clients?${new URLSearchParams(params as any)}`),

  getById: (id: string) =>
    fetchAPI<ProductionClient>(`/clients/${id}`),

  create: (data: Omit<ProductionClient, 'id' | 'createdAt' | 'updatedAt' | 'ownerUid' | 'organizationId'>) =>
    fetchAPI<ProductionClient>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ProductionClient>) =>
    fetchAPI<ProductionClient>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/clients/${id}`, { method: 'DELETE' }),
};

// ============= Events API =============

export const eventsAPI = {
  getAll: (params?: { startDate?: string; endDate?: string; type?: string }) =>
    fetchAPI<ProductionEvent[]>(`/events?${new URLSearchParams(params as any)}`),

  getById: (id: string) =>
    fetchAPI<ProductionEvent>(`/events/${id}`),

  create: (data: Omit<ProductionEvent, 'id' | 'createdAt' | 'updatedAt' | 'ownerUid' | 'organizationId'>) =>
    fetchAPI<ProductionEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ProductionEvent>) =>
    fetchAPI<ProductionEvent>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/events/${id}`, { method: 'DELETE' }),
};

// ============= Files API =============

export const filesAPI = {
  getAll: (projectId: string) =>
    fetchAPI<ProductionFileAsset[]>(`/files?projectId=${projectId}`),

  upload: (projectId: string, file: File, folder: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('folder', folder);

    return fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  delete: (id: string) =>
    fetchAPI<void>(`/files/${id}`, { method: 'DELETE' }),
};

// ============= Budget API =============

export const budgetAPI = {
  getAll: (projectId: string) =>
    fetchAPI<ProductionBudgetItem[]>(`/budget?projectId=${projectId}`),

  create: (data: Omit<ProductionBudgetItem, 'id' | 'createdAt' | 'updatedAt' | 'ownerUid' | 'organizationId'>) =>
    fetchAPI<ProductionBudgetItem>('/budget', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ProductionBudgetItem>) =>
    fetchAPI<ProductionBudgetItem>(`/budget/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/budget/${id}`, { method: 'DELETE' }),
};

// ============= Analytics API =============

export const analyticsAPI = {
  getOverview: () =>
    fetchAPI<{
      totalRevenue: number;
      activeProjects: number;
      completedTasks: number;
      totalClients: number;
      revenueGrowth: number;
      projectGrowth: number;
      taskCompletionRate: number;
      clientGrowth: number;
    }>('/analytics/overview'),

  getRevenueData: (period: '7d' | '30d' | '90d' | '1y') =>
    fetchAPI<{ label: string; value: number }[]>(`/analytics/revenue?period=${period}`),

  getProjectDistribution: () =>
    fetchAPI<{ label: string; value: number; color: string }[]>('/analytics/projects/distribution'),

  getTaskMetrics: () =>
    fetchAPI<{ label: string; value: number }[]>('/analytics/tasks/metrics'),
};
