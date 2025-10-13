import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicPropertyLanding from './PublicPropertyLanding';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  transactionType: 'SALE' | 'RENT';
  price?: number;
  rentPriceMonthly?: number;
  rentTerms?: string;
  rooms: number;
  size: number;
  status: string;
  description?: string;
  amenities?: string;
  images?: string[];
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  slug: string;
}

async function getPropertyBySlug(slug: string): Promise<Property | null> {
  // TODO: Replace with actual database query using Prisma
  // const { PrismaClient } = require('@prisma/client');
  // const prisma = new PrismaClient();
  //
  // const property = await prisma.property.findUnique({
  //   where: { slug },
  //   include: {
  //     photos: {
  //       orderBy: { sortIndex: 'asc' }
  //     }
  //   }
  // });
  //
  // if (!property) return null;
  //
  // return {
  //   ...property,
  //   images: property.photos.map(p => p.url)
  // };

  // Mock data for development
  const mockProperties: Record<string, Property> = {
    'luxury-penthouse-tel-aviv': {
      id: '1',
      name: 'Luxury Penthouse - Tel Aviv',
      address: 'Rothschild Blvd 10',
      city: 'Tel Aviv',
      transactionType: 'SALE',
      price: 4500000,
      rentPriceMonthly: undefined,
      rentTerms: undefined,
      rooms: 5,
      size: 180,
      status: 'PUBLISHED',
      description: 'Stunning penthouse with panoramic city views. Features include a spacious balcony, modern kitchen, and premium finishes throughout. Located in the heart of Tel Aviv with easy access to beaches, restaurants, and culture.',
      amenities: 'Parking, Elevator, Balcony, Storage, Security System',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
        'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200',
      ],
      agentName: 'David Cohen',
      agentPhone: '+972501234567',
      agentEmail: 'david@effinity.co.il',
      slug: 'luxury-penthouse-tel-aviv',
    },
    'modern-apartment-ramat-aviv': {
      id: '2',
      name: 'Modern Apartment - Ramat Aviv',
      address: 'Einstein St 25',
      city: 'Tel Aviv',
      transactionType: 'RENT',
      price: undefined,
      rentPriceMonthly: 8500,
      rentTerms: 'Minimum 12 months lease, 2 months deposit required',
      rooms: 4,
      size: 120,
      status: 'PUBLISHED',
      description: 'Beautiful modern apartment in sought-after Ramat Aviv neighborhood. Close to Tel Aviv University, parks, and shopping centers. Perfect for families looking for a comfortable rental.',
      amenities: 'Parking, Elevator, Balcony',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
      ],
      agentName: 'Sarah Levi',
      agentPhone: '+972529876543',
      agentEmail: 'sarah@effinity.co.il',
      slug: 'modern-apartment-ramat-aviv',
    },
  };

  return mockProperties[slug] || null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: 'Property Not Found | EFFINITY',
      description: 'The property you are looking for could not be found.',
    };
  }

  const isSale = property.transactionType === 'SALE';
  const priceInfo = isSale && property.price
    ? `₪${property.price.toLocaleString()}`
    : property.rentPriceMonthly
    ? `₪${property.rentPriceMonthly.toLocaleString()}/month`
    : 'Contact for price';

  const pricePerSqm = isSale && property.price
    ? Math.round(property.price / property.size)
    : property.rentPriceMonthly
    ? Math.round(property.rentPriceMonthly / property.size)
    : null;

  const title = `${property.name} | ${priceInfo} | EFFINITY`;
  const description = `${property.rooms} rooms, ${property.size} sqm${
    pricePerSqm ? ` (₪${pricePerSqm.toLocaleString()}/${isSale ? 'sqm' : 'sqm/month'})` : ''
  } in ${property.city}. ${property.description?.substring(0, 120) || ''}`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://effinity.co.il';
  const propertyUrl = `${baseUrl}/property/${slug}`;
  const primaryImage = property.images?.[0] || `${baseUrl}/default-property.jpg`;

  return {
    title,
    description,
    openGraph: {
      title: property.name,
      description,
      images: [primaryImage],
      url: propertyUrl,
      type: 'website',
      siteName: 'EFFINITY',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.name,
      description,
      images: [primaryImage],
    },
    alternates: {
      canonical: propertyUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PublicPropertyPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PublicPropertyLanding property={property} />;
}
