import TemplatesClient from './TemplatesClient';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getOwnerUid() {
  const cookieStore = await cookies();
  const ownerUid = cookieStore.get('ownerUid')?.value || 'demo-user';
  return ownerUid;
}

export default async function TemplatesPage() {
  const ownerUid = await getOwnerUid();
  return <TemplatesClient ownerUid={ownerUid} />;
}