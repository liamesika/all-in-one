import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { CreativeClientsService } from './services/creative-clients.service';
import { CreateCreativeClientDto } from './dto/create-creative-client.dto';
import { UpdateCreativeClientDto } from './dto/update-creative-client.dto';

@Controller('creative-clients')
export class CreativeClientsController {
  private readonly logger = new Logger(CreativeClientsController.name);

  constructor(private readonly clientsService: CreativeClientsService) {}

  /**
   * Extract auth context from request
   * In production, this would use a JWT guard and extract from token
   */
  private extractAuthContext(req: any): {
    organizationId: string;
    ownerUid: string;
    userId: string;
  } {
    // TODO: Replace with actual JWT extraction
    return {
      organizationId: req.headers['x-org-id'] || 'demo-org',
      ownerUid: req.headers['x-owner-uid'] || 'demo-user',
      userId: req.headers['x-user-id'] || 'demo-user',
    };
  }

  @Post()
  async create(@Body() dto: CreateCreativeClientDto, @Req() req: any) {
    const { organizationId, ownerUid, userId } = this.extractAuthContext(req);
    this.logger.log(`Creating creative client: ${dto.name}`);
    return this.clientsService.create(organizationId, ownerUid, userId, dto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Req() req: any = {},
  ) {
    const { organizationId, ownerUid } = this.extractAuthContext(req);

    const filters: any = {};
    if (search) filters.search = search;
    if (tags) filters.tags = tags.split(',');

    return this.clientsService.findAll(organizationId, ownerUid, filters);
  }

  @Get('statistics')
  async getStatistics(@Req() req: any) {
    const { organizationId, ownerUid } = this.extractAuthContext(req);
    return this.clientsService.getStatistics(organizationId, ownerUid);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const { organizationId, ownerUid } = this.extractAuthContext(req);
    return this.clientsService.findOne(id, organizationId, ownerUid);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCreativeClientDto,
    @Req() req: any,
  ) {
    const { organizationId, ownerUid, userId } = this.extractAuthContext(req);
    return this.clientsService.update(id, organizationId, ownerUid, userId, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const { organizationId, ownerUid, userId } = this.extractAuthContext(req);
    return this.clientsService.delete(id, organizationId, ownerUid, userId);
  }
}
