import { Controller, Get, Res, UnauthorizedException, Query, Post, Delete, Param, Body, Req, NotFoundException, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadsService } from './leads.service';
import { Response } from 'express';
import { Patch } from '@nestjs/common';


@Controller('leads') // final: /api/leads בגלל ה-globalPrefix
export class LeadsController {
  constructor(private readonly leads: LeadsService) {
    console.log('✅ LeadsController loaded');
  }

  // רשימת לידים (owner)
   @Get('list')
  async list(@Query('limit') limit = '100', @Req() req: any) {
    // ⚠️ אותו מקור ownerId כמו ב-POST שעבד לך
    const ownerId = req?.user?.id || process.env.DEV_OWNER_ID || 'liamessi30@gmail.com';
    if (!ownerId) throw new UnauthorizedException('Missing session (ownerId)');
    const items = await this.leads.listLeads(ownerId, Number(limit));
    return { items };
  }

  // ליד בודד לפי id (עם בדיקת בעלות)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const ownerId = process.env.DEV_OWNER_ID || 'liamessi30@gmail.com';
    if (!ownerId) throw new UnauthorizedException('Missing session (ownerId)');
    const lead = await this.leads.getLeadById(ownerId, id);
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  // נשאיר גם את POST מהשלב הקודם
  @Post()
  async create(@Body() dto: any) {
    const ownerId = process.env.DEV_OWNER_ID || 'liamessi30@gmail.com';
    if (!ownerId) throw new UnauthorizedException('Missing session (ownerId)');
    return this.leads.createLead(ownerId, dto);
  }
    // הורדת תבנית CSV ריקה (שורת כותרות בלבד)
  @Get('template')
  downloadTemplate(@Res() res: Response) {
    const headers = ['name','email','phone','interest','budget','source','notes'] as const;
    const BOM = '\uFEFF'; // כדי ש-Excel יזהה UTF-8
    const csv = `${BOM}${headers.join(',')}\n`;

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="leads-template.csv"',
      'Cache-Control': 'no-store',
    });
    res.send(csv);
  }

  // הורדת CSV לדוגמה (2 שורות מלאות) - אופציונלי
  @Get('sample')
  downloadSample(@Res() res: Response) {
    const rows: string[][] = [
      ['name','email','phone','interest','budget','source','notes'],
      ['Dana Cohen','dana@example.com','050-1234567','ecommerce','15000','csv','מעוניינת בחנות חדשה'],
      ['Yossi Levi','yossi@example.com','+972501112233','real_estate','','ad_campaign','לחזור אלי בערב'],
    ];

    const BOM = '\uFEFF';
    const csv = BOM + rows.map(r => r.map(escapeCsv).join(',')).join('\n') + '\n';

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="leads-sample.csv"',
      'Cache-Control': 'no-store',
    });
    res.send(csv);

    function escapeCsv(cell: string) {
      return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
    }
  }
    @Patch(':id')
async patchLead(@Param('id') id: string, @Body() body: any, @Req() req: any) {
  const ownerId = process.env.DEV_OWNER_ID || 'dev';
  const updated = await this.leads.updateLeadById(ownerId, id, body);
  if (!updated) throw new NotFoundException('Lead not found');
  return updated;
}
    // @Delete(':id')
// async softDelete(@Param('id') id: string, @Req() req: any) {
//   const ownerId = req?.user?.id || process.env.DEV_OWNER_ID || 'demo-owner';
//   const ok = await this.leads.softDelete(ownerId, id);
//   if (!ok) throw new NotFoundException('Lead not found');
//   return { ok: true };
// }
@Delete(':id')
async softDelete(@Param('id') id: string, @Req() req: any) {
  // DEV: עד שיהיה session אמיתי
  const ownerId = process.env.DEV_OWNER_ID || 'dev';

  const ok = await this.leads.softDeleteLead(ownerId, id);
  if (!ok) throw new NotFoundException('Lead not found');

  // נחזיר JSON קטן; אפשר גם 204 אם תעדיפי
  return { ok: true, id };
}

@Post('ingest/csv')
@UseInterceptors(FileInterceptor('file'))
async ingestCsv(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
  const ownerId = process.env.DEV_OWNER_ID || 'dev';
  if (!file || !file.buffer) {
    throw new BadRequestException('No file provided (field "file")');
  }

  // זיהוי סוג הקובץ
  const lowerName = (file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  let kind: 'excel' | 'csv' | 'unknown' = 'unknown';
  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) kind = 'excel';
  else if (lowerName.endsWith('.csv')) kind = 'csv';
  else if (mime.includes('spreadsheetml') || mime.includes('excel')) kind = 'excel';
  else if (mime.includes('csv') || mime.startsWith('text/')) kind = 'csv';

  const summary = await this.leads.ingestUpload(ownerId, file.buffer, kind);
  return summary; // { created, skipped, errors }
}


}
