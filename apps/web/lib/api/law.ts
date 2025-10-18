// Law Vertical API Client
// All endpoints require authentication via Firebase Auth

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ApiOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const lawApi = {
  // ========= CASES ========= //
  cases: {
    list: (params?: {
      q?: string;
      status?: string;
      caseType?: string;
      priority?: string;
      clientId?: string;
      assignedToId?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
      return apiRequest(`/law/cases${queryString}`);
    },

    get: (id: string) => apiRequest(`/law/cases/${id}`),

    getTimeline: (id: string) => apiRequest(`/law/cases/${id}/timeline`),

    create: (data: {
      title: string;
      description?: string;
      clientId: string;
      caseType: 'civil' | 'criminal' | 'corporate' | 'family' | 'immigration' | 'other';
      status?: 'active' | 'pending' | 'closed' | 'archived';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      assignedToId?: string;
      filingDate?: string;
      nextHearingDate?: string;
    }) => apiRequest('/law/cases', { method: 'POST', body: data }),

    update: (id: string, data: Partial<{
      title: string;
      description: string;
      clientId: string;
      caseType: string;
      status: string;
      priority: string;
      assignedToId: string;
      filingDate: string;
      nextHearingDate: string;
      closingDate: string;
    }>) => apiRequest(`/law/cases/${id}`, { method: 'PATCH', body: data }),

    delete: (id: string) => apiRequest(`/law/cases/${id}`, { method: 'DELETE' }),
  },

  // ========= CLIENTS ========= //
  clients: {
    list: (params?: {
      q?: string;
      clientType?: 'individual' | 'corporate';
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
      return apiRequest(`/law/clients${queryString}`);
    },

    get: (id: string) => apiRequest(`/law/clients/${id}`),

    create: (data: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      address?: string;
      city?: string;
      country?: string;
      clientType: 'individual' | 'corporate';
      tags?: string[];
      notes?: string;
    }) => apiRequest('/law/clients', { method: 'POST', body: data }),

    update: (id: string, data: Partial<{
      name: string;
      email: string;
      phone: string;
      company: string;
      address: string;
      city: string;
      country: string;
      clientType: string;
      tags: string[];
      notes: string;
    }>) => apiRequest(`/law/clients/${id}`, { method: 'PATCH', body: data }),

    delete: (id: string) => apiRequest(`/law/clients/${id}`, { method: 'DELETE' }),
  },

  // ========= DOCUMENTS ========= //
  documents: {
    list: (params?: {
      q?: string;
      caseId?: string;
      fileType?: string;
      documentType?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
      return apiRequest(`/law/documents${queryString}`);
    },

    get: (id: string) => apiRequest(`/law/documents/${id}`),

    upload: async (file: File, metadata: {
      caseId?: string;
      documentType?: string;
      description?: string;
      tags?: string[];
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata.caseId) formData.append('caseId', metadata.caseId);
      if (metadata.documentType) formData.append('documentType', metadata.documentType);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));

      const response = await fetch(`${API_BASE_URL}/law/documents/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    },

    update: (id: string, data: Partial<{
      description: string;
      tags: string[];
      documentType: string;
    }>) => apiRequest(`/law/documents/${id}`, { method: 'PATCH', body: data }),

    delete: (id: string) => apiRequest(`/law/documents/${id}`, { method: 'DELETE' }),

    getDownloadUrl: (id: string) => apiRequest(`/law/documents/${id}/download`),
  },

  // ========= TASKS ========= //
  tasks: {
    list: (params?: {
      q?: string;
      status?: string;
      priority?: string;
      caseId?: string;
      assignedToId?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
      return apiRequest(`/law/tasks${queryString}`);
    },

    get: (id: string) => apiRequest(`/law/tasks/${id}`),

    create: (data: {
      title: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      status?: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
      dueDate?: string;
      caseId?: string;
      assignedToId?: string;
      boardColumn?: 'todo' | 'in_progress' | 'review' | 'done';
      boardOrder?: number;
    }) => apiRequest('/law/tasks', { method: 'POST', body: data }),

    update: (id: string, data: Partial<{
      title: string;
      description: string;
      priority: string;
      status: string;
      dueDate: string;
      caseId: string;
      assignedToId: string;
      boardColumn: string;
      boardOrder: number;
      completedDate: string;
    }>) => apiRequest(`/law/tasks/${id}`, { method: 'PATCH', body: data }),

    move: (id: string, data: {
      boardColumn: 'todo' | 'in_progress' | 'review' | 'done';
      boardOrder: number;
    }) => apiRequest(`/law/tasks/${id}/move`, { method: 'PATCH', body: data }),

    delete: (id: string) => apiRequest(`/law/tasks/${id}`, { method: 'DELETE' }),
  },

  // ========= EVENTS ========= //
  events: {
    list: (params?: {
      q?: string;
      eventType?: string;
      caseId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
      return apiRequest(`/law/events${queryString}`);
    },

    getCalendar: (startDate: string, endDate: string) => {
      return apiRequest(`/law/events/calendar?startDate=${startDate}&endDate=${endDate}`);
    },

    get: (id: string) => apiRequest(`/law/events/${id}`),

    create: (data: {
      title: string;
      description?: string;
      eventType: 'hearing' | 'meeting' | 'deadline' | 'submission' | 'consultation';
      eventDate: string;
      duration?: number;
      location?: string;
      caseId?: string;
      attendeeIds?: string[];
      status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    }) => apiRequest('/law/events', { method: 'POST', body: data }),

    update: (id: string, data: Partial<{
      title: string;
      description: string;
      eventType: string;
      eventDate: string;
      duration: number;
      location: string;
      caseId: string;
      attendeeIds: string[];
      status: string;
    }>) => apiRequest(`/law/events/${id}`, { method: 'PATCH', body: data }),

    delete: (id: string) => apiRequest(`/law/events/${id}`, { method: 'DELETE' }),
  },

  // ========= INVOICES ========= //
  invoices: {
    list: (params?: {
      q?: string;
      status?: string;
      caseId?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
      return apiRequest(`/law/invoices${queryString}`);
    },

    get: (id: string) => apiRequest(`/law/invoices/${id}`),

    create: (data: {
      clientName: string;
      caseId?: string;
      amount: number;
      currency?: string;
      taxRate?: number;
      totalAmount: number;
      billableHours?: number;
      hourlyRate?: number;
      description?: string;
      status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
      dueDate?: string;
    }) => apiRequest('/law/invoices', { method: 'POST', body: data }),

    update: (id: string, data: Partial<{
      clientName: string;
      caseId: string;
      amount: number;
      currency: string;
      taxRate: number;
      totalAmount: number;
      billableHours: number;
      hourlyRate: number;
      description: string;
      status: string;
      dueDate: string;
    }>) => apiRequest(`/law/invoices/${id}`, { method: 'PATCH', body: data }),

    delete: (id: string) => apiRequest(`/law/invoices/${id}`, { method: 'DELETE' }),

    markAsSent: (id: string) => apiRequest(`/law/invoices/${id}/send`, { method: 'POST' }),

    markAsPaid: (id: string) => apiRequest(`/law/invoices/${id}/paid`, { method: 'POST' }),
  },
};
