import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveLead } from '../../../../../../packages/server/leads';

const LeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  interest: z.enum(['ecommerce','real_estate','law']).optional(),
  budget: z.number().int().optional(),
  source: z.string().default('OTHER'),
  utm: z.record(z.string()).optional(),
  consent: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = LeadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const lead = await saveLead({
      ...parsed.data,
      ownerUid: 'default' // TODO: Get actual user UID from authentication context
    });
    return NextResponse.json({ ok: true, id: lead.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'ingest_failed' }, { status: 500 });
  }
}
