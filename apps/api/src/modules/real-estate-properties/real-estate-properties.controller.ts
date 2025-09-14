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
  UploadedFile,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RealEstatePropertiesService } from './real-estate-properties.service';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { UpdatePropertyDto } from './dtos/update-property.dto';
import { OrgGuard } from '../../auth/org.guard';
import { PropertyImportService } from './property-import.service';

@UseGuards(OrgGuard)
@Controller('real-estate/properties')
export class RealEstatePropertiesController {
  constructor(
    private readonly svc: RealEstatePropertiesService,
    private readonly importService: PropertyImportService
  ) {}

  // GET /api/real-estate/properties?q=&status=&provider=&limit=&page=&sortBy=&sortOrder=
  @Get()
  list(
    @Req() req: any, 
    @Query('q') q?: string, 
    @Query('status') status?: string, 
    @Query('provider') provider?: string, 
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.list(ownerUid, { 
      q, 
      status, 
      provider, 
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      offset: offset ? Number(offset) : undefined,
      sortBy,
      sortOrder
    });
  }

  // GET /api/real-estate/properties/:id
  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.get(ownerUid, id);
  }

  // GET /api/real-estate/properties/public/:slug - public endpoint for property pages
  @Get('public/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.svc.getBySlug(slug);
  }

  // POST /api/real-estate/properties
  @Post()
  async create(@Req() req: any, @Body() dto: CreatePropertyDto) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.create(ownerUid, dto);
  }

  // PATCH /api/real-estate/properties/:id
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePropertyDto) {
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
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadPhotos(@Req() req: any, @Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    const ownerUid = req?.ownerUid || 'demo';
    if (!files?.length) throw new BadRequestException('No files uploaded');
    return this.svc.uploadAndAttachPhotos(ownerUid, id, files);
  }

  // IMPORT ENDPOINTS

  // POST /api/real-estate/properties/import/single-url
  @Post('import/single-url')
  async importSingleUrl(@Req() req: any, @Body() body: { url: string }) {
    const ownerUid = req?.ownerUid || 'demo';
    if (!body.url) {
      throw new BadRequestException('URL is required');
    }
    return this.importService.importSingleProperty(ownerUid, body.url);
  }

  // POST /api/real-estate/properties/import/bulk-urls
  @Post('import/bulk-urls')
  async importBulkUrls(@Req() req: any, @Body() body: { urls: string[]; updateExisting?: boolean }) {
    const ownerUid = req?.ownerUid || 'demo';
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      throw new BadRequestException('URLs array is required');
    }
    return this.importService.importBulkProperties(ownerUid, {
      urls: body.urls,
      updateExisting: body.updateExisting || false
    });
  }

  // POST /api/real-estate/properties/import/csv
  @Post('import/csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async importCsv(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const ownerUid = req?.ownerUid || 'demo';
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }
    
    // Parse CSV file
    const csvText = file.buffer.toString('utf-8');
    const rows = this.parseCsv(csvText);
    
    return this.importService.importBulkProperties(ownerUid, {
      csvData: rows,
      updateExisting: body.updateExisting === 'true'
    });
  }

  // GET /api/real-estate/properties/import/batches
  @Get('import/batches')
  async getImportBatches(@Req() req: any, @Query('limit') limit = '20') {
    const ownerUid = req?.ownerUid || 'demo';
    return this.importService.getImportBatches(ownerUid, Number(limit));
  }

  // GET /api/real-estate/properties/import/batches/:batchId
  @Get('import/batches/:batchId')
  async getImportBatch(@Req() req: any, @Param('batchId') batchId: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.importService.getImportBatch(ownerUid, batchId);
  }

  // POST /api/real-estate/properties/:id/sync
  @Post(':id/sync')
  async syncProperty(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req?.ownerUid || 'demo';
    
    // Get property with external URL
    const property = await this.svc.get(ownerUid, id);
    if (!property.externalUrl) {
      throw new BadRequestException('Property has no external URL to sync from');
    }
    
    // Re-import from the original URL
    return this.importService.importSingleProperty(ownerUid, property.externalUrl);
  }

  private parseCsv(csvText: string): any[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new BadRequestException('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        if (values[index]) {
          row[header] = values[index];
        }
      });
      
      rows.push(row);
    }

    return rows;
  }
}
