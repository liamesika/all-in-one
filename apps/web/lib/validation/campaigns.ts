import { z } from 'zod';

// Campaign validation schemas
export const CreateCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255),
  platform: z.enum(['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN']),
  goal: z.enum(['TRAFFIC', 'CONVERSIONS', 'LEADS', 'BRAND_AWARENESS', 'REACH', 'ENGAGEMENT']),
  budget: z.number().positive('Budget must be positive').optional(),
  dailyBudget: z.number().positive('Daily budget must be positive').optional(),
  audience: z.record(z.any()).optional(), // Platform-specific audience config
  creative: z.record(z.any()).optional(), // Ads creative data
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  connectionId: z.string().optional(), // OAuth connection to use
});

export const UpdateCampaignSchema = CreateCampaignSchema.partial().extend({
  id: z.string().min(1, 'Campaign ID is required'),
  status: z.enum(['DRAFT', 'READY', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ARCHIVED', 'FAILED']).optional(),
});

export type CreateCampaignRequest = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignRequest = z.infer<typeof UpdateCampaignSchema>;

// Success response for campaign creation
export const CreateCampaignResponseSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  success: z.boolean().default(true),
});

export type CreateCampaignResponse = z.infer<typeof CreateCampaignResponseSchema>;

// Campaign list response
export const CampaignListResponseSchema = z.object({
  campaigns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    platform: z.string(),
    status: z.string(),
    goal: z.string(),
    budget: z.number().optional(),
    dailyBudget: z.number().optional(),
    spend: z.number(),
    clicks: z.number(),
    impressions: z.number(),
    conversions: z.number(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    connection: z.object({
      id: z.string(),
      platform: z.string(),
      status: z.string(),
      accountName: z.string().optional(),
    }).optional(),
    _count: z.object({
      leads: z.number(),
    }).optional(),
  })),
});

export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;