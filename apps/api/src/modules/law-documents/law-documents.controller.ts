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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LawDocumentsService } from './law-documents.service';
import { UpdateLawDocumentDto } from './dtos/update-law-document.dto';
import { OrgGuard } from '../../auth/org.guard';

@UseGuards(OrgGuard)
@Controller('law/documents')
export class LawDocumentsController {
  constructor(private readonly service: LawDocumentsService) {}

  @Get()
  list(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('caseId') caseId?: string,
    @Query('fileType') fileType?: string,
    @Query('documentType') documentType?: string,
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
      caseId,
      fileType,
      documentType,
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

  @Get(':id/download')
  getDownloadUrl(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req.ownerUid;
    const organizationId = req.organizationId;
    return this.service.getDownloadUrl(ownerUid, organizationId, id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const ownerUid = req.ownerUid;
    const organizationId = req.organizationId;
    const userId = req.userId;

    const metadata = {
      caseId: body.caseId,
      documentType: body.documentType,
      description: body.description,
      tags: body.tags ? JSON.parse(body.tags) : undefined,
    };

    return this.service.upload(ownerUid, organizationId, userId, file, metadata);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLawDocumentDto) {
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
