import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function parseCsv(text: string) {
  // פיענוח בסיסי מאוד (ללא תמיכה בפסיקים בתוך מרכאות) – מספיק ל-MVP
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] as string[][] };

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
  return { headers, rows };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'no_file' }, { status: 400 });
    }

    const csvText = await file.text();
    const { headers, rows } = parseCsv(csvText);

    // מיפוי עמודות: חייבים שורה ראשונה עם השמות הבאים:
    // clientName,email,phone,propertyType,city,budgetMin,budgetMax,source,status,notes
    const idx = (name: string) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());

    const iClientName = idx('clientName');
    const iEmail = idx('email');
    const iPhone = idx('phone');
    const iPropertyType = idx('propertyType');
    const iCity = idx('city');
    const iBudgetMin = idx('budgetMin');
    const iBudgetMax = idx('budgetMax');
    const iSource = idx('source');
    const iStatus = idx('status');
    const iNotes = idx('notes');

    const apiBase = process.env.API_BASE ?? 'http://localhost:4000';
    const orgId = 'demo'; // אם צריך דינמי, נחליף בהמשך

    let created = 0, skipped = 0, errors = 0;

    for (const r of rows) {
      if (!r.length) continue;

      const payload = {
        clientName: r[iClientName] || '',
        email: iEmail >= 0 ? r[iEmail] || null : null,
        phone: iPhone >= 0 ? r[iPhone] || null : null,
        propertyType: iPropertyType >= 0 ? r[iPropertyType] || null : null,
        city: iCity >= 0 ? r[iCity] || null : null,
        budgetMin: iBudgetMin >= 0 && r[iBudgetMin] !== '' ? Number(r[iBudgetMin]) : null,
        budgetMax: iBudgetMax >= 0 && r[iBudgetMax] !== '' ? Number(r[iBudgetMax]) : null,
        source: iSource >= 0 ? r[iSource] || null : null,
        status: iStatus >= 0 && r[iStatus] ? r[iStatus] : 'NEW',
        notes: iNotes >= 0 ? r[iNotes] || null : null,
      };

      // חובה: שם הלקוח
      if (!payload.clientName) { skipped++; continue; }

      try {
        const res = await fetch(`${apiBase}/api/real-estate/leads`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-org-id': orgId,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) created++;
        else errors++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({ created, skipped, errors });
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
