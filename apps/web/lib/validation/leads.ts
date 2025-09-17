import { z } from 'zod';

// Lead validation schemas
export const CreateLeadSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  source: z.enum(['FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'CSV_UPLOAD', 'GOOGLE_SHEETS', 'MANUAL', 'OTHER']).default('MANUAL'),
  sourceName: z.string().max(100).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'MEETING', 'OFFER', 'DEAL', 'WON', 'LOST']).default('NEW'),
  score: z.enum(['HOT', 'WARM', 'COLD']).default('COLD'),
  budget: z.number().positive().optional(),
  interests: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  // UTM parameters
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),
  // Campaign association
  campaignId: z.string().optional(),
  platformAdSetId: z.string().max(100).optional(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial().extend({
  id: z.string().min(1, 'Lead ID is required'),
});

export type CreateLeadRequest = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadRequest = z.infer<typeof UpdateLeadSchema>;

// Standard error response shape
export const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Success response for lead creation
export const CreateLeadResponseSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  success: z.boolean().default(true),
});

export type CreateLeadResponse = z.infer<typeof CreateLeadResponseSchema>;