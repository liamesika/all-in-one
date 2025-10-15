import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

type CampaignStatus = 'DRAFT' | 'READY' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'FAILED';
type CampaignPlatform = 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN';

interface Campaign {
  id: string;
  name: string;
  platform: CampaignPlatform;
  status: CampaignStatus;
  goal: string;
  budget?: number;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  createdAt: string;
}

// Fetch campaigns
export function useCampaigns(ownerUid: string) {
  return useQuery({
    queryKey: ['campaigns', ownerUid],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns?ownerUid=${ownerUid}`, {
        headers: { 'x-org-id': ownerUid },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      return response.json() as Promise<{ campaigns: Campaign[] }>;
    },
    staleTime: 30 * 1000,
  });
}

// Fetch single campaign
export function useCampaign(campaignId: string | null, ownerUid: string) {
  return useQuery({
    queryKey: ['campaign', campaignId, ownerUid],
    queryFn: async () => {
      if (!campaignId) return null;
      const response = await fetch(`/api/campaigns/${campaignId}?ownerUid=${ownerUid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }
      return response.json() as Promise<{ campaign: Campaign }>;
    },
    enabled: !!campaignId,
    staleTime: 60 * 1000,
  });
}

// Create campaign
export function useCreateCampaign(ownerUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: Partial<Campaign>) => {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...campaignData, ownerUid }),
      });
      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', ownerUid] });
      toast.success('Campaign created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create campaign');
    },
  });
}

// Activate campaign
export function useActivateCampaign(ownerUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      // Run pre-flight checks first
      const checkResponse = await fetch(`/api/campaigns/${campaignId}/preflight-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid }),
      });

      if (!checkResponse.ok) {
        const data = await checkResponse.json();
        throw new Error(data.message || 'Pre-flight check failed');
      }

      const checkData = await checkResponse.json();
      if (!checkData.canActivate) {
        throw new Error(checkData.issues.join('\n'));
      }

      // Activate the campaign
      const activateResponse = await fetch(`/api/campaigns/${campaignId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid }),
      });

      if (!activateResponse.ok) {
        const data = await activateResponse.json();
        throw new Error(data.message || 'Failed to activate campaign');
      }

      return activateResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', ownerUid] });
      toast.success('Campaign activated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate campaign');
    },
  });
}

// Pause campaign
export function usePauseCampaign(ownerUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/campaigns/${campaignId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to pause campaign');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', ownerUid] });
      toast.success('Campaign paused');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to pause campaign');
    },
  });
}

// Duplicate campaign
export function useDuplicateCampaign(ownerUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/campaigns/${campaignId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to duplicate campaign');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', ownerUid] });
      toast.success('Campaign duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate campaign');
    },
  });
}
