import { Controller, Post, UseInterceptors, UploadedFile, Headers, Query, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { existsSync, mkdirSync, statSync } from 'fs';
import { JobsService } from '../jobs/jobs.service';
import * as AdmZip from 'adm-zip';

const UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || '/tmp/mvp-uploads';
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

function toBool(v: any, def?: boolean) {
  if (v === undefined || v === null || v === '') return def;
  const s = String(v).toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'on';
}
function toNum(v: any, def?: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
function pick<T extends string>(v: any, allowed: readonly T[], def?: T): T | undefined {
  const s = String(v || '').toLowerCase();
  const hit = allowed.find(a => a.toLowerCase() === s);
  return (hit as T) ?? def;
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly jobs: JobsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
      filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}-${file.originalname}`),
    }),
    limits: { fileSize: 100 * 1024 * 1024 }, // Max 100MB for security
    fileFilter: (_req, file, cb) => {
      // Only allow specific file types for security
      const allowedMimes = ['application/zip', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Invalid file type. Only ZIP, CSV, and Excel files are allowed'), false);
      }
    },
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-org-id') orgId?: string,
    @Query('mode') mode?: string,
    @Query('ai') ai?: string, 
    @Body() body?: Record<string, any>,
  ) {
    const fsPath = join(UPLOAD_DIR, file.filename);

    if (mode === 'shopify') {
      const defaults = {
        vendor: body?.vendor,
        price: toNum(body?.price, undefined),
        inventoryQty: toNum(body?.inventoryQty, undefined),
        inventoryPolicy: pick(body?.inventoryPolicy, ['deny','continue'] as const, undefined),
        requiresShipping: toBool(body?.requiresShipping, undefined),
        taxable: toBool(body?.taxable, undefined),
        fulfillment: pick(body?.fulfillment, ['manual'] as const, undefined),
        status: pick(body?.status, ['active','draft','archived'] as const, undefined),
        weightUnit: pick(body?.weightUnit, ['g','kg','lb','oz'] as const, undefined),
        productType: body?.productType,
        productCategory: body?.productCategory,
        tags: body?.tags,
        published: toBool(body?.published, undefined),
      };
      if (!orgId) {
        throw new BadRequestException('Organization ID is required');
      }
      const job = this.jobs.create(orgId, 'shopify_csv');
      setImmediate(() =>
      this.jobs.startShopifyCsv(
        job.id,
        fsPath,
        defaults,
        ai === '1' || ai === 'true' // ← מעבירים enableAi כ-boolean
      )
    );

      return { jobId: job.id, mode: 'shopify', size: file.size, name: file.originalname, defaultsUsed: defaults };
    }

    // Default: zip → csv
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }
    const job = this.jobs.create(orgId, 'zip2csv');
    setImmediate(() => this.jobs.startZip2Csv(job.id, fsPath));
    return { jobId: job.id, mode: 'zip2csv', size: file.size, name: file.originalname };
  }

  @Post('validate')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
      filename: (_req, file, cb) => cb(null, `validate-${Date.now()}-${randomUUID()}-${file.originalname}`),
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for validation
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === 'application/zip' || file.originalname.toLowerCase().endsWith('.zip')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only ZIP files are allowed for validation'), false);
      }
    },
  }))
  async validateZip(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-org-id') orgId?: string,
  ) {
    const fsPath = join(UPLOAD_DIR, file.filename);
    const errors: string[] = [];
    const warnings: string[] = [];
    let imageCount = 0;
    let hasSubfolders = false;

    try {
      // Check file size
      const stats = statSync(fsPath);
      if (stats.size > 50 * 1024 * 1024) {
        errors.push('File too large (over 50MB)');
      }

      // Check if it's a ZIP file
      if (!file.originalname.toLowerCase().endsWith('.zip')) {
        errors.push('Must be a ZIP file');
      }

      try {
        const zip = new AdmZip(fsPath);
        const entries = zip.getEntries();

        // Count images and check for subfolders
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        let foldersFound = new Set<string>();

        for (const entry of entries) {
          const entryName = entry.entryName.toLowerCase();
          const isImage = imageExtensions.some(ext => entryName.endsWith(ext));
          
          if (isImage && !entry.isDirectory) {
            imageCount++;
            
            // Check for subfolder structure
            const pathParts = entry.entryName.split('/');
            if (pathParts.length > 1) {
              foldersFound.add(pathParts[0]);
            }
          }
        }

        hasSubfolders = foldersFound.size > 1;

        // Add warnings based on analysis
        if (imageCount < 10) {
          warnings.push('Few images found (less than 10)');
        }

        if (imageCount === 0) {
          errors.push('No valid images found in ZIP file');
        }

        if (!hasSubfolders) {
          warnings.push('No subfolders found for product organization');
        }

      } catch (zipError) {
        errors.push('Invalid or corrupted ZIP file');
      }

    } catch (error) {
      errors.push('Failed to analyze file');
    }

    // Clean up validation file
    try {
      const fs = require('fs');
      fs.unlinkSync(fsPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      imageCount,
      totalSize: file.size,
      hasSubfolders,
    };
  }

  @Post('preview')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
      filename: (_req, file, cb) => cb(null, `preview-${Date.now()}-${randomUUID()}-${file.originalname}`),
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === 'application/zip' || file.originalname.toLowerCase().endsWith('.zip')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only ZIP files are allowed for preview'), false);
      }
    },
  }))
  async generatePreview(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-org-id') orgId?: string,
    @Body() wizardDefaults?: Record<string, any>,
  ) {
    const fsPath = join(UPLOAD_DIR, file.filename);
    
    try {
      const zip = new AdmZip(fsPath);
      const entries = zip.getEntries();
      
      // Group images by folder/product
      const productGroups: Record<string, string[]> = {};
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      
      for (const entry of entries) {
        const entryName = entry.entryName;
        const isImage = imageExtensions.some(ext => entryName.toLowerCase().endsWith(ext));
        
        if (isImage && !entry.isDirectory) {
          const pathParts = entryName.split('/');
          const productName = pathParts.length > 1 ? pathParts[0] : 'Ungrouped';
          
          if (!productGroups[productName]) {
            productGroups[productName] = [];
          }
          productGroups[productName].push(entryName);
        }
      }
      
      // Generate product previews (first 20)
      const products = Object.entries(productGroups)
        .slice(0, 20)
        .map(([groupName, images], index) => {
          const basePrice = wizardDefaults?.pricingPolicy === 'markup'
            ? (wizardDefaults?.basePrice || 50) * (1 + (wizardDefaults?.markupPercent || 100) / 100)
            : (wizardDefaults?.basePrice || 50);
            
          return {
            id: `prod-${index + 1}`,
            title: `${wizardDefaults?.vendor || 'Sample'} ${groupName.replace(/[-_]/g, ' ')}`.slice(0, 90),
            description: `High-quality ${groupName.toLowerCase()} with premium materials and excellent craftsmanship.`,
            bullets: [
              'Premium materials',
              'Excellent craftsmanship', 
              'Perfect fit',
              'Long lasting'
            ],
            tags: (wizardDefaults?.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
            variants: [
              {
                name: 'Default',
                price: Math.round(basePrice * 100) / 100,
                comparePrice: wizardDefaults?.pricingPolicy === 'markup' ? Math.round(basePrice * 1.2 * 100) / 100 : undefined,
                quantity: wizardDefaults?.defaultQuantity || 100,
              }
            ],
            primaryImage: `https://picsum.photos/300/300?random=${index}`, // Placeholder - in real implementation, extract and host the actual image
            imageCount: images.length,
            publishState: wizardDefaults?.publishState || 'draft',
            vendor: wizardDefaults?.vendor || 'Sample Vendor',
          };
        });
      
      // Clean up preview file
      try {
        const fs = require('fs');
        fs.unlinkSync(fsPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      return {
        products,
        totalGroups: Object.keys(productGroups).length,
        totalImages: Object.values(productGroups).reduce((sum, imgs) => sum + imgs.length, 0),
        variantsDetected: Object.values(productGroups).filter(imgs => imgs.length > 1).length,
      };
      
    } catch (error) {
      // Clean up on error
      try {
        const fs = require('fs');
        fs.unlinkSync(fsPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      throw new Error('Failed to generate preview');
    }
  }
}
