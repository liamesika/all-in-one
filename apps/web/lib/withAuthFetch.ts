import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  maxRetries?: number;
}

/**
 * Centralized authenticated fetch utility
 *
 * Features:
 * - Automatically injects fresh Firebase token with force refresh
 * - Retries on 401 with token refresh
 * - Auto-redirects to /login on auth failure with toast
 * - Prevents infinite retry loops
 *
 * Usage:
 * ```typescript
 * const response = await withAuthFetch('/api/law/clients', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 * const data = await response.json();
 * ```
 */
export async function withAuthFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, maxRetries = 1, ...fetchOptions } = options;

  // If skipAuth is true, make request without authentication
  if (skipAuth) {
    return fetch(url, fetchOptions);
  }

  // Wait for auth to be ready
  const user = auth.currentUser;
  if (!user) {
    // Not authenticated - redirect to login
    toast.error('Please sign in to continue');
    if (typeof window !== 'undefined') {
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?returnUrl=${returnUrl}`;
    }
    throw new Error('Not authenticated');
  }

  // Helper function to make the actual request
  const makeRequest = async (forceRefresh: boolean): Promise<Response> => {
    try {
      // Get token with optional force refresh
      const token = await user.getIdToken(forceRefresh);

      // Inject Authorization header
      const headers = new Headers(fetchOptions.headers);
      headers.set('Authorization', `Bearer ${token}`);

      // Make the request
      return await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (error: any) {
      // Token retrieval failed
      console.error('[withAuthFetch] Token error:', error);
      throw error;
    }
  };

  // Make initial request with force refresh to ensure token is fresh
  let response = await makeRequest(true);

  // If we get a 401 and we have retries left, try again with force refresh
  let retries = 0;
  while (response.status === 401 && retries < maxRetries) {
    console.warn(`[withAuthFetch] Got 401, retrying with fresh token (attempt ${retries + 1}/${maxRetries})`);
    retries++;

    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 300));

    // Retry with force refresh
    response = await makeRequest(true);
  }

  // If we still have a 401 after retries, redirect to login
  if (response.status === 401) {
    console.error('[withAuthFetch] Authentication failed after retries, redirecting to login');
    toast.error('Session expired. Please sign in again.');

    if (typeof window !== 'undefined') {
      const returnUrl = encodeURIComponent(window.location.pathname);
      // Small delay to show the toast
      setTimeout(() => {
        window.location.href = `/login?returnUrl=${returnUrl}`;
      }, 500);
    }

    throw new Error('Authentication failed');
  }

  return response;
}

/**
 * Convenience wrapper for JSON POST requests
 */
export async function authPost<T = any>(
  url: string,
  data: any,
  options: FetchOptions = {}
): Promise<T> {
  const response = await withAuthFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

/**
 * Convenience wrapper for JSON PUT requests
 */
export async function authPut<T = any>(
  url: string,
  data: any,
  options: FetchOptions = {}
): Promise<T> {
  const response = await withAuthFetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

/**
 * Convenience wrapper for JSON DELETE requests
 */
export async function authDelete<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await withAuthFetch(url, {
    method: 'DELETE',
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  // Some DELETE requests return 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Convenience wrapper for JSON GET requests
 */
export async function authGet<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await withAuthFetch(url, {
    method: 'GET',
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}
