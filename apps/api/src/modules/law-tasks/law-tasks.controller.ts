import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LawTasksService } from './law-tasks.service';
import { CreateLawTaskDto } from './dtos/create-law-task.dto';
import { UpdateLawTaskDto } from './dtos/update-law-task.dto';
import { MoveTaskDto } from './dtos/move-task.dto';
import { OrgGuard } from '../../auth/org.guard';

@UseGuards(OrgGuard)
@Controller('law/tasks')
export class LawTasksController {
  constructor(private readonly service: LawTasksService) {}

  @Get()
  list(@Req() req: any, @Query('q') q?: string, @Query('status') status?: string, @Query('priority') priority?: string,
    @Query('caseId') caseId?: string, @Query('assignedToId') assignedToId?: string, @Query('limit') limit?: string,
    @Query('page') page?: string, @Query('offset') offset?: string, @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc') {
    return this.service.list(req.ownerUid, req.organizationId, {
      q, status, priority, caseId, assignedToId,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      offset: offset ? Number(offset) : undefined,
      sortBy, sortOrder,
    });
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.service.get(req.ownerUid, req.organizationId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateLawTaskDto) {
    return this.service.create(req.ownerUid, req.organizationId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLawTaskDto) {
    return this.service.update(req.ownerUid, req.organizationId, id, dto);
  }

  @Patch(':id/move')
  move(@Req() req: any, @Param('id') id: string, @Body() dto: MoveTaskDto) {
    return this.service.move(req.ownerUid, req.organizationId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.delete(req.ownerUid, req.organizationId, id);
  }
}
