import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductionSupplierService } from './production-supplier.service';
import {
  CreateProductionSupplierDto,
  UpdateProductionSupplierDto,
  ProductionSupplierListQueryDto,
  CreateProductionProjectSupplierDto,
  UpdateProductionProjectSupplierDto,
} from './dto/production-supplier.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { ProductionPermissionsGuard } from './guards/production-permissions.guard';
import { AuthenticatedRequest } from '../auth/middleware/organization-scope.middleware';
import {
  RequireProductionPermission,
  PRODUCTION_PERMISSIONS,
} from './decorators/production-roles.decorator';

@Controller('production/suppliers')
@UseGuards(RoleGuard, ProductionPermissionsGuard)
export class ProductionSupplierController {
  constructor(private readonly productionSupplierService: ProductionSupplierService) {}

  // Supplier CRUD endpoints

  @Post()
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_CREATE)
  async createSupplier(
    @Req() req: AuthenticatedRequest,
    @Body() createDto: CreateProductionSupplierDto,
  ) {
    const { organization } = req;

    const supplier = await this.productionSupplierService.createSupplier(
      organization.ownerUserId,
      organization.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Supplier created successfully',
      data: supplier,
    };
  }

  @Get()
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_READ)
  async findAllSuppliers(
    @Req() req: AuthenticatedRequest,
    @Query() query: ProductionSupplierListQueryDto,
  ) {
    const { organization } = req;

    const result = await this.productionSupplierService.findAllSuppliers(
      organization.ownerUserId,
      organization.id,
      query,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Suppliers retrieved successfully',
      data: result.suppliers,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get(':id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_READ)
  async findOneSupplier(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const supplier = await this.productionSupplierService.findOneSupplier(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Supplier retrieved successfully',
      data: supplier,
    };
  }

  @Patch(':id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_UPDATE)
  async updateSupplier(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductionSupplierDto,
  ) {
    const { organization } = req;

    const supplier = await this.productionSupplierService.updateSupplier(
      organization.ownerUserId,
      organization.id,
      id,
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Supplier updated successfully',
      data: supplier,
    };
  }

  @Delete(':id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_DELETE)
  async removeSupplier(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const result = await this.productionSupplierService.removeSupplier(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  @Get(':id/projects')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_READ)
  async getSupplierProjects(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) supplierId: string,
  ) {
    const { organization } = req;

    const projects = await this.productionSupplierService.getSupplierProjects(
      organization.ownerUserId,
      organization.id,
      supplierId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Supplier projects retrieved successfully',
      data: projects,
    };
  }

  // Project-Supplier relationship endpoints

  @Post('project-relationships')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_CREATE)
  async addSupplierToProject(
    @Req() req: AuthenticatedRequest,
    @Body() createDto: CreateProductionProjectSupplierDto,
  ) {
    const { organization } = req;

    const projectSupplier = await this.productionSupplierService.addSupplierToProject(
      organization.ownerUserId,
      organization.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Supplier added to project successfully',
      data: projectSupplier,
    };
  }

  @Get('project/:projectId')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_READ)
  async getProjectSuppliers(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    const { organization } = req;

    const suppliers = await this.productionSupplierService.getProjectSuppliers(
      organization.ownerUserId,
      organization.id,
      projectId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Project suppliers retrieved successfully',
      data: suppliers,
    };
  }

  @Patch('project-relationships/:id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_UPDATE)
  async updateProjectSupplier(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductionProjectSupplierDto,
  ) {
    const { organization } = req;

    const projectSupplier = await this.productionSupplierService.updateProjectSupplier(
      organization.ownerUserId,
      organization.id,
      id,
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Project supplier relationship updated successfully',
      data: projectSupplier,
    };
  }

  @Delete('project-relationships/:id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.SUPPLIER_UPDATE)
  async removeSupplierFromProject(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const result = await this.productionSupplierService.removeSupplierFromProject(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }
}