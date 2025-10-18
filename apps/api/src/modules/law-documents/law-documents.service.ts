
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StorageService } from '../real-estate-properties/storage.service';
import { CreateLawDocumentDto } from './dtos/create-law-document.dto';
import { UpdateLawDocumentDto } from './dtos/update-law-document.dto';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

type ListQuery = {
  q?: string;
  caseId?: string;
  fileType?: string;
  documentType?: string;
  limit?: number;
  page?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class LawDocumentsService {
  private prisma = new PrismaClient();

  constructor(
    private readonly storage: StorageService,
  ) {}

  /**
   * List documents with pagination, search, and filters
   */
  async list(ownerUid: string, organizationId: string, query: ListQuery = {}) {
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const page = Math.max(1, Number(query.page || 1));
    const offset = query.offset !== undefined ? Number(query.offset) : (page - 1) * limit;
    const skip = Math.max(0, offset);

    // Build where clause
    const where: any = { ownerUid, organizationId };

    // Case filter
    if (query.caseId) {
      where.caseId = query.caseId;
    }

    // File type filter
    if (query.fileType) {
      where.fileType = query.fileType;
    }

    // Document type filter
    if (query.documentType && ['contract', 'brief', 'evidence', 'correspondence', 'other'].includes(query.documentType)) {
      where.documentType = query.documentType;
    }

    // Search query
    if (query.q) {
      where.OR = [
        { fileName: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: any[] = [{ createdAt: 'desc' }];
    const validSortFields = ['createdAt', 'updatedAt', 'fileName', 'fileSize', 'documentType'];
    if (query.sortBy && validSortFields.includes(query.sortBy)) {
      const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = [{ [query.sortBy]: sortOrder }];
    }

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.lawDocument.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.lawDocument.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        offset: skip,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get single document metadata
   */
  async get(ownerUid: string, organizationId: string, id: string) {
    const document = await this.prisma.lawDocument.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        case: true,
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  /**
   * Upload a document
   */
  async upload(
    ownerUid: string,
    organizationId: string,
    userId: string,
    file: Express.Multer.File,
    metadata: {
      caseId?: string;
      documentType?: string;
      description?: string;
      tags?: string[];
    },
  ) {
    // Verify case exists if provided
    if (metadata.caseId) {
      const caseExists = await this.prisma.lawCase.findFirst({
        where: {
          id: metadata.caseId,
          ownerUid,
          organizationId,
        },
      });

      if (!caseExists) {
        throw new BadRequestException('Case not found');
      }
    }

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      throw new BadRequestException(`File type ${ext} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Upload file to storage
    const key = `law/documents/${organizationId}/${Date.now()}_${file.originalname}`;
    const fileUrl = await this.storage.uploadPublic(key, file.buffer, file.mimetype);

    // Create document record
    const document = await this.prisma.lawDocument.create({
      data: {
        fileName: file.originalname,
        fileUrl,
        fileType: ext.replace('.', ''),
        fileSize: file.size,
        documentType: metadata.documentType || 'other',
        description: metadata.description,
        tags: metadata.tags || [],
        caseId: metadata.caseId,
        uploadedById: userId,
        ownerUid,
        organizationId,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return document;
  }

  /**
   * Update document metadata
   */
  async update(ownerUid: string, organizationId: string, id: string, dto: UpdateLawDocumentDto) {
    const existing = await this.prisma.lawDocument.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Document not found');
    }

    const data: any = {};
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.documentType !== undefined) data.documentType = dto.documentType;

    const updated = await this.prisma.lawDocument.update({
      where: { id },
      data,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete a document
   */
  async delete(ownerUid: string, organizationId: string, id: string) {
    const existing = await this.prisma.lawDocument.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Document not found');
    }

    // TODO: Delete file from storage
    // await this.storage.delete(existing.fileUrl);

    await this.prisma.lawDocument.delete({ where: { id } });

    return { success: true, id };
  }

  /**
   * Get document download URL
   */
  async getDownloadUrl(ownerUid: string, organizationId: string, id: string) {
    const document = await this.prisma.lawDocument.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // For now, return the fileUrl directly
    // In production, generate a signed/temporary URL
    return {
      url: document.fileUrl,
      fileName: document.fileName,
      fileSize: document.fileSize,
      fileType: document.fileType,
    };
  }
}
