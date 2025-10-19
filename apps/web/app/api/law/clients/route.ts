import { NextRequest, NextResponse } from 'next/server';
import type { Client, CreateClientInput } from '@/lib/types/law/client';

// Mock database - in-memory storage for demo
let mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1 (555) 100-1000',
    company: 'Acme Corp',
    status: 'active',
    tags: ['corporate', 'high-value'],
    assignedAttorney: {
      id: 'attorney-1',
      name: 'Sarah Williams',
      email: 'sarah.williams@lawfirm.com',
    },
    address: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    notes: 'Major corporate client with ongoing litigation needs',
    casesCount: 5,
    totalBilledAmount: 450000,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'John Anderson',
    email: 'john.anderson@email.com',
    phone: '+1 (555) 200-2000',
    status: 'active',
    tags: ['individual', 'vip'],
    assignedAttorney: {
      id: 'attorney-2',
      name: 'Robert Chen',
      email: 'robert.chen@lawfirm.com',
    },
    notes: 'Personal injury case - VIP client',
    casesCount: 2,
    totalBilledAmount: 75000,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z',
  },
  {
    id: '3',
    name: 'TechStart Inc',
    email: 'legal@techstart.io',
    phone: '+1 (555) 300-3000',
    company: 'TechStart Inc',
    status: 'lead',
    tags: ['corporate', 'referral'],
    assignedAttorney: {
      id: 'attorney-1',
      name: 'Sarah Williams',
      email: 'sarah.williams@lawfirm.com',
    },
    address: {
      street: '456 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
    },
    notes: 'Potential client - intellectual property matters',
    casesCount: 0,
    createdAt: '2024-01-22T08:00:00Z',
    updatedAt: '2024-01-22T08:00:00Z',
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /api/law/clients - List clients with filters
export async function GET(request: NextRequest) {
  await delay(500);

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const assignedAttorneyId = searchParams.get('assignedAttorneyId');
  const search = searchParams.get('search');
  const tags = searchParams.getAll('tags');

  let filtered = [...mockClients];

  // Apply filters
  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (assignedAttorneyId) {
    filtered = filtered.filter((c) => c.assignedAttorney.id === assignedAttorneyId);
  }
  if (tags.length > 0) {
    filtered = filtered.filter((c) => tags.some((tag) => c.tags.includes(tag as any)));
  }
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    clients: filtered,
    total: filtered.length,
  });
}

// POST /api/law/clients - Create new client
export async function POST(request: NextRequest) {
  await delay(700);

  try {
    const input: CreateClientInput = await request.json();

    if (!input.name || !input.assignedAttorneyId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      status: input.status || 'lead',
      tags: input.tags || [],
      assignedAttorney: {
        id: input.assignedAttorneyId,
        name: 'Attorney Name', // In real app, fetch from database
        email: 'attorney@lawfirm.com',
      },
      address: input.address,
      notes: input.notes,
      casesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockClients.push(newClient);

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
