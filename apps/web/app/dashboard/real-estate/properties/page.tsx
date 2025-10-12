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
        transactionType: 'SALE',
        price: 4500000,
        rentPriceMonthly: null,
        rentTerms: null,
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
        transactionType: 'RENT',
        price: null,
        rentPriceMonthly: 8500,
        rentTerms: 'Minimum 12 months, 2 months deposit',
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
        transactionType: 'SALE',
        price: 5200000,
        rentPriceMonthly: null,
        rentTerms: null,
        rooms: 6,
        size: 220,
        status: 'DRAFT',
        publishedAt: null,
        slug: null,
      },
      {
        id: '4',
        name: 'City Center Studio - Tel Aviv',
        city: 'Tel Aviv',
        address: 'Dizengoff St 100',
        transactionType: 'RENT',
        price: null,
        rentPriceMonthly: 4200,
        rentTerms: 'Flexible lease terms available',
        rooms: 2,
        size: 50,
        status: 'LISTED',
        publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        slug: 'city-center-studio-tel-aviv',
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
