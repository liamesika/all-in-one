/**
 * Creative Productions API Client
 * All endpoints scoped to /creative-* namespace
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Base API fetch with auth headers
 */
async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // TODO: Get real auth context from Firebase
  const authHeaders = {
    'x-org-id': 'demo-org',
    'x-owner-uid': 'demo-user',
    'x-user-id': 'demo-user',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// ========= CUSTOMERS API ========= //

export interface CreativeClient {
  id: string;
  name: string;
  company?: string;
  emails: string[];
  phones: string[];
  tags: string[];
  notes?: string;
  projects?: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  _count?: {
    projects: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  company?: string;
  emails: string[];
  phones: string[];
  tags?: string[];
  notes?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}

export const customersApi = {
  /**
   * List all customers with optional filters
   */
  async list(filters?: { search?: string; tags?: string[] }): Promise<CreativeClient[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.tags?.length) params.set('tags', filters.tags.join(','));

    const query = params.toString();
    return apiFetch(`/creative-clients${query ? `?${query}` : ''}`);
  },

  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<CreativeClient> {
    return apiFetch(`/creative-clients/${id}`);
  },

  /**
   * Get customer statistics
   */
  async getStatistics(): Promise<{
    totalClients: number;
    clientsWithProjects: number;
    clientsWithoutProjects: number;
    recentActivity: Array<{
      id: string;
      name: string;
      company?: string;
      updatedAt: string;
    }>;
  }> {
    return apiFetch('/creative-clients/statistics');
  },

  /**
   * Create new customer
   */
  async create(data: CreateClientDto): Promise<CreativeClient> {
    return apiFetch('/creative-clients', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Update customer
   */
  async update(id: string, data: UpdateClientDto): Promise<CreativeClient> {
    return apiFetch(`/creative-clients/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * Delete customer
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/creative-clients/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========= CALENDAR API ========= //

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'project_deadline' | 'task_due' | 'review_requested' | 'render_milestone';
  date: string; // ISO 8601
  status?: string;
  projectId?: string;
  projectName?: string;
  metadata?: any;
}

export interface CalendarSummary {
  totalEvents: number;
  byType: {
    project_deadline: number;
    task_due: number;
    review_requested: number;
    render_milestone: number;
  };
  upcomingDeadlines: number;
}

export const calendarApi = {
  /**
   * Get calendar events with filters
   */
  async getEvents(filters?: {
    startDate?: Date;
    endDate?: Date;
    projectId?: string;
    eventTypes?: string[];
  }): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.set('endDate', filters.endDate.toISOString());
    if (filters?.projectId) params.set('projectId', filters.projectId);
    if (filters?.eventTypes?.length) params.set('eventTypes', filters.eventTypes.join(','));

    const query = params.toString();
    return apiFetch(`/creative-calendar/events${query ? `?${query}` : ''}`);
  },

  /**
   * Get calendar summary
   */
  async getSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<CalendarSummary> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.set('endDate', filters.endDate.toISOString());

    const query = params.toString();
    return apiFetch(`/creative-calendar/summary${query ? `?${query}` : ''}`);
  },
};
