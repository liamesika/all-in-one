import { z } from 'zod';

/**
 * Client Management Types for Law CRM
 * Complete type system with Zod validation
 */

// ============================================================================
// Enums
// ============================================================================

export const clientStatusSchema = z.enum(['active', 'inactive', 'lead', 'archived']);
export type ClientStatus = z.infer<typeof clientStatusSchema>;

export const clientTagSchema = z.enum([
  'vip',
  'corporate',
  'individual',
  'government',
  'non-profit',
  'referral',
  'high-value',
]);
export type ClientTag = z.infer<typeof clientTagSchema>;

// ============================================================================
// Core Interfaces
// ============================================================================

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: ClientStatus;
  tags: ClientTag[];
  assignedAttorney: {
    id: string;
    name: string;
    email: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
  // Relationships
  casesCount: number;
  totalBilledAmount?: number;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ClientCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  filingDate: string;
  updatedAt: string;
}

export interface ClientDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
}

export interface ClientNote {
  id: string;
  content: string;
  isPrivate: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

// Create Client Schema
export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone number too long').optional().or(z.literal('')),
  company: z.string().max(100, 'Company name too long').optional().or(z.literal('')),
  status: clientStatusSchema.default('lead'),
  tags: z.array(clientTagSchema).default([]),
  assignedAttorneyId: z.string().min(1, 'Assigned attorney is required'),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  notes: z.string().max(2000, 'Notes too long').optional().or(z.literal('')),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

// Update Client Schema
export const updateClientSchema = createClientSchema.extend({
  id: z.string(),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// ============================================================================
// Filter & Sort Types
// ============================================================================

export interface ClientFilters {
  status?: ClientStatus;
  tags?: ClientTag[];
  assignedAttorneyId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type ClientSortField =
  | 'name'
  | 'company'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'casesCount';

export interface ClientSortOptions {
  field: ClientSortField;
  direction: 'asc' | 'desc';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ClientsListResponse {
  clients: Client[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ClientDetailResponse {
  client: Client;
  cases: ClientCase[];
  documents: ClientDocument[];
  notes: ClientNote[];
}

// ============================================================================
// React Query Keys
// ============================================================================

export const clientKeys = {
  all: ['law', 'clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: ClientFilters) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  cases: (clientId: string) => [...clientKeys.detail(clientId), 'cases'] as const,
  documents: (clientId: string) => [...clientKeys.detail(clientId), 'documents'] as const,
  notes: (clientId: string) => [...clientKeys.detail(clientId), 'notes'] as const,
};

// ============================================================================
// Display Helpers
// ============================================================================

export const clientStatusLabels: Record<ClientStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  lead: 'Lead',
  archived: 'Archived',
};

export const clientStatusColors: Record<
  ClientStatus,
  { bg: string; text: string; border: string }
> = {
  active: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  inactive: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
  lead: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  archived: {
    bg: 'bg-gray-100 dark:bg-gray-900',
    text: 'text-gray-500 dark:text-gray-500',
    border: 'border-gray-300 dark:border-gray-700',
  },
};

export const clientTagLabels: Record<ClientTag, string> = {
  vip: 'VIP',
  corporate: 'Corporate',
  individual: 'Individual',
  government: 'Government',
  'non-profit': 'Non-Profit',
  referral: 'Referral',
  'high-value': 'High Value',
};

export const clientTagColors: Record<ClientTag, { bg: string; text: string }> = {
  vip: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  corporate: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  individual: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
  },
  government: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-400',
  },
  'non-profit': {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-400',
  },
  referral: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  'high-value': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};
