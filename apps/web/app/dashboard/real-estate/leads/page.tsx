import LeadsClient from './LeadsClient';

async function getLeads() {
  // TODO: Replace with actual API call
  // const apiBase = process.env.API_BASE ?? "http://localhost:4000";
  // const res = await fetch(`${apiBase}/api/real-estate/leads`, {
  //   cache: 'no-store',
  //   headers: { 'x-owner-uid': 'demo-user' }
  // });
  // if (!res.ok) throw new Error('Failed to fetch');
  // return res.json();

  // Mock data for now
  return [
    {
      id: '1',
      name: 'David Cohen',
      phone: '0501234567',
      email: 'david@example.com',
      status: 'HOT',
      source: 'Website',
      notes: 'Interested in 3-room apartment',
      propertyId: null,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: '2',
      name: 'Rachel Levi',
      phone: '0529876543',
      email: 'rachel@example.com',
      status: 'WARM',
      source: 'Facebook',
      notes: 'Looking for investment property',
      propertyId: null,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: '3',
      name: 'Michael Stern',
      phone: '0547654321',
      email: null,
      status: 'COLD',
      source: 'Instagram',
      notes: '',
      propertyId: null,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ];
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return <LeadsClient initialData={leads} />;
}
