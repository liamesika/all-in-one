import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import {
  CreateProductionFileAssetDto,
  UpdateProductionFileAssetDto,
  ProductionFileAssetResponseDto,
  ProductionFileAssetListQueryDto,
  FileUploadResponseDto,
  BulkFileUploadResponseDto,
} from './dto/production-file.dto';
import { S3, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductionFileService {
  private s3: S3;

  constructor(private prisma: PrismaService) {
    this.s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async uploadFile(
    ownerUid: string,
    organizationId: string,
    userId: string,
    file: Express.Multer.File,
    dto: CreateProductionFileAssetDto
  ): Promise<FileUploadResponseDto> {
    // Verify project exists and belongs to organization
    const project = await this.prisma.productionProject.findFirst({
      where: { id: dto.projectId, ownerUid, organizationId },
    });

    if (!project) {
      throw new NotFoundException('Production project not found');
    }

    try {
      // Generate unique file name
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = `${randomUUID()}.${fileExtension}`;
      const s3Key = `production/${organizationId}/${dto.projectId}/${dto.folder}/${uniqueFileName}`;

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3.send(uploadCommand);
      const uploadResult = {
        Location: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`
      };

      // Save file record to database
      const fileAsset = await this.prisma.productionFileAsset.create({
        data: {
          name: dto.name,
          folder: dto.folder,
          notes: dto.notes,
          url: uploadResult.Location,
          mimeType: file.mimetype,
          size: file.size,
          projectId: dto.projectId,
          ownerUid,
          organizationId,
          createdBy: userId,
        },
      });

      return {
        id: fileAsset.id,
        name: fileAsset.name,
        url: fileAsset.url,
        mimeType: fileAsset.mimeType!,
        size: fileAsset.size!,
        folder: fileAsset.folder,
        projectId: fileAsset.projectId,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async uploadMultipleFiles(
    ownerUid: string,
    organizationId: string,
    userId: string,
    files: Express.Multer.File[],
    dto: CreateProductionFileAssetDto
  ): Promise<BulkFileUploadResponseDto> {
    const uploaded: FileUploadResponseDto[] = [];
    const failed: { fileName: string; error: string }[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(ownerUid, organizationId, userId, file, {
          ...dto,
          name: file.originalname, // Use original filename for bulk uploads
        });
        uploaded.push(result);
      } catch (error) {
        failed.push({
          fileName: file.originalname,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    return {
      uploaded,
      failed,
      summary: {
        total: files.length,
        successful: uploaded.length,
        failed: failed.length,
      },
    };
  }

  async findAll(
    ownerUid: string,
    organizationId: string,
    query: ProductionFileAssetListQueryDto
  ): Promise<{ files: ProductionFileAssetResponseDto[]; total: number; page: number; limit: number }> {
    const {
      search,
      folder,
      projectId,
      createdBy,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where = {
      ownerUid,
      organizationId,
      ...(folder && { folder }),
      ...(projectId && { projectId }),
      ...(createdBy && { createdBy }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [files, total] = await Promise.all([
      this.prisma.productionFileAsset.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: {
            select: { id: true, fullName: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          }
        }
      }),
      this.prisma.productionFileAsset.count({ where })
    ]);

    return {
      files: files.map(file => this.mapToResponseDto(file)),
      total,
      page,
      limit: take
    };
  }

  async findOne(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<ProductionFileAssetResponseDto> {
    const file = await this.prisma.productionFileAsset.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.mapToResponseDto(file);
  }

  async update(
    ownerUid: string,
    organizationId: string,
    id: string,
    dto: UpdateProductionFileAssetDto
  ): Promise<ProductionFileAssetResponseDto> {
    const existingFile = await this.prisma.productionFileAsset.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existingFile) {
      throw new NotFoundException('File not found');
    }

    const file = await this.prisma.productionFileAsset.update({
      where: { id },
      data: dto,
      include: {
        creator: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    return this.mapToResponseDto(file);
  }

  async remove(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<{ message: string }> {
    const file = await this.prisma.productionFileAsset.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      // Extract S3 key from URL
      const urlParts = file.url.split('/');
      const bucketIndex = urlParts.findIndex(part => part.includes('amazonaws.com'));
      const s3Key = urlParts.slice(bucketIndex + 1).join('/');

      // Delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
      });
      await this.s3.send(deleteCommand);

      // Delete from database
      await this.prisma.productionFileAsset.delete({
        where: { id },
      });

      return { message: 'File deleted successfully' };
    } catch (error) {
      console.error('File deletion error:', error);

      // Delete from database even if S3 deletion fails
      await this.prisma.productionFileAsset.delete({
        where: { id },
      });

      return { message: 'File deleted from database (S3 deletion may have failed)' };
    }
  }

  async getProjectFiles(
    ownerUid: string,
    organizationId: string,
    projectId: string,
    folder?: string
  ): Promise<ProductionFileAssetResponseDto[]> {
    const files = await this.prisma.productionFileAsset.findMany({
      where: {
        projectId,
        ownerUid,
        organizationId,
        ...(folder && { folder }),
      },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { folder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return files.map(file => this.mapToResponseDto(file));
  }

  async generateSignedUrl(
    ownerUid: string,
    organizationId: string,
    id: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<{ signedUrl: string; expiresIn: number }> {
    const file = await this.prisma.productionFileAsset.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      // Extract S3 key from URL
      const urlParts = file.url.split('/');
      const bucketIndex = urlParts.findIndex(part => part.includes('amazonaws.com'));
      const s3Key = urlParts.slice(bucketIndex + 1).join('/');

      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
      });

      // For now, return the direct URL (in production, implement signed URLs)
      const signedUrl = file.url;

      return { signedUrl, expiresIn };
    } catch (error) {
      console.error('Signed URL generation error:', error);
      throw new BadRequestException('Failed to generate signed URL');
    }
  }

  async createNewVersion(
    ownerUid: string,
    organizationId: string,
    userId: string,
    id: string,
    file: Express.Multer.File
  ): Promise<ProductionFileAssetResponseDto> {
    const existingFile = await this.prisma.productionFileAsset.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existingFile) {
      throw new NotFoundException('File not found');
    }

    try {
      // Generate unique file name for new version
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = `${randomUUID()}.${fileExtension}`;
      const s3Key = `production/${organizationId}/${existingFile.projectId}/${existingFile.folder}/${uniqueFileName}`;

      // Upload new version to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3.send(uploadCommand);
      const uploadResult = {
        Location: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`
      };

      // Update file record with new version
      const updatedFile = await this.prisma.productionFileAsset.update({
        where: { id },
        data: {
          url: uploadResult.Location,
          mimeType: file.mimetype,
          size: file.size,
          version: existingFile.version + 1,
        },
        include: {
          creator: {
            select: { id: true, fullName: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          }
        }
      });

      return this.mapToResponseDto(updatedFile);
    } catch (error) {
      console.error('Version upload error:', error);
      throw new BadRequestException('Failed to upload new version');
    }
  }

  private mapToResponseDto(file: any): ProductionFileAssetResponseDto {
    return {
      id: file.id,
      name: file.name,
      folder: file.folder,
      url: file.url,
      version: file.version,
      notes: file.notes,
      mimeType: file.mimeType,
      size: file.size,
      projectId: file.projectId,
      ownerUid: file.ownerUid,
      organizationId: file.organizationId,
      createdBy: file.createdBy,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
      ...(file.creator && { creator: file.creator }),
      ...(file.project && { project: file.project }),
    };
  }
}