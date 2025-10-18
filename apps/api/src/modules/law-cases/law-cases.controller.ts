import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LawCasesService } from './law-cases.service';
import { CreateLawCaseDto } from './dtos/create-law-case.dto';
import { UpdateLawCaseDto } from './dtos/update-law-case.dto';
import { OrgGuard } from '../../auth/org.guard';

@UseGuards(OrgGuard)
@Controller('law/cases')
export class LawCasesController {
  constructor(private readonly service: LawCasesService) {}

  @Get()
  list(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('caseType') caseType?: string,
    @Query('priority') priority?: string,
    @Query('clientId') clientId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const ownerUid = req.ownerUid;
    const organizationId = req.organizationId;

    return this.service.list(ownerUid, organizationId, {
      q,
      status,
      caseType,
      priority,
      clientId,
      assignedToId,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      offset: offset ? Number(offset) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req.ownerUid;
    const organizationId = req.organizationId;
    return this.service.get(ownerUid, organizationId, id);
  }

  @Get(':id/timeline')
  getTimeline(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req.ownerUid;
    const organizationId = req.organizationId;
    return this.service.getTimeline(ownerUid, organizationId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateLawCaseDto) {
    const ownerUid = req.ownerUid;
    const organizationId = req.organizationId;
    const userId = req.userId; // From OrgGuard
    return this.service.create(ownerUid, organizationId, userId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLawCaseDto) {
    const ownerUid = req.ownerUid;
    const organizationId = req.organizationId;
    return this.service.update(ownerUid, organizationId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req.ownerUid;
    const organizationId = req.organizationId;
    return this.service.delete(ownerUid, organizationId, id);
  }
}
