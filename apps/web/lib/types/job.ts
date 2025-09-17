import { z } from 'zod';

export const JobStatusEnum = z.enum(['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'COMPLETED']);
export type JobStatus = z.infer<typeof JobStatusEnum>;

export const JobSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  status: JobStatusEnum,
  createdAt: z.string().optional(),
  metrics: z.object({
    images: z.number().optional(),
  }).optional(),
  // Allow additional fields from the API response
  title: z.string().optional(),
  description: z.string().optional(),
  progress: z.number().optional(),
  completedAt: z.string().nullable().optional(),
  results: z.any().optional(),
  ownerUid: z.string().optional(),
  data: z.any().optional(),
});

export type Job = z.infer<typeof JobSchema>;

export const JobsResponseSchema = z.object({
  success: z.boolean(),
  jobs: z.array(JobSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    totalCount: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }).optional(),
});

export type JobsResponse = z.infer<typeof JobsResponseSchema>;

// Normalize function to handle different response shapes
export function normalizeJobsResponse(data: unknown): Job[] {
  try {
    // If it's already an array, validate and return
    if (Array.isArray(data)) {
      return z.array(JobSchema).parse(data);
    }

    // If it's an object with a jobs property, extract it
    if (data && typeof data === 'object' && 'jobs' in data) {
      const response = JobsResponseSchema.parse(data);
      return response.jobs;
    }

    // Log warning for unexpected format
    console.warn('Unexpected jobs response format:', data);
    return [];
  } catch (error) {
    console.error('Failed to normalize jobs response:', error);
    return [];
  }
}