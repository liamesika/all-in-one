import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import {
  CreateProductionSupplierDto,
  UpdateProductionSupplierDto,
  ProductionSupplierResponseDto,
  ProductionSupplierListQueryDto,
  CreateProductionProjectSupplierDto,
  UpdateProductionProjectSupplierDto,
  ProductionProjectSupplierResponseDto,
} from './dto/production-supplier.dto';

@Injectable()
export class ProductionSupplierService {
  constructor(private prisma: PrismaService) {}

  // Supplier CRUD operations

  async createSupplier(
    ownerUid: string,
    organizationId: string,
    dto: CreateProductionSupplierDto
  ): Promise<ProductionSupplierResponseDto> {
    const supplier = await this.prisma.productionSupplier.create({
      data: {
        ...dto,
        ownerUid,
        organizationId,
      },
    });

    return this.mapSupplierToResponseDto(supplier);
  }

  async findAllSuppliers(
    ownerUid: string,
    organizationId: string,
    query: ProductionSupplierListQueryDto
  ): Promise<{ suppliers: ProductionSupplierResponseDto[]; total: number; page: number; limit: number }> {
    const {
      search,
      category,
      minRating,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where = {
      ownerUid,
      organizationId,
      ...(category && { category }),
      ...(minRating && { rating: { gte: minRating } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          { priceNotes: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [suppliers, total] = await Promise.all([
      this.prisma.productionSupplier.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              projects: true,
              budgetItems: true,
            }
          },
          budgetItems: {
            select: {
              planned: true,
              actual: true,
            }
          }
        }
      }),
      this.prisma.productionSupplier.count({ where })
    ]);

    const mappedSuppliers = suppliers.map(supplier => {
      const response = this.mapSupplierToResponseDto(supplier);

      // Add computed fields
      response.projectCount = supplier._count.projects;
      response.budgetItemCount = supplier._count.budgetItems;
      response.totalBudgetValue = supplier.budgetItems.reduce((sum, item) =>
        sum + Number(item.planned), 0
      );

      return response;
    });

    return {
      suppliers: mappedSuppliers,
      total,
      page,
      limit: take
    };
  }

  async findOneSupplier(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<ProductionSupplierResponseDto> {
    const supplier = await this.prisma.productionSupplier.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        _count: {
          select: {
            projects: true,
            budgetItems: true,
          }
        },
        budgetItems: {
          select: {
            planned: true,
            actual: true,
          }
        }
      }
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const response = this.mapSupplierToResponseDto(supplier);

    // Add computed fields
    response.projectCount = supplier._count.projects;
    response.budgetItemCount = supplier._count.budgetItems;
    response.totalBudgetValue = supplier.budgetItems.reduce((sum, item) =>
      sum + Number(item.planned), 0
    );

    return response;
  }

  async updateSupplier(
    ownerUid: string,
    organizationId: string,
    id: string,
    dto: UpdateProductionSupplierDto
  ): Promise<ProductionSupplierResponseDto> {
    const existingSupplier = await this.prisma.productionSupplier.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existingSupplier) {
      throw new NotFoundException('Supplier not found');
    }

    const supplier = await this.prisma.productionSupplier.update({
      where: { id },
      data: dto,
    });

    return this.mapSupplierToResponseDto(supplier);
  }

  async removeSupplier(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<{ message: string }> {
    const supplier = await this.prisma.productionSupplier.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        _count: {
          select: {
            projects: true,
            budgetItems: true,
          }
        }
      }
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check if supplier is being used in projects or budget items
    const hasReferences = supplier._count.projects > 0 || supplier._count.budgetItems > 0;

    if (hasReferences) {
      throw new BadRequestException(
        'Cannot delete supplier. It is referenced in existing projects or budget items.'
      );
    }

    await this.prisma.productionSupplier.delete({
      where: { id },
    });

    return { message: 'Supplier deleted successfully' };
  }

  // Project-Supplier relationship operations

  async addSupplierToProject(
    ownerUid: string,
    organizationId: string,
    dto: CreateProductionProjectSupplierDto
  ): Promise<ProductionProjectSupplierResponseDto> {
    // Verify project exists and belongs to organization
    const project = await this.prisma.productionProject.findFirst({
      where: { id: dto.projectId, ownerUid, organizationId },
    });

    if (!project) {
      throw new NotFoundException('Production project not found');
    }

    // Verify supplier exists and belongs to organization
    const supplier = await this.prisma.productionSupplier.findFirst({
      where: { id: dto.supplierId, ownerUid, organizationId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check if relationship already exists
    const existingRelation = await this.prisma.productionProjectSupplier.findFirst({
      where: {
        projectId: dto.projectId,
        supplierId: dto.supplierId,
        ownerUid,
        organizationId,
      },
    });

    if (existingRelation) {
      throw new BadRequestException('Supplier is already added to this project');
    }

    const projectSupplier = await this.prisma.productionProjectSupplier.create({
      data: {
        ...dto,
        ownerUid,
        organizationId,
      },
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        supplier: {
          select: { id: true, name: true, category: true, rating: true, contactInfo: true }
        }
      }
    });

    return this.mapProjectSupplierToResponseDto(projectSupplier);
  }

  async updateProjectSupplier(
    ownerUid: string,
    organizationId: string,
    id: string,
    dto: UpdateProductionProjectSupplierDto
  ): Promise<ProductionProjectSupplierResponseDto> {
    const existingRelation = await this.prisma.productionProjectSupplier.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existingRelation) {
      throw new NotFoundException('Project-supplier relationship not found');
    }

    const projectSupplier = await this.prisma.productionProjectSupplier.update({
      where: { id },
      data: dto,
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        supplier: {
          select: { id: true, name: true, category: true, rating: true, contactInfo: true }
        }
      }
    });

    return this.mapProjectSupplierToResponseDto(projectSupplier);
  }

  async removeSupplierFromProject(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<{ message: string }> {
    const projectSupplier = await this.prisma.productionProjectSupplier.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!projectSupplier) {
      throw new NotFoundException('Project-supplier relationship not found');
    }

    await this.prisma.productionProjectSupplier.delete({
      where: { id },
    });

    return { message: 'Supplier removed from project successfully' };
  }

  async getProjectSuppliers(
    ownerUid: string,
    organizationId: string,
    projectId: string
  ): Promise<ProductionProjectSupplierResponseDto[]> {
    const projectSuppliers = await this.prisma.productionProjectSupplier.findMany({
      where: { projectId, ownerUid, organizationId },
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        supplier: {
          select: { id: true, name: true, category: true, rating: true, contactInfo: true }
        }
      },
      orderBy: [
        { supplier: { category: 'asc' } },
        { supplier: { name: 'asc' } }
      ]
    });

    return projectSuppliers.map(ps => this.mapProjectSupplierToResponseDto(ps));
  }

  async getSupplierProjects(
    ownerUid: string,
    organizationId: string,
    supplierId: string
  ): Promise<ProductionProjectSupplierResponseDto[]> {
    const supplierProjects = await this.prisma.productionProjectSupplier.findMany({
      where: { supplierId, ownerUid, organizationId },
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        supplier: {
          select: { id: true, name: true, category: true, rating: true, contactInfo: true }
        }
      },
      orderBy: [
        { project: { status: 'asc' } },
        { project: { name: 'asc' } }
      ]
    });

    return supplierProjects.map(sp => this.mapProjectSupplierToResponseDto(sp));
  }

  // Helper methods

  private mapSupplierToResponseDto(supplier: any): ProductionSupplierResponseDto {
    return {
      id: supplier.id,
      name: supplier.name,
      category: supplier.category,
      rating: supplier.rating,
      notes: supplier.notes,
      priceNotes: supplier.priceNotes,
      contactInfo: supplier.contactInfo,
      ownerUid: supplier.ownerUid,
      organizationId: supplier.organizationId,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
    };
  }

  private mapProjectSupplierToResponseDto(projectSupplier: any): ProductionProjectSupplierResponseDto {
    return {
      id: projectSupplier.id,
      role: projectSupplier.role,
      projectId: projectSupplier.projectId,
      supplierId: projectSupplier.supplierId,
      ownerUid: projectSupplier.ownerUid,
      organizationId: projectSupplier.organizationId,
      createdAt: projectSupplier.createdAt.toISOString(),
      updatedAt: projectSupplier.updatedAt.toISOString(),
      ...(projectSupplier.project && { project: projectSupplier.project }),
      ...(projectSupplier.supplier && { supplier: projectSupplier.supplier }),
    };
  }
}