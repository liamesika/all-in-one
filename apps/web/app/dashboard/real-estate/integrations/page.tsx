import { prisma } from '@/lib/prisma.server';
import { cookies } from 'next/headers';
import IntegrationsClient from './IntegrationsClient';


async function getIntegrations(ownerUid: string) {
  try {
    const integrations = await prisma.integration.findMany({
      where: { ownerUid },
      include: {
        syncLogs: {
          take: 5,
          orderBy: { startedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return integrations;
  } catch (error) {
    console.error('[Integrations Page] Failed to fetch integrations:', error);
    return [];
  }
}

export default async function IntegrationsPage() {
  // Get user from session (simplified for demo)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  // For demo, use a default user
  const ownerUid = 'demo-user'; // In production, extract from session

  const integrations = await getIntegrations(ownerUid);

  return <IntegrationsClient initialIntegrations={integrations} />;
}
