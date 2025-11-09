import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerUid = searchParams.get('ownerUid');

    if (!ownerUid) {
      return NextResponse.json(
        { error: 'ownerUid is required' },
        { status: 400 }
      );
    }

    // Fetch all published properties with necessary fields for map display
    const properties = await prisma.property.findMany({
      where: {
        ownerUid,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        neighborhood: true,
        price: true,
        rentPriceMonthly: true,
        transactionType: true,
        type: true,
        rooms: true,
        size: true,
        aiScore: true,
        photos: {
          take: 1,
          orderBy: {
            sortIndex: 'asc',
          },
          select: {
            url: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform properties to include coordinates
    // Note: In production, you would geocode addresses to get lat/lng
    // For now, we'll return mock coordinates for Israeli cities
    const propertiesWithCoords = properties.map((property) => {
      // Mock coordinates based on city (in production, use Google Geocoding API)
      const coords = getCityCoordinates(property.city || 'Tel Aviv');

      return {
        id: property.id,
        title: property.name,
        lat: coords.lat + (Math.random() - 0.5) * 0.02, // Add some variation
        lng: coords.lng + (Math.random() - 0.5) * 0.02,
        price: property.transactionType === 'SALE' ? property.price : property.rentPriceMonthly,
        transactionType: property.transactionType,
        type: property.type,
        neighborhood: property.neighborhood,
        city: property.city,
        address: property.address,
        rooms: property.rooms,
        size: property.size,
        score: property.aiScore || 0,
        imageUrl: property.photos[0]?.url || null,
      };
    });

    return NextResponse.json({
      properties: propertiesWithCoords,
      count: propertiesWithCoords.length,
    });
  } catch (error) {
    console.error('Error fetching neighborhoods data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// Helper function to get approximate coordinates for Israeli cities
function getCityCoordinates(city: string | null): { lat: number; lng: number } {
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'Tel Aviv': { lat: 32.0853, lng: 34.7818 },
    'תל אביב': { lat: 32.0853, lng: 34.7818 },
    'Jerusalem': { lat: 31.7683, lng: 35.2137 },
    'ירושלים': { lat: 31.7683, lng: 35.2137 },
    'Haifa': { lat: 32.7940, lng: 34.9896 },
    'חיפה': { lat: 32.7940, lng: 34.9896 },
    'Ramat Gan': { lat: 32.0719, lng: 34.8237 },
    'רמת גן': { lat: 32.0719, lng: 34.8237 },
    'Netanya': { lat: 32.3337, lng: 34.8512 },
    'נתניה': { lat: 32.3337, lng: 34.8512 },
    'Herzliya': { lat: 32.1624, lng: 34.8443 },
    'הרצליה': { lat: 32.1624, lng: 34.8443 },
    'Ashdod': { lat: 31.8044, lng: 34.6553 },
    'אשדוד': { lat: 31.8044, lng: 34.6553 },
    'Beersheba': { lat: 31.2518, lng: 34.7913 },
    'באר שבע': { lat: 31.2518, lng: 34.7913 },
    'Rishon LeZion': { lat: 31.9730, lng: 34.7925 },
    'ראשון לציון': { lat: 31.9730, lng: 34.7925 },
  };

  return cityCoords[city || 'Tel Aviv'] || { lat: 32.0853, lng: 34.7818 };
}
