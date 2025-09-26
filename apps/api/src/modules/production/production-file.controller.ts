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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Req,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductionFileService } from './production-file.service';
import {
  CreateProductionFileAssetDto,
  UpdateProductionFileAssetDto,
  ProductionFileAssetListQueryDto,
  FileFolder,
} from './dto/production-file.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { ProductionPermissionsGuard } from './guards/production-permissions.guard';
import { AuthenticatedRequest } from '../auth/middleware/organization-scope.middleware';
import {
  RequireProductionPermission,
  PRODUCTION_PERMISSIONS,
} from './decorators/production-roles.decorator';

@Controller('production/files')
@UseGuards(RoleGuard, ProductionPermissionsGuard)
export class ProductionFileController {
  constructor(private readonly productionFileService: ProductionFileService) {}

  // Single file upload
  @Post('upload')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.FILE_UPLOAD)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
      fileFilter: (req, file, cb) => {
        // Allow common file types for production assets
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/quicktime',
          'audio/mpeg',
          'audio/wav',
          'application/zip',
          'application/x-zip-compressed',
          'text/plain',
          'text/csv'
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`File type ${file.mimetype} not allowed`), false);
        }
      },
    })
  )
  async uploadFile(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any, // We'll parse this manually due to multipart form data
  ) {
    const { organization, user } = req;

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Parse the DTO from form data
    const dto: CreateProductionFileAssetDto = {
      name: body.name || file.originalname,
      folder: body.folder as FileFolder || FileFolder.OTHER,
      notes: body.notes,
      projectId: body.projectId,
    };

    if (!dto.projectId) {
      throw new BadRequestException('Project ID is required');
    }

    const result = await this.productionFileService.uploadFile(
      organization.ownerUserId,
      organization.id,
      user.uid,
      file,
      dto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: result.message,
      data: result,
    };
  }

  // Multiple files upload
  @Post('upload-multiple')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.FILE_UPLOAD)
  @UseInterceptors(
    FilesInterceptor('files', 10, { // Max 10 files at once
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/gif',
          'text/plain',
          'text/csv'
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`File type ${file.mimetype} not allowed`), false);
        }
      },
    })
  )
  async uploadMultipleFiles(
    @Req() req: AuthenticatedRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const { organization, user } = req;

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const dto: CreateProductionFileAssetDto = {
      name: '', // Will be overridden with file names
      folder: body.folder as FileFolder || FileFolder.OTHER,
      notes: body.notes,
      projectId: body.projectId,
    };

    if (!dto.projectId) {
      throw new BadRequestException('Project ID is required');
    }

    const result = await this.productionFileService.uploadMultipleFiles(
      organization.ownerUserId,
      organization.id,
      user.uid,
      files,
      dto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: `Uploaded ${result.summary.successful} files successfully (${result.summary.failed} failed)`,
      data: result,
    };
  }

  @Get()
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.FILE_READ)
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ProductionFileAssetListQueryDto,
  ) {
    const { organization } = req;

    const result = await this.productionFileService.findAll(
      organization.ownerUserId,
      organization.id,
      query,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Files retrieved successfully',
      data: result.files,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get('project/:projectId')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.FILE_READ)
  async getProjectFiles(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('folder') folder?: FileFolder,
  ) {
    const { organization } = req;

    const files = await this.productionFileService.getProjectFiles(
      organization.ownerUserId,
      organization.id,
      projectId,
      folder,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Project files retrieved successfully',
      data: files,
    };
  }

  @Get(':id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.FILE_READ)
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const file = await this.productionFileService.findOne(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'File retrieved successfully',
      data: file,
    };
  }

  @Get(':id/download-url')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.FILE_READ)
  async getDownloadUrl(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('expires', ParseIntPipe) expires: number = 3600,
  ) {
    const { organization } = req;

    // Limit expires to reasonable bounds (1 minute to 24 hours)
    const safeExpires = Math.max(60, Math.min(expires, 86400));

    const result = await this.productionFileService.generateSignedUrl(
      organization.ownerUserId,
      organization.id,
      id,
      safeExpires,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Download URL generated successfully',
      data: result,
    };
  }

  @Patch(':id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.FILE_UPLOAD)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductionFileAssetDto,
  ) {
    const { organization } = req;

    const file = await this.productionFileService.update(
      organization.ownerUserId,
      organization.id,
      id,
      updateDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'File updated successfully',
      data: file,
    };
  }

  @Post(':id/new-version')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.FILE_UPLOAD)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    })
  )
  async createNewVersion(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { organization, user } = req;

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const updatedFile = await this.productionFileService.createNewVersion(
      organization.ownerUserId,
      organization.id,
      user.uid,
      id,
      file,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'New file version uploaded successfully',
      data: updatedFile,
    };
  }

  @Delete(':id')
  @RequireProductionPermission(PRODUCTION_PERMISSIONS.FILE_DELETE)
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { organization } = req;

    const result = await this.productionFileService.remove(
      organization.ownerUserId,
      organization.id,
      id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }
}