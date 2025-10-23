import { NextRequest, NextResponse } from 'next/server';
import type { Client, UpdateClientInput } from '@/lib/types/law/client';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /api/law/clients/[id] - Get single client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(400);

  const { id } = await params;

  // Mock client data
  const mockClient: Client = {
    id,
    name: 'Sample Client',
    email: 'client@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Sample Corp',
    status: 'active',
    tags: ['corporate'],
    assignedAttorney: {
      id: 'attorney-1',
      name: 'Attorney Name',
      email: 'attorney@lawfirm.com',
    },
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    notes: 'Sample client notes',
    casesCount: 3,
    totalBilledAmount: 125000,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ client: mockClient });
}

// PATCH /api/law/clients/[id] - Update client
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(600);

  const { id } = await params;

  try {
    const input: UpdateClientInput = await request.json();

    const updatedClient: Client = {
      id,
      name: input.name || 'Updated Client',
      email: input.email,
      phone: input.phone,
      company: input.company,
      status: input.status || 'active',
      tags: input.tags || [],
      assignedAttorney: {
        id: input.assignedAttorneyId || 'attorney-1',
        name: 'Attorney Name',
        email: 'attorney@lawfirm.com',
      },
      address: input.address,
      notes: input.notes,
      casesCount: 3,
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error('Failed to update client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE /api/law/clients/[id] - Delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(500);

  const { id } = await params;

  return NextResponse.json({
    success: true,
    message: 'Client deleted successfully',
    id,
  });
}
