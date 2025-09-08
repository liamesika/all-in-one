import { prisma } from '../db/client';
import { normalizePhone } from './phone';
import { computeLeadScore } from './score';
import { pickBucket, assignOwner } from './routing';
import { notifyNewLead } from './notify';

type InLead = { name:string; email?:string|null; phone?:string|null; interest?:'ecommerce'|'real_estate'|'law'; budget?:number; source?:string; utm?:Record<string,string|undefined>; consent?:boolean; };

export async function addEvent(leadId: string, type: string, payload?: any) {
  await prisma.leadEvent.create({ data: { leadId, type, payload } });
}

export async function saveLead(input: InLead) {
  const email = input.email?.toLowerCase().trim() || null;
  const phoneNorm = input.phone ? normalizePhone(input.phone) : null;

  const existing = await prisma.lead.findFirst({
    where: { OR: [email ? { email } : undefined, phoneNorm ? { phoneNorm } : undefined].filter(Boolean) as any }
  });

  const score = computeLeadScore({ source: input.source || 'website', interest: input.interest, budget: input.budget, email, phoneNorm });
  const bucket = pickBucket({ interest: input.interest, budget: input.budget, utm: input.utm });
  const ownerId = await assignOwner(bucket);

  if (existing) {
    const updated = await prisma.lead.update({
      where: { id: existing.id },
      data: {
        name: existing.name || input.name,
        email: existing.email || email,
        phone: existing.phone || input.phone || undefined,
        phoneNorm: existing.phoneNorm || phoneNorm || undefined,
        interest: existing.interest || input.interest,
        budget: existing.budget || input.budget,
        source: existing.source || input.source,
        score: Math.max(existing.score, score),
        bucket: existing.bucket || bucket,
        ownerId: existing.ownerId || ownerId,
      },
    });
    await addEvent(updated.id, 'import', { merged: true, input });
    return updated;
  }

  const created = await prisma.lead.create({
    data: {
      name: input.name,
      email,
      phone: input.phone || undefined,
      phoneNorm: phoneNorm || undefined,
      interest: input.interest,
      budget: input.budget,
      source: input.source || 'website',
      utm: input.utm || undefined,
      consent: input.consent ?? true,
      score,
      bucket,
      status: score >= 70 ? 'hot' : 'new',
      ownerId,
    },
  });
  await addEvent(created.id, 'import', { input });
  await notifyNewLead(created);
  return created;
}
