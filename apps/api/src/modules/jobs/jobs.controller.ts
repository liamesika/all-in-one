import { Controller, Get, Post, Param, Res, Headers, Body, NotFoundException, Query } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  list(
  @Headers('x-org-id') orgId?: string,
  @Query('limit') limit = '10',
) {
  const n = Math.max(1, Math.min(100, Number(limit)));
  const rows = this.jobs.findAll(orgId || 'demo') || [];
  rows.sort(
    (a: any, b: any) =>
      new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
  );
  return rows.slice(0, n);
}

  @Get('summary')
  summary(@Headers('x-org-id') orgId?: string) {
    const rows = this.jobs.findAll(orgId || 'demo') || [];
    const total   = rows.length;
    const success = rows.filter((r:any) => r?.status === 'SUCCESS').length;
    const failed  = rows.filter((r:any) => r?.status === 'FAILED').length;

    // ספירת CSV-ים שהצליחו (נגזר משדה type/ kind אם קיים)
    const csvsGenerated = rows.filter(
      (r:any) =>
        r?.status === 'SUCCESS' &&
        (r?.type === 'shopify_csv' || r?.kind === 'shopify-csv')
    ).length;

    return { total, success, failed, csvsGenerated };
  }


  @Post()
  create(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    const type = body?.type || 'dummy';
    return this.jobs.create(orgId || 'demo', type);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    const job = this.jobs.findOne(id);
    if (!job) throw new NotFoundException('Job not found');
    return job; // כולל progress, logs, metrics
  }

  @Get(':id/output')
  async download(@Param('id') id: string, @Res() res: Response) {
    const job = this.jobs.findOne(id);
    if (!job || !job.outputUrl) throw new NotFoundException('Output not found');
    const fileUrl = job.outputUrl;         // e.g. file:///tmp/mvp-outputs/<id>.csv
    const fsPath = fileUrl.replace(/^file:\/\//, '');
    if (!fs.existsSync(fsPath)) throw new NotFoundException('File missing');
    const filename = path.basename(fsPath);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    fs.createReadStream(fsPath).pipe(res);
  }
}
