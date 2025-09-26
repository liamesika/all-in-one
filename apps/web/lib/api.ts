// apps/web/lib/api.ts
import { trackAPICall } from './performance';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

// Cache configuration
interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  skipCache?: boolean; // Skip caching entirely
}

// In-memory cache with TTL
class APICache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new APICache();

// Clean up cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => apiCache.cleanup(), 5 * 60 * 1000);
}

// Enhanced API fetch with performance tracking and caching
export async function apiFetch(
  path: string, 
  init: RequestInit = {},
  cacheConfig: CacheConfig = {}
) {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const method = init.method || 'GET';
  
  // Create cache key
  const cacheKey = cacheConfig.key || `${method}:${url}:${JSON.stringify(init.body)}`;
  
  // Check cache for GET requests
  if (method === 'GET' && !cacheConfig.skipCache) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Start performance tracking
  const tracker = trackAPICall(path, method);

  const headers = new Headers(init.headers || {});
  // תמיד שולחים org header (עד שיהיה חיבור ל-auth)
  if (!headers.has('x-org-id')) headers.set('x-org-id', 'demo');

  // אל תקבע Content-Type אם שולחים FormData
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(url, { ...init, headers, cache: 'no-store' });
    
    if (!res.ok) {
      tracker.finish(false, res.status);
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status} ${res.statusText} at ${url} :: ${text}`);
    }
    
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    
    // Cache successful GET requests
    if (method === 'GET' && !cacheConfig.skipCache) {
      const ttl = cacheConfig.ttl || (5 * 60 * 1000); // Default 5 minutes
      apiCache.set(cacheKey, data, ttl);
    }
    
    tracker.finish(true, res.status);
    return data;
  } catch (error) {
    tracker.finish(false);
    throw error;
  }
}

// Optimized API client with better request management
export class OptimizedAPIClient {
  private abortControllers = new Map<string, AbortController>();
  private requestQueue = new Map<string, Promise<any>>();

  // Cancel previous request and make new one
  async fetchWithCancel(path: string, init: RequestInit = {}, cacheConfig?: CacheConfig) {
    const key = `${init.method || 'GET'}:${path}`;
    
    // Cancel previous request
    const prevController = this.abortControllers.get(key);
    if (prevController) {
      prevController.abort();
    }
    
    // Create new controller
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    
    try {
      const result = await apiFetch(path, { 
        ...init, 
        signal: controller.signal 
      }, cacheConfig);
      
      this.abortControllers.delete(key);
      return result;
    } catch (error) {
      this.abortControllers.delete(key);
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      throw error;
    }
  }

  // Deduplicate identical requests
  async fetchWithDedup(path: string, init: RequestInit = {}, cacheConfig?: CacheConfig) {
    const key = `${init.method || 'GET'}:${path}:${JSON.stringify(init.body)}`;
    
    // Return existing request if in flight
    const existingRequest = this.requestQueue.get(key);
    if (existingRequest) {
      return existingRequest;
    }
    
    // Create new request
    const request = apiFetch(path, init, cacheConfig);
    this.requestQueue.set(key, request);
    
    try {
      const result = await request;
      this.requestQueue.delete(key);
      return result;
    } catch (error) {
      this.requestQueue.delete(key);
      throw error;
    }
  }

  // Batch multiple requests
  async batchRequests<T>(
    requests: Array<{
      path: string;
      init?: RequestInit;
      cacheConfig?: CacheConfig;
    }>
  ): Promise<T[]> {
    return Promise.all(
      requests.map(({ path, init, cacheConfig }) => 
        apiFetch(path, init, cacheConfig)
      )
    );
  }

  // Clean up
  cancelAllRequests() {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
    this.requestQueue.clear();
  }
}

// Global optimized client instance
export const apiClient = new OptimizedAPIClient();

// Utility functions for common patterns
export const ApiUtils = {
  // Get data with caching
  getCached: (path: string, ttl?: number) =>
    apiFetch(path, { method: 'GET' }, { ttl }),

  // Post data without caching
  post: (path: string, data: any) =>
    apiFetch(path, {
      method: 'POST',
      body: JSON.stringify(data),
    }, { skipCache: true }),

  // Put data and invalidate cache
  put: (path: string, data: any) => {
    apiCache.clear(); // Simple cache invalidation
    return apiFetch(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, { skipCache: true });
  },

  // Patch data and invalidate cache
  patch: (path: string, data: any) => {
    apiCache.clear(); // Simple cache invalidation
    return apiFetch(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, { skipCache: true });
  },

  // Delete data and invalidate cache
  delete: (path: string) => {
    apiCache.clear(); // Simple cache invalidation
    return apiFetch(path, { method: 'DELETE' }, { skipCache: true });
  },

  // Upload files
  upload: (path: string, files: FormData) =>
    apiFetch(path, {
      method: 'POST',
      body: files,
    }, { skipCache: true }),
};

// Organization-specific API methods
export const orgApi = {
  // Organization summary
  getSummary: (orgId: string) =>
    ApiUtils.getCached(`/organizations/${orgId}/summary`, 60000), // 1 minute cache

  // Members
  getMembers: (orgId: string) =>
    ApiUtils.getCached(`/organizations/${orgId}/users`, 30000), // 30 seconds cache

  updateMemberRole: (orgId: string, userId: string, role: string) =>
    ApiUtils.patch(`/organizations/${orgId}/users/${userId}`, { role }),

  removeMember: (orgId: string, userId: string) =>
    ApiUtils.delete(`/organizations/${orgId}/users/${userId}`),

  // Invites
  getInvites: (orgId: string) =>
    ApiUtils.getCached(`/organizations/${orgId}/invites`, 30000),

  sendInvite: (orgId: string, email: string, role: string) =>
    ApiUtils.post(`/organizations/${orgId}/invite`, { emails: [email], role }),

  resendInvite: (orgId: string, inviteId: string) =>
    ApiUtils.post(`/organizations/${orgId}/invites/${inviteId}/resend`, {}),

  revokeInvite: (orgId: string, inviteId: string) =>
    ApiUtils.delete(`/organizations/${orgId}/invites/${inviteId}`),

  // Domains
  getDomains: (orgId: string) =>
    ApiUtils.getCached(`/organizations/${orgId}/domains`, 60000),

  addDomain: (orgId: string, domain: string) =>
    ApiUtils.post(`/organizations/${orgId}/domains`, { domain }),

  verifyDomain: (orgId: string, domainId: string) =>
    ApiUtils.post(`/organizations/${orgId}/domains/${domainId}/verify`, {}),

  removeDomain: (orgId: string, domainId: string) =>
    ApiUtils.delete(`/organizations/${orgId}/domains/${domainId}`),

  // Billing
  getBillingSummary: (orgId: string) =>
    ApiUtils.getCached(`/organizations/${orgId}/billing/summary`, 300000), // 5 minutes cache

  // Audit logs
  getAuditLogs: (orgId: string, filters?: {
    type?: string;
    userId?: string;
    from?: string;
    to?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.set(key, String(value));
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiUtils.getCached(`/organizations/${orgId}/audit${query}`, 60000);
  },

  exportAuditLogs: (orgId: string, filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.set(key, String(value));
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/organizations/${orgId}/audit/export${query}`, {}, { skipCache: true });
  },
};

// User/auth API
export const userApi = {
  getMe: () =>
    ApiUtils.getCached('/auth/me', 60000),

  getMemberships: () =>
    ApiUtils.getCached('/organizations/me/memberships', 60000),

  setActiveOrg: (orgId: string) =>
    ApiUtils.post('/organizations/me/active-org', { orgId }),

  changePassword: (currentPassword: string, newPassword: string) =>
    ApiUtils.post('/auth/change-password', { currentPassword, newPassword }),
};

// Hook for React components to use optimized API
export function useOptimizedAPI() {
  return {
    fetch: apiFetch,
    client: apiClient,
    utils: ApiUtils,
    clearCache: () => apiCache.clear(),
  };
}
