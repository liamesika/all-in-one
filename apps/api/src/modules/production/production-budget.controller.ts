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
import { ProductionBudgetService } from './production-budget.service';
import {
  CreateProductionBudgetItemDto,
  UpdateProductionBudgetItemDto,
  ProductionBudgetListQueryDto,
} from './dto/production-budget.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { ProductionPermissionsGuard } from './guards/production-permissions.guard';
import { AuthenticatedRequest } from '../auth/middleware/organization-scope.middleware';
import {
  CanManageBudget,
  CanViewBudgetActuals,
  ProductionReadAccess,
  RequireProductionPermission,
  PRODUCTION_PERMISSIONS,
} from './decorators/production-roles.decorator';

@Controller('production/budget')
@UseGuards(RoleGuard, ProductionPermissionsGuard)
export class ProductionBudgetController {
  constructor(private readonly productionBudgetService: ProductionBudgetService) {}

  @Post()
  @CanManageBudget()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createDto: CreateProductionBudgetItemDto,
  ) {
    const { organization } = req;

    const budgetItem = await this.productionBudgetService.create(
      organization.ownerUserId,
      organization.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Budget item created successfully',
      data: budgetItem,
    };
  }

  @Get()
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.BUDGET_READ)
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ProductionBudgetListQueryDto,
  ) {
    const { organization } = req;

    const result = await this.productionBudgetService.findAll(
      organization.ownerUserId,
      organization.id,
      query,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Budget items retrieved successfully',
      data: result.budgetItems,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get('project/:projectId')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.BUDGET_READ)
  async getBudgetItemsByProject(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    const { organization } = req;

    const budgetItems = await this.productionBudgetService.getBudgetItemsByProject(
      organization.ownerUserId,
      organization.id,
      projectId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Project budget items retrieved successfully',
      data: budgetItems,
    };
  }

  @Get('project/:projectId/summary')
  @CanViewBudgetActuals()
  async getProjectBudgetSummary(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    const { organization } = req;

    const summary = await this.productionBudgetService.getProjectBudgetSummary(
      organization.ownerUserId,
      organization.id,
      projectId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Project budget summary retrieved successfully',
      data: summary,
    };
  }

  @Get(':id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.BUDGET_READ)
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const budgetItem = await this.productionBudgetService.findOne(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Budget item retrieved successfully',
      data: budgetItem,
    };
  }

  @Patch(':id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.BUDGET_UPDATE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductionBudgetItemDto,
  ) {
    const { organization } = req;

    const budgetItem = await this.productionBudgetService.update(
      organization.ownerUserId,
      organization.id,
      id,
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Budget item updated successfully',
      data: budgetItem,
    };
  }

  @Patch(':id/actual-cost')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.BUDGET_UPDATE)
  async updateActualCost(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { actualCost: number; invoiceUrl?: string },
  ) {
    const { organization } = req;

    const budgetItem = await this.productionBudgetService.updateActualCost(
      organization.ownerUserId,
      organization.id,
      id,
      body.actualCost,
      body.invoiceUrl,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Actual cost updated successfully',
      data: budgetItem,
    };
  }

  @Delete(':id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.BUDGET_DELETE)
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const result = await this.productionBudgetService.remove(
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