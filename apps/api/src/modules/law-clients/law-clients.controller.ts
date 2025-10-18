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
import { LawClientsService } from './law-clients.service';
import { CreateLawClientDto } from './dtos/create-law-client.dto';
import { UpdateLawClientDto } from './dtos/update-law-client.dto';
import { OrgGuard } from '../../auth/org.guard';

@UseGuards(OrgGuard)
@Controller('law/clients')
export class LawClientsController {
  constructor(private readonly service: LawClientsService) {}

  @Get()
  list(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('clientType') clientType?: string,
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
      clientType,
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

  @Post()
  create(@Req() req: any, @Body() dto: CreateLawClientDto) {
    const ownerUid = req.ownerUid;
    const organizationId = req.organizationId;
    return this.service.create(ownerUid, organizationId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLawClientDto) {
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
