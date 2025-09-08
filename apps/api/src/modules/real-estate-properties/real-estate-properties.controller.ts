// apps/api/src/modules/real-estate-properties/real-estate-properties.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RealEstatePropertiesService } from './real-estate-properties.service.js';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { OrgGuard } from '../../auth/org.guard';

@UseGuards(OrgGuard)
@Controller('real-estate/properties')
export class RealEstatePropertiesController {
  constructor(private readonly svc: RealEstatePropertiesService) {}

  // GET /api/real-estate/properties?q=&status=&limit=
  @Get()
  list(@Req() req: any, @Query('q') q?: string, @Query('status') status?: string, @Query('limit') limit = '100') {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.list(ownerUid, { q, status, limit: Number(limit) });
  }

  // GET /api/real-estate/properties/:id
  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.get(ownerUid, id);
  }

  // POST /api/real-estate/properties
  @Post()
  async create(@Req() req: any, @Body() dto: CreatePropertyDto) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.create(ownerUid, dto);
  }

  // PATCH /api/real-estate/properties/:id
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.update(ownerUid, id, dto);
  }

  // DELETE /api/real-estate/properties/:id
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.hardDelete(ownerUid, id);
  }

  // POST /api/real-estate/properties/:id/photos/upload  (multipart)
  @Post(':id/photos/upload')
  @UseInterceptors(
    FilesInterceptor('files', 12, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadPhotos(@Req() req: any, @Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    const ownerUid = req?.ownerUid || 'demo';
    if (!files?.length) throw new BadRequestException('No files uploaded');
    return this.svc.uploadAndAttachPhotos(ownerUid, id, files);
  }
}
