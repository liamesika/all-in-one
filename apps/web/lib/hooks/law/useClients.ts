import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackEventWithConsent } from '@/lib/analytics/consent';
import type {
  Client,
  ClientFilters,
  ClientsListResponse,
  CreateClientInput,
  UpdateClientInput,
  clientKeys,
} from '@/lib/types/law/client';

/**
 * React Query Hooks for Client Management
 * Features: Optimistic updates, error handling, analytics tracking
 */

// ============================================================================
// API Functions
// ============================================================================

async function fetchClients(filters: ClientFilters = {}): Promise<ClientsListResponse> {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.assignedAttorneyId) params.append('assignedAttorneyId', filters.assignedAttorneyId);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  if (filters.search) params.append('search', filters.search);
  if (filters.tags?.length) {
    filters.tags.forEach((tag) => params.append('tags', tag));
  }

  const response = await fetch(`/api/law/clients?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  return response.json();
}

async function fetchClient(id: string): Promise<{ client: Client }> {
  const response = await fetch(`/api/law/clients/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch client');
  }
  return response.json();
}

async function createClient(input: CreateClientInput): Promise<{ client: Client }> {
  const startTime = Date.now();

  const response = await fetch('/api/law/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create client');
  }

  const data = await response.json();

  // Track analytics
  trackEventWithConsent('law_client_create', {
    source: 'clients_page',
    success: true,
    duration_ms: Date.now() - startTime,
    client_status: input.status,
    attorney_id: input.assignedAttorneyId,
  });

  return data;
}

async function updateClient(input: UpdateClientInput): Promise<{ client: Client }> {
  const startTime = Date.now();

  const response = await fetch(`/api/law/clients/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update client');
  }

  const data = await response.json();

  // Track analytics
  trackEventWithConsent('law_client_update', {
    source: 'clients_page',
    success: true,
    duration_ms: Date.now() - startTime,
    client_id: input.id,
  });

  return data;
}

async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/law/clients/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete client');
  }

  // Track analytics
  trackEventWithConsent('law_client_delete', {
    source: 'clients_page',
    success: true,
    client_id: id,
  });
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch list of clients with optional filters
 */
export function useClients(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: ['law', 'clients', 'list', filters],
    queryFn: () => fetchClients(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch single client by ID
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: ['law', 'clients', 'detail', id],
    queryFn: () => fetchClient(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new client with optimistic update
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      // Invalidate all client lists
      queryClient.invalidateQueries({ queryKey: ['law', 'clients', 'list'] });
    },
    onError: (error) => {
      trackEventWithConsent('law_client_create', {
        source: 'clients_page',
        success: false,
        error: error.message,
      });
    },
  });
}

/**
 * Update client with optimistic update and rollback on error
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    // Optimistic update
    onMutate: async (updatedClient) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['law', 'clients', 'detail', updatedClient.id] });

      // Snapshot previous value
      const previousClient = queryClient.getQueryData([
        'law',
        'clients',
        'detail',
        updatedClient.id,
      ]);

      // Optimistically update cache
      queryClient.setQueryData(
        ['law', 'clients', 'detail', updatedClient.id],
        (old: { client: Client } | undefined) => {
          if (!old) return old;
          return {
            client: {
              ...old.client,
              ...updatedClient,
              updatedAt: new Date().toISOString(),
            },
          };
        }
      );

      return { previousClient };
    },
    onError: (error, updatedClient, context) => {
      // Rollback on error
      if (context?.previousClient) {
        queryClient.setQueryData(
          ['law', 'clients', 'detail', updatedClient.id],
          context.previousClient
        );
      }

      trackEventWithConsent('law_client_update', {
        source: 'clients_page',
        success: false,
        error: error.message,
        client_id: updatedClient.id,
      });
    },
    onSettled: (data, error, updatedClient) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['law', 'clients', 'detail', updatedClient.id] });
      queryClient.invalidateQueries({ queryKey: ['law', 'clients', 'list'] });
    },
  });
}

/**
 * Delete client with optimistic update
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    // Optimistic update
    onMutate: async (clientId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['law', 'clients', 'list'] });

      // Snapshot previous value
      const previousClients = queryClient.getQueriesData({ queryKey: ['law', 'clients', 'list'] });

      // Optimistically remove from all lists
      queryClient.setQueriesData({ queryKey: ['law', 'clients', 'list'] }, (old: any) => {
        if (!old?.clients) return old;
        return {
          ...old,
          clients: old.clients.filter((c: Client) => c.id !== clientId),
          total: old.total - 1,
        };
      });

      return { previousClients };
    },
    onError: (error, clientId, context) => {
      // Rollback on error
      if (context?.previousClients) {
        context.previousClients.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      trackEventWithConsent('law_client_delete', {
        source: 'clients_page',
        success: false,
        error: error.message,
        client_id: clientId,
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['law', 'clients', 'list'] });
    },
  });
}
