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
import { ProductionTaskService } from './production-task.service';
import {
  CreateProductionTaskDto,
  UpdateProductionTaskDto,
  AssignTaskDto,
  ProductionTaskListQueryDto,
} from './dto/production-task.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { ProductionPermissionsGuard } from './guards/production-permissions.guard';
import { AuthenticatedRequest } from '../auth/middleware/organization-scope.middleware';
import {
  CanCreateTask,
  CanReadProject,
  CanUpdateTask,
  CanAssignTask,
  CanUpdateAssignedTask,
  ProductionReadAccess,
  PRODUCTION_PERMISSIONS,
} from './decorators/production-roles.decorator';

@Controller('production/tasks')
@UseGuards(RoleGuard, ProductionPermissionsGuard)
export class ProductionTaskController {
  constructor(private readonly productionTaskService: ProductionTaskService) {}

  @Post()
  @CanCreateTask()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createDto: CreateProductionTaskDto,
  ) {
    const { organization } = req;

    const task = await this.productionTaskService.create(
      organization.ownerUserId,
      organization.id,
      createDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Production task created successfully',
      data: task,
    };
  }

  @Get()
  @CanReadProject()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ProductionTaskListQueryDto,
  ) {
    const { organization } = req;

    const result = await this.productionTaskService.findAll(
      organization.ownerUserId,
      organization.id,
      query,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Production tasks retrieved successfully',
      data: result.tasks,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get('my-tasks')
  @ProductionReadAccess()
  async getMyTasks(
    @Req() req: AuthenticatedRequest,
    @Query('includeCompleted') includeCompleted?: string,
  ) {
    const { organization, user } = req;

    const tasks = await this.productionTaskService.getMyTasks(
      organization.ownerUserId,
      organization.id,
      user.uid,
      includeCompleted === 'true',
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Your tasks retrieved successfully',
      data: tasks,
    };
  }

  @Get('overdue')
  @CanReadProject()
  async getOverdueTasks(@Req() req: AuthenticatedRequest) {
    const { organization } = req;

    const tasks = await this.productionTaskService.getOverdueTasks(
      organization.ownerUserId,
      organization.id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Overdue tasks retrieved successfully',
      data: tasks,
    };
  }

  @Get('project/:projectId')
  @CanReadProject()
  async getTasksByProject(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    const { organization } = req;

    const tasks = await this.productionTaskService.getTasksByProject(
      organization.ownerUserId,
      organization.id,
      projectId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Project tasks retrieved successfully',
      data: tasks,
    };
  }

  @Get(':id')
  @CanReadProject()
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const task = await this.productionTaskService.findOne(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Production task retrieved successfully',
      data: task,
    };
  }

  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductionTaskDto,
  ) {
    const { organization, user, membership } = req;

    // Check permissions - either has update permission OR can update assigned tasks
    const hasUpdatePermission = this.hasPermission(req, PRODUCTION_PERMISSIONS.TASK_UPDATE);
    const hasUpdateAssignedPermission = this.hasPermission(req, PRODUCTION_PERMISSIONS.TASK_UPDATE_ASSIGNED);

    if (!hasUpdatePermission && !hasUpdateAssignedPermission) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Insufficient permissions to update tasks',
      };
    }

    const task = await this.productionTaskService.update(
      organization.ownerUserId,
      organization.id,
      id,
      updateDto,
      hasUpdatePermission ? undefined : user.uid, // Pass user ID for permission checking if limited access
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Production task updated successfully',
      data: task,
    };
  }

  @Post(':id/assign')
  @CanAssignTask()
  async assignTask(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignTaskDto,
  ) {
    const { organization } = req;

    const task = await this.productionTaskService.assignTask(
      organization.ownerUserId,
      organization.id,
      id,
      assignDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Task assigned successfully',
      data: task,
    };
  }

  @Delete(':id')
  @CanUpdateTask()
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const result = await this.productionTaskService.remove(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  private hasPermission(req: AuthenticatedRequest, permission: string): boolean {
    // This is a simplified permission check
    // In a real implementation, you'd use the ProductionPermissionsGuard logic
    const userRole = req.membership?.role;

    // Simplified role-based permission check
    switch (userRole) {
      case 'OWNER':
      case 'ADMIN':
      case 'MANAGER':
        return true;
      case 'MEMBER':
        return permission === PRODUCTION_PERMISSIONS.TASK_UPDATE_ASSIGNED;
      default:
        return false;
    }
  }
}