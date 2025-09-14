// packages/server/leads/index.ts
import { prisma } from '../db/client';

export async function addEvent(leadId: string, type: string, payload?: any) {
  try {
    // Type assertion to work around TypeScript cache issue
    return await (prisma as any).realEstateLeadEvent.create({
      data: { leadId, type, payload },
    });
  } catch (error) {
    console.error('Error creating RealEstateLeadEvent:', error);
    // Fallback: try connecting to ensure prisma is initialized
    await prisma.$connect();
    return await (prisma as any).realEstateLeadEvent.create({
      data: { leadId, type, payload },
    });
  }
}

export type InLead = {
  ownerUid: string;
  name?: string;
  clientName?: string;
  email?: string | null;
  phone?: string | null;
  preferredCity?: string | null;
  budgetMin?: number | null | string;
  budgetMax?: number | null | string;
  status?: string;          // e.g., 'NEW' | 'CONTACTED' | ...
  propertyId?: string | null;
};

const toNull = (v: any) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
};
const toNumOrNull = (v: any) =>
  v === '' || v === undefined || v === null ? null : Number(v);

// Create a lead
export async function saveLead(input: InLead) {
  const data: any = {
    ownerUid: input.ownerUid,
    clientName: toNull(input.clientName ?? input.name) ?? '—',
    email: toNull(input.email),
    phone: toNull(input.phone),
    preferredCity: toNull(input.preferredCity),
    budgetMin: toNumOrNull(input.budgetMin),
    budgetMax: toNumOrNull(input.budgetMax),
    status: input.status ?? 'NEW',
    propertyId: input.propertyId ?? null,
  };

  return prisma.realEstateLead.create({ data });
}

// Read a lead by id
export async function getLead(id: string) {
  return prisma.realEstateLead.findUnique({ where: { id } });
}

// Update a lead
export async function updateLead(id: string, patch: Partial<InLead>) {
  const data: any = {};
  if ('clientName' in patch || 'name' in patch)
    data.clientName = toNull(patch.clientName ?? patch.name);
  if ('email' in patch) data.email = toNull(patch.email);
  if ('phone' in patch) data.phone = toNull(patch.phone);
  if ('preferredCity' in patch) data.preferredCity = toNull(patch.preferredCity);
  if ('budgetMin' in patch) data.budgetMin = toNumOrNull(patch.budgetMin);
  if ('budgetMax' in patch) data.budgetMax = toNumOrNull(patch.budgetMax);
  if ('status' in patch && patch.status) data.status = patch.status;
  if ('propertyId' in patch) data.propertyId = patch.propertyId ?? null;

  return prisma.realEstateLead.update({ where: { id }, data });
}

// Delete a lead
export async function deleteLead(id: string) {
  return prisma.realEstateLead.delete({ where: { id } });
}
