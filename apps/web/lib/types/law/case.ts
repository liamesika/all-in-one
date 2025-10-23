/**
 * Law Case Types & Schemas
 *
 * Comprehensive type definitions for case management
 * Includes Zod schemas for validation
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const CaseStatus = {
  ACTIVE: 'active',
  PENDING: 'pending',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
} as const;

export const CasePriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const CaseType = {
  LITIGATION: 'litigation',
  CORPORATE: 'corporate',
  FAMILY: 'family',
  CRIMINAL: 'criminal',
  REAL_ESTATE: 'real_estate',
  INTELLECTUAL_PROPERTY: 'intellectual_property',
  EMPLOYMENT: 'employment',
  IMMIGRATION: 'immigration',
  TAX: 'tax',
  OTHER: 'other',
} as const;

export type CaseStatusType = (typeof CaseStatus)[keyof typeof CaseStatus];
export type CasePriorityType = (typeof CasePriority)[keyof typeof CasePriority];
export type CaseTypeEnum = (typeof CaseType)[keyof typeof CaseType];

// ============================================================================
// Base Types
// ============================================================================

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface Attorney {
  id: string;
  name: string;
  email: string;
  specialty?: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CaseTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: CasePriorityType;
  assignedTo?: string;
}

export interface CaseNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  isPrivate: boolean;
}

export interface CaseTimeline {
  id: string;
  event: string;
  description?: string;
  date: string;
  type: 'filing' | 'hearing' | 'meeting' | 'deadline' | 'milestone' | 'other';
}

// ============================================================================
// Main Case Type
// ============================================================================

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;

  // Classification
  type: CaseTypeEnum;
  status: CaseStatusType;
  priority: CasePriorityType;

  // Parties
  client: Client;
  opposingParty?: string;
  assignedAttorney: Attorney;

  // Dates
  filingDate: string;
  closedDate?: string;
  nextHearingDate?: string;

  // Financial
  billingRate?: number;
  estimatedValue?: number;

  // Relationships
  documents?: CaseDocument[];
  tasks?: CaseTask[];
  notes?: CaseNote[];
  timeline?: CaseTimeline[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const caseStatusSchema = z.enum(['active', 'pending', 'closed', 'archived']);
export const casePrioritySchema = z.enum(['high', 'medium', 'low']);
export const caseTypeSchema = z.enum([
  'litigation',
  'corporate',
  'family',
  'criminal',
  'real_estate',
  'intellectual_property',
  'employment',
  'immigration',
  'tax',
  'other',
]);

export const clientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export const attorneySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Attorney name is required'),
  email: z.string().email('Valid email required'),
  specialty: z.string().optional(),
});

// Create Case Schema (for form validation)
export const createCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),

  type: caseTypeSchema,
  status: caseStatusSchema.default('pending'),
  priority: casePrioritySchema.default('medium'),

  clientId: z.string().min(1, 'Client is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  clientCompany: z.string().optional(),

  opposingParty: z.string().max(200).optional(),
  assignedAttorneyId: z.string().min(1, 'Assigned attorney is required'),

  filingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  nextHearingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().or(z.literal('')),

  billingRate: z.number().positive().optional(),
  estimatedValue: z.number().positive().optional(),

  tags: z.array(z.string()).optional(),
});

// Update Case Schema (partial of create schema)
export const updateCaseSchema = createCaseSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;

// ============================================================================
// Filter Types
// ============================================================================

export interface CaseFilters {
  search?: string;
  status?: CaseStatusType[];
  priority?: CasePriorityType[];
  type?: CaseTypeEnum[];
  assignedAttorneyId?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface CaseSortOptions {
  field: 'title' | 'caseNumber' | 'filingDate' | 'status' | 'priority' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface CasesListResponse {
  cases: Case[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CaseResponse {
  case: Case;
  success: boolean;
  message?: string;
}

export interface CaseDeleteResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Query Keys (for React Query)
// ============================================================================

export const caseKeys = {
  all: ['cases'] as const,
  lists: () => [...caseKeys.all, 'list'] as const,
  list: (filters: CaseFilters) => [...caseKeys.lists(), filters] as const,
  details: () => [...caseKeys.all, 'detail'] as const,
  detail: (id: string) => [...caseKeys.details(), id] as const,
  documents: (caseId: string) => [...caseKeys.detail(caseId), 'documents'] as const,
  tasks: (caseId: string) => [...caseKeys.detail(caseId), 'tasks'] as const,
  notes: (caseId: string) => [...caseKeys.detail(caseId), 'notes'] as const,
  timeline: (caseId: string) => [...caseKeys.detail(caseId), 'timeline'] as const,
};
