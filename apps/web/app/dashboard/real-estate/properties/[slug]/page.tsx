import { PropertyDetail } from '../[id]/PropertyDetail';
import { notFound } from 'next/navigation';

// Fetch property by slug/ID
async function getProperty(slug: string) {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const apiBase = process.env.API_BASE ?? "http://localhost:4000";
    // const res = await fetch(`${apiBase}/api/real-estate/properties/${slug}`, {
    //   cache: 'no-store',
    //   headers: { 'x-owner-uid': 'demo-user' }
    // });
    // if (!res.ok) throw new Error('Failed to fetch');
    // return res.json();

    // Mock data for now
    const mockProperties: Record<string, any> = {
      '1': {
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
        description: 'Stunning luxury penthouse in the heart of Tel Aviv. This exceptional property offers breathtaking views of the city skyline and the Mediterranean Sea. Features include high ceilings, premium finishes, a private terrace, and state-of-the-art amenities.\n\nPerfect for those seeking the ultimate urban living experience.',
        amenities: 'Parking (2 spaces), Storage, Elevator, Gym, Pool, 24/7 Security, Smart Home System',
        publishedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        slug: 'luxury-penthouse-tel-aviv',
        images: [],
      },
      '2': {
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
        description: 'Beautifully renovated apartment in prestigious Ramat Aviv neighborhood. Close to parks, schools, and shopping centers. Perfect for families.',
        amenities: 'Parking, Elevator, Balcony, Storage',
        publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        slug: 'modern-apartment-ramat-aviv',
        images: [],
      },
      '3': {
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
        description: 'Spacious garden house with private pool in Herzliya Pituach. Rare opportunity in prime location.',
        amenities: 'Private Garden, Pool, Parking (3 spaces), Storage, BBQ Area',
        publishedAt: null,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        slug: null,
        images: [],
      },
      'luxury-penthouse-tel-aviv': {
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
        description: 'Stunning luxury penthouse in the heart of Tel Aviv. This exceptional property offers breathtaking views of the city skyline and the Mediterranean Sea. Features include high ceilings, premium finishes, a private terrace, and state-of-the-art amenities.\n\nPerfect for those seeking the ultimate urban living experience.',
        amenities: 'Parking (2 spaces), Storage, Elevator, Gym, Pool, 24/7 Security, Smart Home System',
        publishedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        slug: 'luxury-penthouse-tel-aviv',
        images: [],
      },
      'modern-apartment-ramat-aviv': {
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
        description: 'Beautifully renovated apartment in prestigious Ramat Aviv neighborhood. Close to parks, schools, and shopping centers. Perfect for families.',
        amenities: 'Parking, Elevator, Balcony, Storage',
        publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        slug: 'modern-apartment-ramat-aviv',
        images: [],
      },
    };

    return mockProperties[slug] || null;
  } catch (error) {
    console.error('Failed to fetch property:', error);
    return null;
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetail property={property} />;
}
