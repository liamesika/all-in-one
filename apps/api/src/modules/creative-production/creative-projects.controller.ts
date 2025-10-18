// apps/api/src/modules/creative-production/creative-projects.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreativeProjectsService } from './services/creative-projects.service';
import {
  CreateCreativeProjectDto,
  UpdateCreativeProjectDto,
} from './dto/create-creative-project.dto';
import { CreativeProjectStatus } from '@prisma/client';

// Assuming you have authentication guards
// import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('creative-projects')
// @UseGuards(JwtAuthGuard)
export class CreativeProjectsController {
  constructor(
    private readonly projectsService: CreativeProjectsService,
  ) {}

  /**
   * Create new creative project
   * POST /creative-projects
   */
  @Post()
  async create(
    @Body() dto: CreateCreativeProjectDto,
    @Req() req: any,
  ) {
    const { orgId, ownerUid, userId } = this.extractAuthContext(req);

    return this.projectsService.create(orgId, ownerUid, userId, dto);
  }

  /**
   * Get all creative projects for organization
   * GET /creative-projects
   */
  @Get()
  async findAll(
    @Query('status') status?: CreativeProjectStatus,
    @Query('search') search?: string,
    @Req() req?: any,
  ) {
    const { orgId, ownerUid } = this.extractAuthContext(req);

    return this.projectsService.findAll(orgId, ownerUid, {
      status,
      search,
    });
  }

  /**
   * Get project statistics
   * GET /creative-projects/statistics
   */
  @Get('statistics')
  async getStatistics(@Req() req: any) {
    const { orgId, ownerUid } = this.extractAuthContext(req);

    return this.projectsService.getStatistics(orgId, ownerUid);
  }

  /**
   * Get single creative project
   * GET /creative-projects/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const { orgId, ownerUid } = this.extractAuthContext(req);

    return this.projectsService.findOne(id, orgId, ownerUid);
  }

  /**
   * Update creative project
   * PUT /creative-projects/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCreativeProjectDto,
    @Req() req: any,
  ) {
    const { orgId, ownerUid, userId } = this.extractAuthContext(req);

    return this.projectsService.update(id, orgId, ownerUid, userId, dto);
  }

  /**
   * Delete creative project
   * DELETE /creative-projects/:id
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const { orgId, ownerUid, userId } = this.extractAuthContext(req);

    await this.projectsService.delete(id, orgId, ownerUid, userId);

    return { message: 'Project deleted successfully' };
  }

  /**
   * Extract authentication context from request
   * TODO: Replace with actual auth implementation
   */
  private extractAuthContext(req: any): {
    orgId: string;
    ownerUid: string;
    userId: string;
  } {
    // Placeholder - replace with actual auth logic
    return {
      orgId: req.user?.orgId || req.headers['x-org-id'],
      ownerUid: req.user?.ownerUid || req.headers['x-owner-uid'],
      userId: req.user?.id || req.headers['x-user-id'],
    };
  }
}
