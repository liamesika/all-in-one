import { z } from 'zod';

export const OrgId = z.string().min(1);
export const Org = z.object({ id: OrgId, name: z.string(), plan: z.string().default('starter') });
export type Org = z.infer<typeof Org>;

export const JobStatus = z.enum(['PENDING','RUNNING','SUCCESS','FAILED','CANCELED']);
export const Job = z.object({
  id: z.string(),
  orgId: OrgId,
  type: z.enum(['zip2csv','dummy']),
  status: JobStatus,
  inputUrl: z.string().nullable(),
  outputUrl: z.string().nullable(),
  metrics: z.record(z.any()).optional(),
  createdAt: z.string()
});
export type Job = z.infer<typeof Job>;

export const Lead = z.object({
  id: z.string(),
  orgId: OrgId,
  source: z.string(),
  score: z.number().min(0).max(100).default(0),
  status: z.enum(['new','active','won','lost']).default('new'),
  createdAt: z.string()
});
export type Lead = z.infer<typeof Lead>;
