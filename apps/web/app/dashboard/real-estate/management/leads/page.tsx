import LeadsClient from '../../leads/LeadsClient';

export const dynamic = 'force-dynamic';

export default async function ManagementLeadsPage() {
  return <LeadsClient initialData={[]} />;
}
