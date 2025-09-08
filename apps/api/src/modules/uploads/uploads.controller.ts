import { Controller, Post, UseInterceptors, UploadedFile, Headers, Query, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JobsService } from '../jobs/jobs.service';

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
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // עד ~2GB
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-org-id') orgId?: string,
    @Query('mode') mode?: string,
    @Query('ai') ai?: string, 
    @Body() body?: any,
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
      const job = this.jobs.create(orgId || 'demo', 'shopify_csv');
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

    // ברירת מחדל: zip → csv
    const job = this.jobs.create(orgId || 'demo', 'zip2csv');
    setImmediate(() => this.jobs.startZip2Csv(job.id, fsPath));
    return { jobId: job.id, mode: 'zip2csv', size: file.size, name: file.originalname };
  }
}
