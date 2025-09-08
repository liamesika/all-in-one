import { Injectable } from '@nestjs/common';
const { PrismaClient } = require('@prisma/client');
import * as XLSX from 'xlsx';

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('0')) d = '+972' + d.slice(1);
  else if (!d.startsWith('+')) d = '+' + d;
  return d;
}

@Injectable()
export class LeadsService {
  private prisma = new PrismaClient();

  async createLead(ownerId: string, dto: any) {
    return this.prisma.lead.create({
      data: {
        ownerId,
        name: dto?.name ?? 'Unknown',   // name חובה בסכמה
        email: dto?.email ?? null,      // שימי לב: יוניק
        phone: dto?.phone ?? null,
        phoneNorm: normalizePhone(dto?.phone),
        interest: dto?.interest ?? null,
        budget: dto?.budget ?? null,
        source: dto?.source ?? undefined,   // דיפולט DB: "website"
        utm: dto?.utm ?? undefined,         // Json?
        consent: dto?.consent ?? undefined, // דיפולט DB: true
        score: dto?.score ?? undefined,     // דיפולט DB: 0
        bucket: dto?.bucket ?? null,
        status: dto?.status ?? undefined,   // דיפולט DB: "new"
      },
    });
  }

  // ▼ הוסיפי כאן (מתחת ל-createLead)

  async listLeads(ownerId: string, limit = 100) {
  return this.prisma.lead.findMany({
    where: { ownerId, deletedAt: null }, // ← מסנן לידים שנמחקו רכות
    orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(Number(limit) || 100, 1), 500),
    });
  }


  async getLeadById(ownerId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, ownerId },
    });
    return lead; // אם אין – null, וה־controller יחזיר 404
  }

  // עדכון ל־Lead לפי id אחרי בדיקת בעלות ומחיקה רכה
async updateLeadById(ownerId: string, id: string, data: any) {
    // סניטציה/רשימת שדות מותרת
    const allowed: any = {};
    if (typeof data?.status === 'string') allowed.status = data.status;
    if (typeof data?.notes === 'string')  allowed.notes  = data.notes;
    if (typeof data?.score === 'number')  allowed.score  = data.score;

    // אם אין מה לעדכן — נחזיר את ה־lead כמו שהוא (או null אם לא קיים)
    const exist = await this.prisma.lead.findFirst({
      where: { id, ownerId, deletedAt: null },
    });
    if (!exist) return null;

    if (Object.keys(allowed).length === 0) {
      return exist; // אין שדה מותר לעדכון, מחזירים את הקיים
    }

    // עדכון לפי id (יוניק)
    return this.prisma.lead.update({
      where: { id },
      data: allowed,
    });
  }


async softDeleteLead(ownerId: string, id: string): Promise<boolean> {
  // מאתרים את הליד השייך לבעלים ושטרם נמחק
  const lead = await this.prisma.lead.findFirst({
    where: { id, ownerId, deletedAt: null },
    select: { id: true },
  });
  if (!lead) return false;

  await this.prisma.lead.update({
    where: { id }, // id יוניק
    data: { deletedAt: new Date() },
  });
  return true;
}
// ===== CSV ingest (פשוט, מותאם לתבנית: name,email,phone,interest,budget,source,notes,score) =====
private parseCsvSimple(text: string): Array<Record<string, string>> {
  // לא תומך במרכאות/פסיקים בשדות — תבנית ה-CSV שלנו בלי פסיקים בתוך ערכים.
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    const rec: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      rec[header[j]] = (parts[j] ?? '').trim();
    }
    rows.push(rec);
  }
  return rows;
}

async ingestCsv(ownerId: string, csvText: string) {
  const rows = this.parseCsvSimple(csvText);
  let created = 0, skipped = 0, errors = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    // מרכיבים DTO עם היגיון מינימלי
    const dto: any = {
      name: (r['name'] ?? '').trim() || 'Unknown',
      email: (r['email'] ?? '').trim() || null,
      phone: (r['phone'] ?? '').trim() || null,
      interest: (r['interest'] ?? '').trim() || null,
      source: (r['source'] ?? '').trim() || 'csv',
      notes: (r['notes'] ?? '').trim() || undefined,
    };
    const budget = (r['budget'] ?? '').trim();
    const score  = (r['score']  ?? '').trim();
    if (budget) dto.budget = Number(budget);
    if (score)  dto.score  = Number(score);

    try {
      await this.createLead(ownerId, dto);
      created++;
    } catch (e: any) {
      // אם אימייל יוניק כבר קיים או כל שגיאת DB אחרת – נספור כ"skip"/"error"
      if (e?.code === 'P2002') {
        skipped++; // יוניק קיים (למשל email)
      } else {
        errors++;
      }
    }
  }

  return { created, skipped, errors };
}

  // המרות לקלט שורות גנריות משני סוגי קבצים

private parseCsvSimpleToRows(text: string): Array<Record<string, string>> {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    const rec: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      rec[header[j]] = (parts[j] ?? '').trim();
    }
    rows.push(rec);
  }
  return rows;
}

private parseExcelToRows(buf: Buffer): Array<Record<string, string>> {
  const wb = XLSX.read(buf, { type: 'buffer' });
  const first = wb.SheetNames[0];
  if (!first) return [];
  const ws = wb.Sheets[first];
  // מחזיר מערך אובייקטים לפי כותרות השורה הראשונה
  const json: Array<Record<string, any>> = XLSX.utils.sheet_to_json(ws, { defval: '' });
  //Normalize keys: lower-case
  return json.map((row) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k.toLowerCase()] = String(v ?? '').trim();
    }
    return out;
  });
}

/**
 * Ingest מאוחד: מקבל buffer וסוג ('excel' | 'csv' | 'unknown'), מפיק שורות ויוצר לידים.
 * שדות נתמכים: name,email,phone,interest,budget,source,notes,score
 */
async ingestUpload(ownerId: string, buf: Buffer, kind: 'excel' | 'csv' | 'unknown') {
  let rows: Array<Record<string, string>> = [];
  if (kind === 'excel') rows = this.parseExcelToRows(buf);
  else if (kind === 'csv') rows = this.parseCsvSimpleToRows(buf.toString('utf8'));
  else {
    // ננסה לנחש לפי התוכן
    const asText = buf.toString('utf8');
    rows = asText.includes(',') ? this.parseCsvSimpleToRows(asText) : this.parseExcelToRows(buf);
  }

  let created = 0, skipped = 0, errors = 0;

  for (const r of rows) {
    const dto: any = {
      name: (r['name'] ?? '').trim() || 'Unknown',
      email: (r['email'] ?? '').trim() || null,
      phone: (r['phone'] ?? '').trim() || null,
      interest: (r['interest'] ?? '').trim() || null,
      source: (r['source'] ?? '').trim() || 'csv',
      notes: (r['notes'] ?? '').trim() || undefined,
    };
    const budget = (r['budget'] ?? '').trim();
    const score  = (r['score']  ?? '').trim();
    if (budget) dto.budget = Number(budget);
    if (score)  dto.score  = Number(score);

    try {
      await this.createLead(ownerId, dto);
      created++;
    } catch (e: any) {
      if (e?.code === 'P2002') skipped++; else errors++;
    }
  }

  return { created, skipped, errors };
}
// קולט מערך שורות מה-Spreadsheet ויוצר לידים (פורמט עמודות כמו בתבנית ה-CSV)
async ingestRowsFromSheet(ownerId: string, rows: Array<Record<string, any>>) {
  let created = 0, skipped = 0, errors = 0;

  for (const r of rows || []) {
    const val = (k: string) => (r?.[k] ?? r?.[k.toLowerCase()] ?? '').toString().trim();

    const dto: any = {
      name: val('name') || 'Unknown',
      email: val('email') || null,
      phone: val('phone') || null,
      interest: val('interest') || null,
      source: val('source') || 'sheet',
      notes: val('notes') || undefined,
    };
    const budget = val('budget');
    const score  = val('score');
    if (budget) dto.budget = Number(budget);
    if (score)  dto.score  = Number(score);

    try {
      await this.createLead(ownerId, dto);
      created++;
    } catch (e: any) {
      if (e?.code === 'P2002') skipped++; else errors++;
    }
  }

  return { created, skipped, errors };
}

}
