import { cookies } from 'next/headers';
import { AutomationsClient } from './AutomationsClient';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Automations | EFFINITY',
  description: 'Create and manage automated workflows for your real estate business',
};

async function getAutomations(ownerUid: string) {
  try {
    const automations = await prisma.automation.findMany({
      where: { ownerUid },
      orderBy: { createdAt: 'desc' },
      include: {
        executions: {
          take: 10,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    // Calculate stats for each automation
    return automations.map((automation) => {
      const stats = (automation.stats as any) || {
        totalRuns: 0,
        successCount: 0,
        failCount: 0,
        lastRunAt: null,
      };

      const successRate =
        stats.totalRuns > 0 ? (stats.successCount / stats.totalRuns) * 100 : 0;

      return {
        ...automation,
        stats: {
          ...stats,
          successRate: Math.round(successRate),
        },
      };
    });
  } catch (error) {
    console.error('Error fetching automations:', error);
    return [];
  }
}

export default async function AutomationsPage() {
  // Get user from session (simplified for demo)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  // For demo, use a default user
  const ownerUid = 'demo-user'; // In production, extract from session

  const automations = await getAutomations(ownerUid);

  return <AutomationsClient initialAutomations={automations} />;
}
