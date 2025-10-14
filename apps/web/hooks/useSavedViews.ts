/**
 * useSavedViews Hook
 * Sprint A1 - Manage saved filter/sort views with shareable URLs
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface SavedView {
  id: string;
  name: string;
  page: string;
  vertical?: string;
  filters: Record<string, any>;
  sorts: Array<{ field: string; direction: 'asc' | 'desc' }>;
  isDefault: boolean;
  scope: 'user' | 'org';
  userId: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

interface UseSavedViewsOptions {
  page: string;
  vertical?: string;
  onViewApplied?: (view: SavedView) => void;
}

export function useSavedViews({ page, vertical, onViewApplied }: UseSavedViewsOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [views, setViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved views
  const fetchViews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (vertical) params.append('vertical', vertical);

      const response = await fetch(`/api/saved-views?${params}`);
      if (!response.ok) throw new Error('Failed to fetch saved views');

      const data = await response.json();
      setViews(data.views || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [page, vertical]);

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  // Check if URL has viewId param and apply it
  useEffect(() => {
    const viewId = searchParams.get('viewId');
    if (viewId && views.length > 0) {
      const view = views.find((v) => v.id === viewId);
      if (view && onViewApplied) {
        onViewApplied(view);
      }
    } else if (!viewId && views.length > 0) {
      // No viewId in URL - apply default view if exists
      const defaultView = views.find((v) => v.isDefault);
      if (defaultView && onViewApplied) {
        onViewApplied(defaultView);
      }
    }
  }, [searchParams, views, onViewApplied]);

  // Create a new saved view
  const createView = async (
    name: string,
    filters: Record<string, any>,
    sorts: Array<{ field: string; direction: 'asc' | 'desc' }>,
    options?: { isDefault?: boolean; scope?: 'user' | 'org' }
  ) => {
    try {
      const response = await fetch('/api/saved-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          page,
          vertical,
          filters,
          sorts,
          isDefault: options?.isDefault || false,
          scope: options?.scope || 'user',
        }),
      });

      if (!response.ok) throw new Error('Failed to create saved view');

      const data = await response.json();
      await fetchViews(); // Refresh list
      return data.view as SavedView;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Update an existing saved view
  const updateView = async (
    viewId: string,
    updates: {
      name?: string;
      filters?: Record<string, any>;
      sorts?: Array<{ field: string; direction: 'asc' | 'desc' }>;
      isDefault?: boolean;
    }
  ) => {
    try {
      const response = await fetch(`/api/saved-views/${viewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update saved view');

      const data = await response.json();
      await fetchViews(); // Refresh list
      return data.view as SavedView;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Delete a saved view
  const deleteView = async (viewId: string) => {
    try {
      const response = await fetch(`/api/saved-views/${viewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete saved view');

      await fetchViews(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Apply a view (sets URL param and triggers callback)
  const applyView = (view: SavedView) => {
    const params = new URLSearchParams(window.location.search);
    params.set('viewId', view.id);
    router.push(`?${params.toString()}`);
    if (onViewApplied) {
      onViewApplied(view);
    }
  };

  // Clear view (remove viewId from URL)
  const clearView = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('viewId');
    router.push(`?${params.toString()}`);
  };

  // Get shareable URL for a view
  const getShareableUrl = (viewId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('viewId', viewId);
    return url.toString();
  };

  return {
    views,
    loading,
    error,
    createView,
    updateView,
    deleteView,
    applyView,
    clearView,
    getShareableUrl,
    refetch: fetchViews,
  };
}
