export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';


async function scrapeYad2(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Yad2 listing');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract data from Yad2 page structure
    // Note: This is a simplified scraper - Yad2's structure may change
    const title = $('h1').first().text().trim() || 'Imported from Yad2';
    const price = $('[data-testid="price"]').text().replace(/[^\d]/g, '') || null;
    const rooms = $('[data-testid="rooms"]').text().replace(/[^\d.]/g, '') || null;
    const size = $('[data-testid="square_meters"]').text().replace(/[^\d]/g, '') || null;
    const address = $('[data-testid="address"]').text().trim() || null;
    const description = $('[data-testid="description"]').text().trim() || null;

    // Extract images
    const images: string[] = [];
    $('img[data-testid="image"]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && src.startsWith('http')) {
        images.push(src);
      }
    });

    return {
      name: title,
      address,
      price: price ? parseInt(price) : null,
      rooms: rooms ? parseFloat(rooms) : null,
      size: size ? parseInt(size) : null,
      description,
      images: images.slice(0, 10),
      type: 'APARTMENT',
      transactionType: url.includes('/rent/') ? 'RENT' : 'SALE',
    };
  } catch (error) {
    console.error('Yad2 scraping error:', error);
    throw new Error('Failed to parse Yad2 listing');
  }
}

export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();
    const { url } = body;

    if (!url || !url.includes('yad2.co.il')) {
      return NextResponse.json({ error: 'Invalid Yad2 URL' }, { status: 400 });
    }

    const scrapedData = await scrapeYad2(url);

    const property = await prisma.property.create({
      data: {
        ownerUid,
        name: scrapedData.name,
        address: scrapedData.address,
        type: scrapedData.type,
        transactionType: scrapedData.transactionType as any,
        price: scrapedData.transactionType === 'SALE' ? scrapedData.price : null,
        rentPriceMonthly: scrapedData.transactionType === 'RENT' ? scrapedData.price : null,
        rooms: scrapedData.rooms,
        size: scrapedData.size,
        description: scrapedData.description,
        status: 'PUBLISHED',
      },
    });

    // Create photos if available
    if (scrapedData.images.length > 0) {
      await prisma.propertyPhoto.createMany({
        data: scrapedData.images.map((url, index) => ({
          propertyId: property.id,
          url,
          sortIndex: index,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      property,
      message: 'Property imported successfully from Yad2',
    });
  } catch (error: any) {
    console.error('Yad2 import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import from Yad2' },
      { status: 500 }
    );
  }
});
