import LeadDetailClient from './LeadDetailClient';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getOwnerUid() {
  const cookieStore = await cookies();
  const ownerUid = cookieStore.get('ownerUid')?.value || 'demo-user';
  return ownerUid;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function LeadDetailPage({ params }: PageProps) {
  const ownerUid = await getOwnerUid();
  return <LeadDetailClient ownerUid={ownerUid} leadId={params.id} />;
}
