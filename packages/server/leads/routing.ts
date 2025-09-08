import { prisma } from '../db/client';
export function pickBucket({ interest, budget, utm }:{interest?:string; budget?:number; utm?:Record<string,any>;}) {
  if ((budget || 0) >= 15000) return 'vip';
  if (interest === 'ecommerce') return 'ecom';
  if (interest === 'real_estate') return 'real_estate';
  if (interest === 'law') return 'law';
  return 'nurture';
}
export async function assignOwner(bucket?: string|null) {
  if (!bucket) return null;
  const owners = await prisma.owner.findMany({ where: { bucket, active: true } });
  if (!owners.length) return null;
  const idx = Math.floor(Math.random() * owners.length); // MVP
  return owners[idx].id;
}
