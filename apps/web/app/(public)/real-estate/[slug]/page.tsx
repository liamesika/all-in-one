import { notFound } from 'next/navigation';
import PublicPropertyLanding from './PublicPropertyLanding';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  price: number;
  rooms: number;
  size: number;
  status: string;
  description?: string;
  amenities?: string;
  images?: string[];
  agentName?: string;
  agentPhone?: string;
  slug: string;
}

async function getPropertyBySlug(slug: string): Promise<Property | null> {
  // TODO: Replace with actual database query
  // const property = await prisma.property.findUnique({
  //   where: { slug },
  //   include: { landingPages: true }
  // });

  // Mock data for now - matches the properties we created
  const mockProperties: Record<string, Property> = {
    'luxury-penthouse-tel-aviv': {
      id: '1',
      name: 'Luxury Penthouse - Tel Aviv',
      address: 'Rothschild Blvd 10',
      city: 'Tel Aviv',
      price: 4500000,
      rooms: 5,
      size: 180,
      status: 'LISTED',
      description: 'Stunning penthouse with panoramic city views. Features include a spacious balcony, modern kitchen, and premium finishes throughout. Located in the heart of Tel Aviv with easy access to beaches, restaurants, and culture.',
      amenities: 'Parking, Elevator, Balcony, Storage, Security System',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      ],
      agentName: 'David Cohen',
      agentPhone: '+972501234567',
      slug: 'luxury-penthouse-tel-aviv',
    },
    'modern-apartment-ramat-aviv': {
      id: '2',
      name: 'Modern Apartment - Ramat Aviv',
      address: 'Einstein St 25',
      city: 'Tel Aviv',
      price: 2800000,
      rooms: 4,
      size: 120,
      status: 'LISTED',
      description: 'Beautiful modern apartment in sought-after Ramat Aviv neighborhood. Close to Tel Aviv University, parks, and shopping centers.',
      amenities: 'Parking, Elevator, Balcony',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      agentName: 'Sarah Levi',
      agentPhone: '+972529876543',
      slug: 'modern-apartment-ramat-aviv',
    },
  };

  return mockProperties[slug] || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  const pricePerSqm = Math.round(property.price / property.size);

  return {
    title: `${property.name} | ${property.address} | ₪${property.price.toLocaleString()}`,
    description: `${property.rooms} rooms, ${property.size} sqm (₪${pricePerSqm.toLocaleString()}/sqm) in ${property.city}. ${property.description?.substring(0, 150)}`,
    openGraph: {
      title: property.name,
      description: property.description || `${property.rooms} rooms, ${property.size} sqm`,
      images: property.images || [],
      type: 'website',
    },
  };
}

export default async function PublicPropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PublicPropertyLanding property={property} />;
}
