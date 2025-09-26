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
import { ProductionProjectService } from './production-project.service';
import {
  CreateProductionProjectDto,
  UpdateProductionProjectDto,
  ProductionProjectListQueryDto,
} from './dto/production-project.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { ProductionPermissionsGuard } from './guards/production-permissions.guard';
import { OrganizationScopeMiddleware, AuthenticatedRequest } from '../auth/middleware/organization-scope.middleware';
import {
  CanCreateProject,
  CanReadProject,
  CanUpdateProject,
  CanDeleteProject,
  CanManageProject,
  ProductionReadAccess,
  ProductionWriteAccess,
} from './decorators/production-roles.decorator';

@Controller('production/projects')
@UseGuards(RoleGuard, ProductionPermissionsGuard)
export class ProductionProjectController {
  constructor(private readonly productionProjectService: ProductionProjectService) {}

  @Post()
  @CanCreateProject()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createDto: CreateProductionProjectDto,
  ) {
    const { organization } = req;

    const project = await this.productionProjectService.create(
      organization.ownerUserId,
      organization.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Production project created successfully',
      data: project,
    };
  }

  @Get()
  @CanReadProject()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ProductionProjectListQueryDto,
  ) {
    const { organization } = req;

    const result = await this.productionProjectService.findAll(
      organization.ownerUserId,
      organization.id,
      query,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Production projects retrieved successfully',
      data: result.projects,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get(':id')
  @CanReadProject()
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const project = await this.productionProjectService.findOne(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Production project retrieved successfully',
      data: project,
    };
  }

  @Patch(':id')
  @CanUpdateProject()
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductionProjectDto,
  ) {
    const { organization } = req;

    const project = await this.productionProjectService.update(
      organization.ownerUserId,
      organization.id,
      id,
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Production project updated successfully',
      data: project,
    };
  }

  @Delete(':id')
  @CanDeleteProject()
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const result = await this.productionProjectService.remove(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  @Get(':id/stats')
  @CanReadProject()
  async getProjectStats(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const stats = await this.productionProjectService.getProjectStats(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Project statistics retrieved successfully',
      data: stats,
    };
  }
}