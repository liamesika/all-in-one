import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';


async function scrapeMadlan(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Madlan listing');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract data from Madlan page structure
    const title = $('h1.title').first().text().trim() || 'Imported from Madlan';
    const priceText = $('.price').first().text().replace(/[^\d]/g, '') || null;
    const roomsText = $('.rooms').first().text().replace(/[^\d.]/g, '') || null;
    const sizeText = $('.size').first().text().replace(/[^\d]/g, '') || null;
    const address = $('.address').first().text().trim() || null;
    const neighborhood = $('.neighborhood').first().text().trim() || null;
    const city = $('.city').first().text().trim() || null;
    const description = $('.description').first().text().trim() || null;

    // Extract images
    const images: string[] = [];
    $('.property-image img, .gallery img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.startsWith('http')) {
        images.push(src);
      }
    });

    return {
      name: title,
      address,
      neighborhood,
      city,
      price: priceText ? parseInt(priceText) : null,
      rooms: roomsText ? parseFloat(roomsText) : null,
      size: sizeText ? parseInt(sizeText) : null,
      description,
      images: images.slice(0, 10),
      type: 'APARTMENT',
      transactionType: url.includes('/rent/') || url.includes('rent') ? 'RENT' : 'SALE',
    };
  } catch (error) {
    console.error('Madlan scraping error:', error);
    throw new Error('Failed to parse Madlan listing');
  }
}

export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();
    const { url } = body;

    if (!url || !url.includes('madlan.co.il')) {
      return NextResponse.json({ error: 'Invalid Madlan URL' }, { status: 400 });
    }

    const scrapedData = await scrapeMadlan(url);

    const property = await prisma.property.create({
      data: {
        ownerUid,
        name: scrapedData.name,
        address: scrapedData.address,
        neighborhood: scrapedData.neighborhood,
        city: scrapedData.city,
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
      message: 'Property imported successfully from Madlan',
    });
  } catch (error: any) {
    console.error('Madlan import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import from Madlan' },
      { status: 500 }
    );
  }
});
