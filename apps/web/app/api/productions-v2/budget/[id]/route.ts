export const dynamic = 'force-dynamic';
/**
 * Productions Vertical - Budget Item Detail API (v2)
 * PATCH: Update budget item
 * DELETE: Delete budget item
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { BudgetCategory } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';

// Validation schema for updating a budget item
const updateBudgetItemSchema = z.object({
  category: z.nativeEnum(BudgetCategory).optional(),
  planned: z.number().min(0).optional(),
  actual: z.number().min(0).optional(),
  invoiceUrl: z.string().url().optional().nullable(),
  quoteUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  supplierId: z.string().cuid().optional().nullable(),
});

/**
 * PATCH /api/productions-v2/budget/[id]
 * Update a budget item
 */
export const PATCH = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = updateBudgetItemSchema.parse(body);

    // Verify budget item exists and belongs to org
    const existingItem = await prisma.productionBudgetItem.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Budget item not found' },
        { status: 404 }
      );
    }

    // Verify supplier exists if provided
    if (validated.supplierId !== undefined && validated.supplierId !== null) {
      const supplier = await prisma.productionSupplier.findFirst({
        where: { id: validated.supplierId, organizationId: orgId },
        select: { id: true },
      });

      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
    }

    const budgetItem = await prisma.productionBudgetItem.update({
      where: { id },
      data: validated,
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

    return NextResponse.json(budgetItem);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions V2 API] Error updating budget item:', error);
    return NextResponse.json(
      { error: 'Failed to update budget item', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/productions-v2/budget/[id]
 * Delete a budget item
 */
export const DELETE = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params;

    // Verify budget item exists and belongs to org
    const existingItem = await prisma.productionBudgetItem.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Budget item not found' },
        { status: 404 }
      );
    }

    // Delete budget item
    await prisma.productionBudgetItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Productions V2 API] Error deleting budget item:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget item', details: error.message },
      { status: 500 }
    );
  }
});
