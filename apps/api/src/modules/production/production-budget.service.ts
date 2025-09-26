import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import {
  CreateProductionBudgetItemDto,
  UpdateProductionBudgetItemDto,
  ProductionBudgetItemResponseDto,
  ProductionBudgetListQueryDto,
  ProductionBudgetSummaryDto,
  BudgetCategory,
} from './dto/production-budget.dto';

@Injectable()
export class ProductionBudgetService {
  constructor(private prisma: PrismaService) {}

  async create(
    ownerUid: string,
    organizationId: string,
    dto: CreateProductionBudgetItemDto
  ): Promise<ProductionBudgetItemResponseDto> {
    // Verify project exists and belongs to organization
    const project = await this.prisma.productionProject.findFirst({
      where: { id: dto.projectId, ownerUid, organizationId },
    });

    if (!project) {
      throw new NotFoundException('Production project not found');
    }

    // Verify supplier exists and belongs to organization (if provided)
    if (dto.supplierId) {
      const supplier = await this.prisma.productionSupplier.findFirst({
        where: { id: dto.supplierId, ownerUid, organizationId },
      });

      if (!supplier) {
        throw new BadRequestException('Supplier not found');
      }
    }

    const budgetItem = await this.prisma.productionBudgetItem.create({
      data: {
        ...dto,
        ownerUid,
        organizationId,
        planned: dto.planned,
        actual: dto.actual || 0,
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true, category: true }
        }
      }
    });

    return this.mapToResponseDto(budgetItem);
  }

  async findAll(
    ownerUid: string,
    organizationId: string,
    query: ProductionBudgetListQueryDto
  ): Promise<{ budgetItems: ProductionBudgetItemResponseDto[]; total: number; page: number; limit: number }> {
    const {
      category,
      projectId,
      supplierId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where = {
      ownerUid,
      organizationId,
      ...(category && { category }),
      ...(projectId && { projectId }),
      ...(supplierId && { supplierId }),
    };

    const [budgetItems, total] = await Promise.all([
      this.prisma.productionBudgetItem.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: {
            select: { id: true, name: true }
          },
          supplier: {
            select: { id: true, name: true, category: true }
          }
        }
      }),
      this.prisma.productionBudgetItem.count({ where })
    ]);

    return {
      budgetItems: budgetItems.map(item => this.mapToResponseDto(item)),
      total,
      page,
      limit: take
    };
  }

  async findOne(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<ProductionBudgetItemResponseDto> {
    const budgetItem = await this.prisma.productionBudgetItem.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        project: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true, category: true }
        }
      }
    });

    if (!budgetItem) {
      throw new NotFoundException('Budget item not found');
    }

    return this.mapToResponseDto(budgetItem);
  }

  async update(
    ownerUid: string,
    organizationId: string,
    id: string,
    dto: UpdateProductionBudgetItemDto
  ): Promise<ProductionBudgetItemResponseDto> {
    // Check if budget item exists and belongs to user
    const existingItem = await this.prisma.productionBudgetItem.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existingItem) {
      throw new NotFoundException('Budget item not found');
    }

    // Verify supplier exists and belongs to organization (if provided)
    if (dto.supplierId) {
      const supplier = await this.prisma.productionSupplier.findFirst({
        where: { id: dto.supplierId, ownerUid, organizationId },
      });

      if (!supplier) {
        throw new BadRequestException('Supplier not found');
      }
    }

    const budgetItem = await this.prisma.productionBudgetItem.update({
      where: { id },
      data: dto,
      include: {
        project: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true, category: true }
        }
      }
    });

    return this.mapToResponseDto(budgetItem);
  }

  async remove(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<{ message: string }> {
    const budgetItem = await this.prisma.productionBudgetItem.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!budgetItem) {
      throw new NotFoundException('Budget item not found');
    }

    await this.prisma.productionBudgetItem.delete({
      where: { id },
    });

    return { message: 'Budget item deleted successfully' };
  }

  async getProjectBudgetSummary(
    ownerUid: string,
    organizationId: string,
    projectId: string
  ): Promise<ProductionBudgetSummaryDto> {
    // Verify project exists and belongs to user
    const project = await this.prisma.productionProject.findFirst({
      where: { id: projectId, ownerUid, organizationId },
    });

    if (!project) {
      throw new NotFoundException('Production project not found');
    }

    // Get all budget items for the project
    const budgetItems = await this.prisma.productionBudgetItem.findMany({
      where: { projectId, ownerUid, organizationId },
      include: {
        supplier: {
          select: { id: true, name: true }
        }
      }
    });

    // Calculate totals
    const totalPlanned = budgetItems.reduce((sum, item) => sum + Number(item.planned), 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + Number(item.actual), 0);
    const variance = totalActual - totalPlanned;
    const variancePercentage = totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0;

    // Category breakdown
    const categoryMap = new Map<BudgetCategory, { planned: number; actual: number }>();
    budgetItems.forEach(item => {
      const existing = categoryMap.get(item.category) || { planned: 0, actual: 0 };
      categoryMap.set(item.category, {
        planned: existing.planned + Number(item.planned),
        actual: existing.actual + Number(item.actual)
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, totals]) => ({
      category,
      planned: totals.planned,
      actual: totals.actual,
      variance: totals.actual - totals.planned
    }));

    // Supplier breakdown
    const supplierMap = new Map<string, {
      id: string;
      name: string;
      planned: number;
      actual: number;
      itemCount: number;
    }>();

    budgetItems.forEach(item => {
      if (item.supplier) {
        const existing = supplierMap.get(item.supplier.id) || {
          id: item.supplier.id,
          name: item.supplier.name,
          planned: 0,
          actual: 0,
          itemCount: 0
        };
        supplierMap.set(item.supplier.id, {
          ...existing,
          planned: existing.planned + Number(item.planned),
          actual: existing.actual + Number(item.actual),
          itemCount: existing.itemCount + 1
        });
      }
    });

    const supplierBreakdown = Array.from(supplierMap.values()).map(supplier => ({
      supplierId: supplier.id,
      supplierName: supplier.name,
      planned: supplier.planned,
      actual: supplier.actual,
      itemCount: supplier.itemCount
    }));

    return {
      projectId,
      totalPlanned,
      totalActual,
      variance,
      variancePercentage,
      categoryBreakdown,
      supplierBreakdown
    };
  }

  async getBudgetItemsByProject(
    ownerUid: string,
    organizationId: string,
    projectId: string
  ): Promise<ProductionBudgetItemResponseDto[]> {
    const budgetItems = await this.prisma.productionBudgetItem.findMany({
      where: { projectId, ownerUid, organizationId },
      include: {
        project: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true, category: true }
        }
      },
      orderBy: [
        { category: 'asc' },
        { planned: 'desc' }
      ]
    });

    return budgetItems.map(item => this.mapToResponseDto(item));
  }

  async updateActualCost(
    ownerUid: string,
    organizationId: string,
    id: string,
    actualCost: number,
    invoiceUrl?: string
  ): Promise<ProductionBudgetItemResponseDto> {
    const budgetItem = await this.prisma.productionBudgetItem.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!budgetItem) {
      throw new NotFoundException('Budget item not found');
    }

    const updatedItem = await this.prisma.productionBudgetItem.update({
      where: { id },
      data: {
        actual: actualCost,
        ...(invoiceUrl && { invoiceUrl })
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true, category: true }
        }
      }
    });

    return this.mapToResponseDto(updatedItem);
  }

  private mapToResponseDto(budgetItem: any): ProductionBudgetItemResponseDto {
    return {
      id: budgetItem.id,
      category: budgetItem.category,
      planned: Number(budgetItem.planned),
      actual: Number(budgetItem.actual),
      invoiceUrl: budgetItem.invoiceUrl,
      quoteUrl: budgetItem.quoteUrl,
      notes: budgetItem.notes,
      projectId: budgetItem.projectId,
      supplierId: budgetItem.supplierId,
      ownerUid: budgetItem.ownerUid,
      organizationId: budgetItem.organizationId,
      createdAt: budgetItem.createdAt.toISOString(),
      updatedAt: budgetItem.updatedAt.toISOString(),
      ...(budgetItem.project && { project: budgetItem.project }),
      ...(budgetItem.supplier && { supplier: budgetItem.supplier }),
    };
  }
}