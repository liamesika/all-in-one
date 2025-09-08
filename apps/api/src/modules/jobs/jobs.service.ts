import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

const JOBS_DB = '/tmp/mvp-jobs.json';
import { AiService } from '../ai/ai.service'; 
import * as fs from 'fs';
import * as path from 'path';

import AdmZip = require('adm-zip');          // יציב ב-CommonJS
import slugify from 'slugify';

export type JobStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELED';
export type LogLevel = 'info' | 'warn' | 'error';
export interface LogEntry { ts: string; level: LogLevel; msg: string }

export interface Job {
  id: string;
  orgId: string;
  type: string;
  status: JobStatus;
  createdAt: string;
  inputUrl?: string;
  outputUrl?: string;
  metrics?: Record<string, any>;
  progress?: number;     // 0..100
  logs?: LogEntry[];
}

const OUTPUT_DIR = process.env.LOCAL_OUTPUT_DIR || '/tmp/mvp-outputs';
const DB_FILE = process.env.LOCAL_DB_FILE || '/tmp/mvp-jobs.json';

function loadFromDisk(): Job[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Job[];
    }
  } catch {}
  return [
    {
      id: randomUUID(), orgId: 'demo', type: 'dummy', status: 'SUCCESS',
      createdAt: new Date().toISOString(), progress: 100,
      logs: [{ ts: new Date().toISOString(), level: 'info', msg: 'Dummy job completed' }]
    },
  ];
}
function saveToDisk(jobs: Job[]) {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(jobs, null, 2), 'utf-8'); }
  catch (e) { console.error('Failed saving DB:', e); }
}
function csvEscape(s: any) {
  const str = (s ?? '').toString();
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}
function ensureDirs() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

@Injectable()
export class JobsService {
  private jobs: Job[] = loadFromDisk();
  private save() { saveToDisk(this.jobs); }
  private log(job: Job, level: LogLevel, msg: string) {
    job.logs = job.logs || [];
    job.logs.push({ ts: new Date().toISOString(), level, msg });
    this.save();
  }
  private setProgress(job: Job, p: number) {
    job.progress = Math.max(0, Math.min(100, Math.round(p)));
    this.save();
  }

  // ←← הוספה כאן: constructor עם הזרקת AiService
  constructor(private readonly ai: AiService) {}

  findAll(_orgId: string) { return this.jobs; }
  findOne(id: string) { return this.jobs.find((j) => j.id === id); }

  create(orgId: string, type: string) {
    const job: Job = {
      id: randomUUID(),
      orgId: orgId || 'demo',
      type,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      progress: 0,
      logs: [{ ts: new Date().toISOString(), level: 'info', msg: `Job created: ${type}` }],
    };
    this.jobs.push(job); this.save();

    // עבודת דמו ברירת מחדל
    if (type !== 'zip2csv' && type !== 'shopify_csv') {
      setTimeout(() => {
        job.status = 'RUNNING'; this.log(job, 'info', 'Started');
        this.setProgress(job, 25);
        setTimeout(() => { this.setProgress(job, 75);
          setTimeout(() => {
            job.status = 'SUCCESS'; this.setProgress(job, 100);
            this.log(job, 'info', 'Completed');
          }, 400);
        }, 400);
      }, 300);
    }
    return job;
  }

  // ------- ZIP → CSV -------
  async startZip2Csv(jobId: string, inputFsPath: string) {
    const job = this.findOne(jobId);
    if (!job) throw new Error('Job not found');
    job.inputUrl = `file://${inputFsPath}`;
    job.status = 'RUNNING'; this.setProgress(job, 1); this.log(job, 'info', 'zip2csv: starting');

    try {
      ensureDirs();
      const zip = new AdmZip(inputFsPath);
      const entries = zip.getEntries();
      this.log(job, 'info', `zip2csv: ${entries.length} entries`);

      const outPath = path.join(OUTPUT_DIR, `${job.id}.csv`);
      const out = fs.createWriteStream(outPath, { encoding: 'utf-8' });
      out.write('path,size,compressedSize,isDirectory\n');

      const total = Math.max(1, entries.length);
      let totalSize = 0;
      let i = 0;

      for (const e of entries) {
        const p = (e.entryName || '').replace(/"/g, '""');
        const size = (e.header?.size as number) || 0;
        const csize = (e.compressedSize as number) || 0;
        totalSize += size;
        out.write(`"${p}",${size},${csize},${!!e.isDirectory}\n`);

        i++;
        if (i % 5 === 0 || i === total) {
          const prog = 5 + (i / total) * 90; // 5..95
          this.setProgress(job, prog);
        }
      }

      await new Promise<void>((resolve, reject) => {
        out.on('finish', resolve); out.on('error', reject); out.end();
      });

      job.outputUrl = `file://${outPath}`;
      job.metrics = { entries: entries.length, totalSize };
      job.status = 'SUCCESS'; this.setProgress(job, 100);
      this.log(job, 'info', 'zip2csv: done');
    } catch (err: any) {
      this.log(job!, 'error', `zip2csv failed: ${String(err?.message || err)}`);
      job!.status = 'FAILED';
      job!.metrics = { ...(job!.metrics || {}), error: String(err?.message || err) };
      this.save();
    }
  }

  // ------- ZIP → Shopify Product CSV -------
  async startShopifyCsv(
  jobId: string,
  inputFsPath: string,
  defaults?: {
    vendor?: string;
    price?: number;
    inventoryQty?: number;
    inventoryPolicy?: 'deny' | 'continue';
    requiresShipping?: boolean;
    taxable?: boolean;
    fulfillment?: 'manual';
    status?: 'active' | 'draft' | 'archived';
    weightUnit?: 'g' | 'kg' | 'lb' | 'oz';
    productType?: string;
    productCategory?: string;
    tags?: string;
    published?: boolean;
  },
  enableAi: boolean = false, // ← חדש
) 
{
    const job = this.findOne(jobId);
    if (!job) throw new Error('Job not found');
    job.inputUrl = `file://${inputFsPath}`;
    job.status = 'RUNNING'; this.setProgress(job, 1); this.log(job, 'info', 'shopify_csv: starting');

    const cfg = {
      vendor: defaults?.vendor ?? 'Vendor',
      price: defaults?.price ?? 99.9,
      inventoryQty: defaults?.inventoryQty ?? 100,
      inventoryPolicy: defaults?.inventoryPolicy ?? 'continue',
      requiresShipping: defaults?.requiresShipping ?? true,
      taxable: defaults?.taxable ?? true,
      fulfillment: defaults?.fulfillment ?? 'manual',
      status: defaults?.status ?? 'active',
      weightUnit: defaults?.weightUnit ?? 'g',
      productType: defaults?.productType ?? 'General',
      productCategory: defaults?.productCategory ?? '',
      tags: defaults?.tags ?? '',
      published: defaults?.published ?? true,
    };
    // --- AI bootstrap (optional) ---
const useAi = !!enableAi;
type AiMeta = {
  title?: string;
  description?: string;
  tags?: string;
  // וריאציות גנריות עד 3 – כל אחת name/value (למשל Color/Silver, Size/M)
  options?: Array<{ name: string; value: string }>;
  // שדה color נשאר אופציונלי, אם אי פעם תשתמשי בו
  color?: string;
};
let aiMap = new Map<string, AiMeta>();

if (useAi) {
  try {
    // סורקים את ה-ZIP כדי לאסוף רק תמונות
    const zip = new AdmZip(inputFsPath);
    const entries = zip.getEntries();
    const imageFiles = entries
      .filter(e => !e.isDirectory && isImage(e.entryName))
      .map(e => e.entryName);

    if (imageFiles.length) {
      const aiItems = await this.ai.generatePerItem(imageFiles.map(f => ({ filename: f })));
      aiMap = new Map(aiItems.map(it => [it.filename, it]));
      this.log(job, 'info', `AI: generated metadata for ${aiItems.length} items`);
    } else {
      this.log(job, 'info', 'AI: no image files detected in ZIP');
    }
  } catch (e: any) {
    this.log(job, 'warn', `AI generation failed: ${e?.message || e}`);
  }
}

function isImage(name: string) {
  return /\.(jpe?g|png|gif|webp|bmp|tiff?|heic|svg)$/i.test(name);
}

    try {
      ensureDirs();
      const zip = new AdmZip(inputFsPath);
      const entries = zip.getEntries();
      const imageExt = /\.(jpg|jpeg|png|webp|gif)$/i;
      const images = entries.filter(e => imageExt.test(e.entryName) && !e.isDirectory);
      this.log(job, 'info', `shopify_csv: found ${images.length} images`);

      const outPath = path.join(OUTPUT_DIR, `${job.id}-shopify.csv`);
      const out = fs.createWriteStream(outPath, { encoding: 'utf-8' });

      const headers = [
        'Handle','Title','Body (HTML)','Vendor','Product Category','Type','Tags','Published',
        'Option1 Name','Option1 Value','Option2 Name','Option2 Value','Option3 Name','Option3 Value',
        'Variant SKU','Variant Grams','Variant Inventory Tracker','Variant Inventory Qty',
        'Variant Inventory Policy','Variant Fulfillment Service','Variant Price','Variant Compare At Price',
        'Variant Requires Shipping','Variant Taxable','Variant Barcode',
        'Image Src','Image Position','Image Alt Text','Variant Image',
        'Gift Card','SEO Title','SEO Description',
        'Google Shopping / Google Product Category','Google Shopping / Gender','Google Shopping / Age Group','Google Shopping / MPN','Google Shopping / Condition','Google Shopping / Custom Product',
        'Variant Weight Unit','Variant Tax Code','Cost per item','Status'
      ];
      out.write(headers.join(',') + '\n');

      const total = Math.max(1, images.length);
      let i = 0;

      for (const img of images) {
        i++;
        const base = path.basename(img.entryName, path.extname(img.entryName));
        const title = base.replace(/[-_]/g, ' ').trim().replace(/\s+/g, ' ');
        const handle = slugify(base, { lower: true, strict: true });
        const sku = `${handle}-${i}`.slice(0, 63);
        
         // נתוני AI לפריט (אם קיימים)
  const ai = aiMap.get(img.entryName) || null;

  // Title: AI עדיף; אם אין – מהשם; ואם אין – handle
  const finalTitle = (ai?.title || title || handle).trim();

  // Body (HTML): AI עדיף; אחרת טקסט בסיסי קצר
  const finalBodyHtml = ai?.description
    ? ai.description
    : `<p>Auto-generated product for ${finalTitle}</p>`;

  // Tags: קדימות לטופס (cfg.tags). אם לא מולא בטופס – נשתמש ב-AI; אחרת ריק
  const finalTags = (cfg.tags && cfg.tags.trim().length > 0)
    ? cfg.tags
    : (ai?.tags || '');

  // אופציות גנריות (עד 3): אם ה-AI החזיר options, נמלא אותן; אחרת ריק
  const opts = Array.isArray((ai as any)?.options) ? (ai as any).options.slice(0, 3) : [];
  const opt1 = opts[0] || { name: '', value: '' };
  const opt2 = opts[1] || { name: '', value: '' };
  const opt3 = opts[2] || { name: '', value: '' };

  const row = [
    csvEscape(handle),                 // Handle
    csvEscape(finalTitle),             // Title
    csvEscape(finalBodyHtml),          // Body (HTML)
    csvEscape(cfg.vendor),             // Vendor
    csvEscape(cfg.productCategory),    // Product Category
    csvEscape(cfg.productType),        // Type
    csvEscape(finalTags),              // Tags
    cfg.published ? 'TRUE' : 'FALSE',  // Published

    csvEscape(opt1.name || ''),        // Option1 Name
    csvEscape(opt1.value || ''),       // Option1 Value
    csvEscape(opt2.name || ''),        // Option2 Name
    csvEscape(opt2.value || ''),       // Option2 Value
    csvEscape(opt3.name || ''),        // Option3 Name
    csvEscape(opt3.value || ''),       // Option3 Value

    csvEscape(sku),                    // Variant SKU
    '',                                // Variant Grams
    '',                                // Variant Inventory Tracker
    String(cfg.inventoryQty),          // Variant Inventory Qty
    csvEscape(cfg.inventoryPolicy),    // Variant Inventory Policy
    csvEscape(cfg.fulfillment),        // Variant Fulfillment Service
    String(cfg.price),                 // Variant Price
    '',                                // Variant Compare At Price
    cfg.requiresShipping ? 'TRUE' : 'FALSE', // Variant Requires Shipping
    cfg.taxable ? 'TRUE' : 'FALSE',    // Variant Taxable
    '',                                // Variant Barcode

    csvEscape(`file://${path.join('<zip>', img.entryName)}`), // Image Src (בשלב הבא נחליף ל-URL אמיתי)
    String(1),                         // Image Position
    csvEscape(finalTitle),             // Image Alt Text
    '',                                // Variant Image

    'FALSE',                           // Gift Card
    '',                                // SEO Title
    '',                                // SEO Description
    '', '', '', '', '', '',            // Google Shopping fields
    csvEscape(cfg.weightUnit),         // Variant Weight Unit
    '',                                // Variant Tax Code
    '',                                // Cost per item
    csvEscape(cfg.status),             // Status
  ];

        out.write(row.join(',') + '\n');

        if (i % 2 === 0 || i === total) {
          const prog = 5 + (i / total) * 90; // 5..95
          this.setProgress(job, prog);
        }
      }

      await new Promise<void>((resolve, reject) => {
        out.on('finish', resolve); out.on('error', reject); out.end();
      });

      job.outputUrl = `file://${outPath}`;
      job.metrics = { images: images.length };
      job.status = 'SUCCESS'; this.setProgress(job, 100);
      this.log(job, 'info', 'shopify_csv: done');
    } catch (err: any) {
      this.log(job!, 'error', `shopify_csv failed: ${String(err?.message || err)}`);
      job!.status = 'FAILED';
      job!.metrics = { ...(job!.metrics || {}), error: String(err?.message || err) };
      this.save();
    }
  }
}
