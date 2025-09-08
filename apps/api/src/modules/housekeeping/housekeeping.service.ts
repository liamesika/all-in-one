import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || '/tmp/mvp-uploads';
const OUTPUT_DIR = process.env.LOCAL_OUTPUT_DIR || '/tmp/mvp-outputs';
const DB_FILE    = process.env.LOCAL_DB_FILE    || '/tmp/mvp-jobs.json';

// קונפיג ברירות־מחדל (ניתן לשנות ב-.env)
const CLEAN_CRON              = process.env.CLEAN_CRON || '0 * * * *';      // כל שעה בתחילת שעה
const CLEAN_RETENTION_HOURS   = Number(process.env.CLEAN_RETENTION_HOURS || 72);  // שמירה 72 שעות
const CLEAN_DB_MAX_JOBS       = Number(process.env.CLEAN_DB_MAX_JOBS || 500);     // מקסימום 500 עבודות
const CLEAN_DB_MAX_AGE_DAYS   = Number(process.env.CLEAN_DB_MAX_AGE_DAYS || 30);  // שמירה 30 יום

@Injectable()
export class HousekeepingService {
  private readonly logger = new Logger('Housekeeping');

  @Cron(CLEAN_CRON)
  async tick() {
    this.logger.log('Housekeeping tick…');
    const maxAgeMs = CLEAN_RETENTION_HOURS * 60 * 60 * 1000;
    await this.cleanDir(UPLOAD_DIR, maxAgeMs);
    await this.cleanDir(OUTPUT_DIR, maxAgeMs);
    await this.compactJobsDb();
    this.logger.log('Housekeeping done.');
  }

  private async cleanDir(dir: string, maxAgeMs: number) {
    try {
      if (!fs.existsSync(dir)) return;
      const now = Date.now();
      const names = fs.readdirSync(dir);
      let removed = 0;
      for (const name of names) {
        const p = path.join(dir, name);
        let st: fs.Stats;
        try { st = fs.statSync(p); } catch { continue; }
        const age = now - st.mtimeMs;
        if (age > maxAgeMs) {
          try { fs.rmSync(p, { recursive: true, force: true }); removed++; } catch {}
        }
      }
      this.logger.log(`Cleaned ${removed} items from ${dir}`);
    } catch (e: any) {
      this.logger.error(`cleanDir(${dir}) failed: ${e?.message || e}`);
    }
  }

  private async compactJobsDb() {
    try {
      if (!fs.existsSync(DB_FILE)) return;
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return;

      const now = Date.now();
      const maxAgeMs = CLEAN_DB_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

      // מיון לפי createdAt, סינון לפי גיל, ואז חיתוך לפי מקסימום
      const filtered = arr
        .filter((j: any) => {
          const t = new Date(j?.createdAt || 0).getTime();
          return isFinite(t) ? now - t <= maxAgeMs : true;
        })
        .sort((a: any, b: any) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());

      const trimmed = filtered.slice(-CLEAN_DB_MAX_JOBS);
      fs.writeFileSync(DB_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
      this.logger.log(`Compacted jobs DB → ${trimmed.length} jobs`);
    } catch (e: any) {
      this.logger.error(`compactJobsDb failed: ${e?.message || e}`);
    }
  }
}
