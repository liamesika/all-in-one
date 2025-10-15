import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'HOT' | 'WARM' | 'COLD';
  source: string;
  notes?: string;
  propertyId?: string | null;
  createdAt: string;
}

interface LeadFilters {
  status?: string;
  source?: string;
  search?: string;
}

// Fetch leads with filters
export function useLeads(ownerUid: string, filters?: LeadFilters) {
  return useQuery({
    queryKey: ['leads', ownerUid, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        ownerUid,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.source && { source: filters.source }),
        ...(filters?.search && { search: filters.search }),
      });

      const response = await fetch(`/api/real-estate/leads?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      return response.json() as Promise<{ leads: Lead[] }>;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch single lead
export function useLead(leadId: string | null, ownerUid: string) {
  return useQuery({
    queryKey: ['lead', leadId, ownerUid],
    queryFn: async () => {
      if (!leadId) return null;
      const response = await fetch(`/api/real-estate/leads/${leadId}?ownerUid=${ownerUid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lead');
      }
      return response.json() as Promise<{ lead: Lead }>;
    },
    enabled: !!leadId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Create lead mutation
export function useCreateLead(ownerUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData: Partial<Lead>) => {
      const response = await fetch('/api/real-estate/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadData, ownerUid }),
      });
      if (!response.ok) {
        throw new Error('Failed to create lead');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate leads list to refetch
      queryClient.invalidateQueries({ queryKey: ['leads', ownerUid] });
      toast.success('Lead created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create lead');
    },
  });
}

// Update lead mutation
export function useUpdateLead(ownerUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, data }: { leadId: string; data: Partial<Lead> }) => {
      const response = await fetch(`/api/real-estate/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ownerUid }),
      });
      if (!response.ok) {
        throw new Error('Failed to update lead');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and single lead queries
      queryClient.invalidateQueries({ queryKey: ['leads', ownerUid] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId, ownerUid] });
      toast.success('Lead updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update lead');
    },
  });
}

// Delete lead mutation
export function useDeleteLead(ownerUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch(`/api/real-estate/leads/${leadId}?ownerUid=${ownerUid}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', ownerUid] });
      toast.success('Lead deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete lead');
    },
  });
}

// Bulk operations
export function useBulkUpdateLeads(ownerUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadIds, data }: { leadIds: string[]; data: Partial<Lead> }) => {
      const response = await fetch('/api/real-estate/leads/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds, data, ownerUid }),
      });
      if (!response.ok) {
        throw new Error('Failed to update leads');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', ownerUid] });
      toast.success('Leads updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update leads');
    },
  });
}
