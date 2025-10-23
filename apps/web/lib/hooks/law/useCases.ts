/**
 * React Query Hooks for Cases CRUD
 *
 * Provides optimistic updates, automatic refetching, and caching
 * for all case-related operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import type {
  Case,
  CaseFilters,
  CasesListResponse,
  CaseResponse,
  CaseDeleteResponse,
  CreateCaseInput,
  UpdateCaseInput,
} from '@/lib/types/law/case';
import { caseKeys } from '@/lib/types/law/case';

// ============================================================================
// API Functions
// ============================================================================

async function fetchCases(filters: CaseFilters = {}): Promise<CasesListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.status?.length) params.set('status', filters.status.join(','));
  if (filters.priority?.length) params.set('priority', filters.priority.join(','));
  if (filters.type?.length) params.set('type', filters.type.join(','));
  if (filters.assignedAttorneyId) params.set('attorneyId', filters.assignedAttorneyId);
  if (filters.clientId) params.set('clientId', filters.clientId);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.tags?.length) params.set('tags', filters.tags.join(','));

  const response = await fetch(`/api/law/cases?${params}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cases');
  }

  return response.json();
}

async function fetchCase(id: string): Promise<Case> {
  const response = await fetch(`/api/law/cases/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch case');
  }

  const data: CaseResponse = await response.json();
  return data.case;
}

async function createCase(input: CreateCaseInput): Promise<Case> {
  const startTime = Date.now();

  const response = await fetch('/api/law/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create case' }));
    throw new Error(error.message || 'Failed to create case');
  }

  const data: CaseResponse = await response.json();

  // Track analytics
  trackEventWithConsent('case_create', {
    source: 'cases_page',
    success: true,
    duration_ms: Date.now() - startTime,
    case_type: input.type,
    case_status: input.status,
  });

  return data.case;
}

async function updateCase(input: UpdateCaseInput): Promise<Case> {
  const startTime = Date.now();

  const response = await fetch(`/api/law/cases/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update case' }));
    throw new Error(error.message || 'Failed to update case');
  }

  const data: CaseResponse = await response.json();

  // Track analytics
  trackEventWithConsent('case_update', {
    source: 'cases_page',
    success: true,
    duration_ms: Date.now() - startTime,
    case_id: input.id,
  });

  return data.case;
}

async function deleteCase(id: string): Promise<void> {
  const startTime = Date.now();

  const response = await fetch(`/api/law/cases/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete case' }));
    throw new Error(error.message || 'Failed to delete case');
  }

  // Track analytics
  trackEventWithConsent('case_delete', {
    source: 'cases_page',
    success: true,
    duration_ms: Date.now() - startTime,
    case_id: id,
  });
}

// ============================================================================
// Query Hooks
// ============================================================================

export function useCases(filters: CaseFilters = {}) {
  return useQuery({
    queryKey: caseKeys.list(filters),
    queryFn: () => fetchCases(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => fetchCase(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

// ============================================================================
// Mutation Hooks with Optimistic Updates
// ============================================================================

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      // Invalidate all case lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create case:', error);
      trackEventWithConsent('case_create', {
        source: 'cases_page',
        success: false,
        error: error.message,
      });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCase,
    // Optimistic update
    onMutate: async (updatedCase) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: caseKeys.detail(updatedCase.id) });

      // Snapshot previous value
      const previousCase = queryClient.getQueryData(caseKeys.detail(updatedCase.id));

      // Optimistically update cache
      queryClient.setQueryData(caseKeys.detail(updatedCase.id), (old: Case | undefined) => {
        if (!old) return old;
        return { ...old, ...updatedCase, updatedAt: new Date().toISOString() };
      });

      return { previousCase };
    },
    onError: (error, updatedCase, context) => {
      // Rollback on error
      if (context?.previousCase) {
        queryClient.setQueryData(caseKeys.detail(updatedCase.id), context.previousCase);
      }
      console.error('Failed to update case:', error);
      trackEventWithConsent('case_update', {
        source: 'cases_page',
        success: false,
        error: error.message,
      });
    },
    onSettled: (data, error, updatedCase) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(updatedCase.id) });
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
    },
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCase,
    // Optimistic update
    onMutate: async (caseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: caseKeys.lists() });

      // Snapshot previous lists
      const previousLists = queryClient.getQueriesData({ queryKey: caseKeys.lists() });

      // Optimistically remove from all lists
      queryClient.setQueriesData({ queryKey: caseKeys.lists() }, (old: CasesListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          cases: old.cases.filter((c) => c.id !== caseId),
          total: old.total - 1,
        };
      });

      return { previousLists };
    },
    onError: (error, caseId, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to delete case:', error);
      trackEventWithConsent('case_delete', {
        source: 'cases_page',
        success: false,
        error: error.message,
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

export function usePrefetchCase(id: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: caseKeys.detail(id),
      queryFn: () => fetchCase(id),
      staleTime: 60000,
    });
  };
}
