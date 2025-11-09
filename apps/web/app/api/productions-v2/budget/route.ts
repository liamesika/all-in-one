export const dynamic = 'force-dynamic';
/**
 * Productions Vertical - Budget API (v2)
 * Uses ProductionBudgetItem schema with organizationId field
 * GET: List budget items
 * POST: Create new budget item
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { BudgetCategory } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';

// Validation schema for creating a budget item
const createBudgetItemSchema = z.object({
  category: z.nativeEnum(BudgetCategory),
  planned: z.number().min(0, 'Planned amount must be positive'),
  actual: z.number().min(0, 'Actual amount must be positive').default(0),
  invoiceUrl: z.string().url().optional().nullable(),
  quoteUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  projectId: z.string().cuid('Invalid project ID'),
  supplierId: z.string().cuid().optional().nullable(),
});

/**
 * GET /api/productions-v2/budget
 * List budget items for a project
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to org
    const project = await prisma.productionProject.findFirst({
      where: { id: projectId, organizationId: orgId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const budgetItems = await prisma.productionBudgetItem.findMany({
      where: {
        projectId,
        organizationId: orgId,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(budgetItems);
  } catch (error: any) {
    console.error('[Productions V2 API] Error fetching budget items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget items', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/productions-v2/budget
 * Create a new budget item
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = createBudgetItemSchema.parse(body);

    // Verify project exists and belongs to org
    const project = await prisma.productionProject.findFirst({
      where: { id: validated.projectId, organizationId: orgId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify supplier exists if provided
    if (validated.supplierId) {
      const supplier = await prisma.productionSupplier.findFirst({
        where: { id: validated.supplierId, organizationId: orgId },
        select: { id: true },
      });

      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
    }

    const budgetItem = await prisma.productionBudgetItem.create({
      data: {
        ...validated,
        organizationId: orgId,
        ownerUid: user.uid,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(budgetItem, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions V2 API] Error creating budget item:', error);
    return NextResponse.json(
      { error: 'Failed to create budget item', details: error.message },
      { status: 500 }
    );
  }
});
