import { NextRequest, NextResponse } from 'next/server';
import type { Case, CaseFilters, CreateCaseInput } from '@/lib/types/law/case';

// Mock database - in-memory storage for demo
let mockCases: Case[] = [
  {
    id: '1',
    caseNumber: 'CASE-2024-001',
    title: 'Smith vs. Johnson Property Dispute',
    description: 'Real estate boundary dispute between neighboring properties',
    type: 'litigation',
    status: 'active',
    priority: 'high',
    client: {
      id: 'client-1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
    },
    assignedAttorney: {
      id: 'attorney-1',
      name: 'Sarah Williams',
      email: 'sarah.williams@lawfirm.com',
    },
    filingDate: '2024-01-15',
    nextHearingDate: '2024-02-20',
    billingRate: 350,
    estimatedValue: 125000,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
  },
  {
    id: '2',
    caseNumber: 'CASE-2024-002',
    title: 'Davis Family Trust Formation',
    description: 'Establishing a comprehensive family trust for estate planning',
    type: 'corporate',
    status: 'pending',
    priority: 'medium',
    client: {
      id: 'client-2',
      name: 'Michael Davis',
      email: 'michael.davis@example.com',
      phone: '+1 (555) 234-5678',
    },
    assignedAttorney: {
      id: 'attorney-2',
      name: 'Robert Chen',
      email: 'robert.chen@lawfirm.com',
    },
    filingDate: '2024-01-20',
    billingRate: 400,
    estimatedValue: 250000,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
  },
  {
    id: '3',
    caseNumber: 'CASE-2024-003',
    title: 'Anderson Employment Discrimination',
    description: 'Workplace discrimination case involving wrongful termination',
    type: 'litigation',
    status: 'active',
    priority: 'urgent',
    client: {
      id: 'client-3',
      name: 'Emily Anderson',
      email: 'emily.anderson@example.com',
      phone: '+1 (555) 345-6789',
    },
    assignedAttorney: {
      id: 'attorney-1',
      name: 'Sarah Williams',
      email: 'sarah.williams@lawfirm.com',
    },
    filingDate: '2024-01-05',
    nextHearingDate: '2024-02-10',
    billingRate: 375,
    estimatedValue: 175000,
    createdAt: '2024-01-02T08:00:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /api/law/cases - List cases with filters
export async function GET(request: NextRequest) {
  await delay(500); // Simulate network latency

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  let filtered = [...mockCases];

  // Apply filters
  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (priority) {
    filtered = filtered.filter((c) => c.priority === priority);
  }
  if (type) {
    filtered = filtered.filter((c) => c.type === type);
  }
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.caseNumber.toLowerCase().includes(query) ||
        c.client.name.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    cases: filtered,
    total: filtered.length,
  });
}

// POST /api/law/cases - Create new case
export async function POST(request: NextRequest) {
  await delay(800); // Simulate network latency

  try {
    const input: CreateCaseInput = await request.json();

    // Validate required fields (basic validation)
    if (!input.title || !input.clientName || !input.assignedAttorneyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate new case
    const newCase: Case = {
      id: `case-${Date.now()}`,
      caseNumber: `CASE-${new Date().getFullYear()}-${String(mockCases.length + 1).padStart(3, '0')}`,
      title: input.title,
      description: input.description,
      type: input.type,
      status: input.status || 'pending',
      priority: input.priority || 'medium',
      client: {
        id: input.clientId || `client-${Date.now()}`,
        name: input.clientName,
        email: input.clientEmail,
        phone: input.clientPhone,
      },
      assignedAttorney: {
        id: input.assignedAttorneyId,
        name: 'Attorney Name', // In real app, fetch from database
        email: 'attorney@lawfirm.com',
      },
      filingDate: input.filingDate,
      nextHearingDate: input.nextHearingDate,
      billingRate: input.billingRate,
      estimatedValue: input.estimatedValue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCases.push(newCase);

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    console.error('Failed to create case:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
}
