import PropertiesClient from './PropertiesClient';

// Fetch properties server-side
async function getProperties() {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const apiBase = process.env.API_BASE ?? "http://localhost:4000";
    // const res = await fetch(`${apiBase}/api/real-estate/properties`, {
    //   cache: 'no-store',
    //   headers: { 'x-owner-uid': 'demo-user' }
    // });
    // if (!res.ok) throw new Error('Failed to fetch');
    // return res.json();

    // Mock data for now
    return [
      {
        id: '1',
        name: 'Luxury Penthouse - Tel Aviv',
        city: 'Tel Aviv',
        address: 'Rothschild Blvd 10',
        price: 4500000,
        rooms: 5,
        size: 180,
        status: 'LISTED',
        publishedAt: new Date().toISOString(),
        slug: 'luxury-penthouse-tel-aviv',
      },
      {
        id: '2',
        name: 'Modern Apartment - Ramat Aviv',
        city: 'Tel Aviv',
        address: 'Einstein St 25',
        price: 2800000,
        rooms: 4,
        size: 120,
        status: 'LISTED',
        publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        slug: 'modern-apartment-ramat-aviv',
      },
      {
        id: '3',
        name: 'Garden House - Herzliya',
        city: 'Herzliya',
        address: 'Sokolov St 45',
        price: 5200000,
        rooms: 6,
        size: 220,
        status: 'DRAFT',
        publishedAt: null,
        slug: null,
      },
    ];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return [];
  }
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  return <PropertiesClient initialData={properties} />;
}
