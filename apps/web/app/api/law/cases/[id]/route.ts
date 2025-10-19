import { NextRequest, NextResponse } from 'next/server';
import type { Case, UpdateCaseInput } from '@/lib/types/law/case';

// Mock database - same reference as in parent route
// In a real app, this would be a database query
const getMockCases = (): Case[] => {
  // This is a simplified approach. In production, use a proper database or state management
  return [];
};

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /api/law/cases/[id] - Get single case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(400);

  const { id } = await params;

  // Mock case data - in real app, fetch from database
  const mockCase: Case = {
    id,
    caseNumber: `CASE-2024-${id.padStart(3, '0')}`,
    title: 'Sample Legal Case',
    description: 'This is a sample case for demonstration purposes',
    type: 'litigation',
    status: 'active',
    priority: 'medium',
    client: {
      id: 'client-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
    },
    assignedAttorney: {
      id: 'attorney-1',
      name: 'Jane Attorney',
      email: 'jane@lawfirm.com',
    },
    filingDate: '2024-01-15',
    nextHearingDate: '2024-02-20',
    billingRate: 350,
    estimatedValue: 125000,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ case: mockCase });
}

// PATCH /api/law/cases/[id] - Update case
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(700);

  const { id } = await params;

  try {
    const input: UpdateCaseInput = await request.json();

    // Mock updated case
    const updatedCase: Case = {
      id,
      caseNumber: input.caseNumber || `CASE-2024-${id.padStart(3, '0')}`,
      title: input.title || 'Updated Case',
      description: input.description,
      type: input.type || 'litigation',
      status: input.status || 'active',
      priority: input.priority || 'medium',
      client: {
        id: input.clientId || 'client-1',
        name: input.clientName || 'Client Name',
        email: input.clientEmail,
        phone: input.clientPhone,
      },
      assignedAttorney: {
        id: input.assignedAttorneyId || 'attorney-1',
        name: 'Attorney Name',
        email: 'attorney@lawfirm.com',
      },
      filingDate: input.filingDate || '2024-01-15',
      nextHearingDate: input.nextHearingDate,
      closedDate: input.closedDate,
      billingRate: input.billingRate,
      estimatedValue: input.estimatedValue,
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ case: updatedCase });
  } catch (error) {
    console.error('Failed to update case:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}

// DELETE /api/law/cases/[id] - Delete case
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(600);

  const { id } = await params;

  // Simulate successful deletion
  return NextResponse.json({
    success: true,
    message: 'Case deleted successfully',
    id
  });
}
