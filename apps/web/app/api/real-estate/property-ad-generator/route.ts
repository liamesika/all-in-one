import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { property } = await request.json();

    if (!property) {
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    const { name, address, price, rooms, size, description, amenities } = property;

    let generatedDescription: any;

    // Only use OpenAI if API key is available
    if (openai) {
      // Generate marketing description
      const descriptionPrompt = `You are a professional real estate copywriter. Write a compelling, engaging property listing description in both English and Hebrew for the following property:

Property Details:
- Name: ${name}
- Address: ${address}
- Price: ${price ? `₪${price.toLocaleString()}` : 'Contact for price'}
- Rooms: ${rooms || 'N/A'}
- Size: ${size ? `${size} sqm` : 'N/A'}
${description ? `- Additional info: ${description}` : ''}
${amenities ? `- Amenities: ${amenities}` : ''}

Write TWO versions:
1. English version (150-200 words, engaging, highlighting best features, call-to-action)
2. Hebrew version (150-200 words, same style)

Format as JSON: { "english": "...", "hebrew": "..." }`;

      const descriptionResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert real estate copywriter who creates compelling property listings that convert browsers into buyers.',
          },
          {
            role: 'user',
            content: descriptionPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      generatedDescription = JSON.parse(
        descriptionResponse.choices[0]?.message?.content || '{}'
      );
    } else {
      // Fallback descriptions when OpenAI is not available
      generatedDescription = {
        english: `Discover this exceptional ${rooms || ''}-room property located at ${address || 'a prime location'}. ${size ? `Spanning ${size} square meters, ` : ''}this residence offers the perfect blend of comfort and convenience. ${description || 'Contact us today to schedule a private viewing and experience this remarkable property firsthand.'}`,
        hebrew: `גלו את הנכס היוצא דופן הזה ${rooms ? `בן ${rooms} חדרים` : ''} הממוקם ב${address || 'מיקום מעולה'}. ${size ? `על שטח של ${size} מ"ר, ` : ''}הנכס מציע שילוב מושלם של נוחות ונוחיות. ${description || 'צרו קשר היום לתיאום צפייה פרטית ולחוות את הנכס הייחודי הזה.'}`
      };
    }

    // Generate price recommendation (simplified logic)
    const priceRecommendation = generatePriceRecommendation(property);

    // Generate landing page URL
    const slug = generateSlug(name, address);
    const landingPageUrl = `/properties/${slug}`;

    // Generate SEO meta
    const seoTitle = `${name} | ${address} | ₪${price?.toLocaleString() || 'Contact for price'}`;
    const seoDescription = generatedDescription.english?.substring(0, 160) + '...';

    console.log('[Ad Generator] Generated ad for property:', name);

    return NextResponse.json({
      generatedDescription,
      priceRecommendation,
      landingPageUrl,
      slug,
      seo: {
        title: seoTitle,
        description: seoDescription,
      },
      generatedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Ad Generator] Error:', error);

    // Return fallback response if OpenAI fails
    if (error.status === 429 || error.code === 'insufficient_quota') {
      return NextResponse.json({
        generatedDescription: {
          english: 'Stunning property in a prime location. Contact us for more details and to schedule a viewing.',
          hebrew: 'נכס מדהים במיקום מרכזי. צרו קשר לפרטים נוספים ולתיאום צפייה.',
        },
        priceRecommendation: {
          suggested: 'Market rate',
          reasoning: 'Based on comparable properties in the area',
        },
        landingPageUrl: `/properties/${Date.now()}`,
        slug: `property-${Date.now()}`,
        seo: {
          title: 'Property Listing',
          description: 'Contact us for details',
        },
        note: 'Generated with fallback (OpenAI quota exceeded)',
      });
    }

    return NextResponse.json(
      { error: 'Failed to generate property ad' },
      { status: 500 }
    );
  }
}

function generatePriceRecommendation(property: any) {
  const { price, rooms, size } = property;

  if (!price || !size) {
    return {
      suggested: 'Market rate analysis needed',
      reasoning: 'Insufficient data for price recommendation',
      confidence: 'low',
    };
  }

  const pricePerSqm = price / size;

  // Simple logic - in production, this would query comparable sales
  let suggested = price;
  let reasoning = '';
  let confidence = 'medium';

  if (pricePerSqm > 25000) {
    suggested = Math.round(size * 23000);
    reasoning = `Current price (₪${pricePerSqm.toLocaleString()}/sqm) is above market average. Recommended adjustment to ₪${Math.round(23000).toLocaleString()}/sqm`;
    confidence = 'medium';
  } else if (pricePerSqm < 15000) {
    suggested = Math.round(size * 17000);
    reasoning = `Current price (₪${pricePerSqm.toLocaleString()}/sqm) is below market. Consider increasing to ₪${Math.round(17000).toLocaleString()}/sqm`;
    confidence = 'medium';
  } else {
    reasoning = `Price (₪${pricePerSqm.toLocaleString()}/sqm) is competitive with market rates`;
    confidence = 'high';
  }

  return {
    suggested: `₪${suggested.toLocaleString()}`,
    current: `₪${price.toLocaleString()}`,
    pricePerSqm: `₪${Math.round(pricePerSqm).toLocaleString()}/sqm`,
    reasoning,
    confidence,
  };
}

function generateSlug(name: string, address?: string): string {
  const text = `${name}-${address || ''}`;
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60) + '-' + Date.now().toString(36);
}
