import LeadsClient from './LeadsClient';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  // Pass empty array as initial data - client will fetch from API
  return <LeadsClient initialData={[]} />;
}
