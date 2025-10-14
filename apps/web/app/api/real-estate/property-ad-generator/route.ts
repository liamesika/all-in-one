import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const prisma = new PrismaClient();

export const POST = withAuth(async (request, { user }) => {
  try {
    const { property } = await request.json();
    const ownerUid = getOwnerUid(user);

    if (!property) {
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    const { id: propertyId, name, address, price, rooms, size, description, amenities } = property;

    let generatedDescription: any;

    // Only use OpenAI if API key is available
    if (openai) {
      // Generate rich marketing description with perfect language separation
      const descriptionPrompt = `You are a professional Israeli real estate copywriter who creates compelling, persuasive property listings.

Property Details:
- Name: ${name}
- Address: ${address}
- Price: ${price ? `₪${price.toLocaleString()}` : 'Contact for price'}
- Rooms: ${rooms || 'N/A'}
- Size: ${size ? `${size} sqm` : 'N/A'}
- Status: For Sale
${description ? `- Context: ${description}` : ''}
${amenities ? `- Amenities: ${amenities}` : ''}

Write TWO complete versions with PERFECT language separation:

1. ENGLISH VERSION (200-250 words):
   - Attention-grabbing headline
   - Key benefits (location, size, features)
   - Lifestyle narrative (who will love this property and why)
   - Location advantages (neighborhood, transport, amenities)
   - Size breakdown and layout appeal
   - Strong call-to-action
   - 100% English, no Hebrew mixing

2. HEBREW VERSION (200-250 words):
   - כותרת מושכת
   - יתרונות מרכזיים (מיקום, גודל, תכונות)
   - נרטיב סגנון חיים
   - יתרונות מיקום
   - פירוט שטחים
   - קריאה לפעולה חזקה
   - 100% עברית, ללא ערבוב אנגלית

Return JSON with this EXACT structure:
{
  "en": {
    "title": "compelling headline in English",
    "description": "full marketing copy in English"
  },
  "he": {
    "title": "כותרת מושכת בעברית",
    "description": "תיאור שיווקי מלא בעברית"
  }
}

CRITICAL: Keep languages 100% separate. No mixed HE/EN text.`;

      const descriptionResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Israeli real estate copywriter who creates compelling property listings in perfect English and Hebrew (no mixed language).',
          },
          {
            role: 'user',
            content: descriptionPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      generatedDescription = JSON.parse(
        descriptionResponse.choices[0]?.message?.content || '{}'
      );
    } else {
      // Fallback descriptions with perfect language separation
      generatedDescription = {
        en: {
          title: `Stunning ${rooms || ''}-Room Property in ${address || 'Prime Location'}`,
          description: `Discover this exceptional ${rooms || ''}-room property located at ${address || 'a prime location'}. ${size ? `Spanning ${size} square meters, ` : ''}this residence offers the perfect blend of comfort and modern living. The property features ${amenities || 'premium amenities'} and is situated in one of the most sought-after neighborhoods. With easy access to transportation, shopping, and entertainment, this home is perfect for families and professionals alike. ${description || 'Contact us today to schedule a private viewing and experience this remarkable property firsthand. Don\'t miss this opportunity to own your dream home!'}`,
        },
        he: {
          title: `נכס מדהים ${rooms ? `בן ${rooms} חדרים` : ''} ב${address || 'מיקום מעולה'}`,
          description: `גלו את הנכס היוצא דופן הזה ${rooms ? `בן ${rooms} חדרים` : ''} הממוקם ב${address || 'מיקום מעולה'}. ${size ? `על שטח של ${size} מ"ר, ` : ''}הנכס מציע שילוב מושלם של נוחות וחיים מודרניים. הנכס כולל ${amenities || 'שירותים מובחרים'} וממוקם באחת השכונות המבוקשות ביותר. עם גישה נוחה לתחבורה ציבורית, קניות ובידור, בית זה מושלם למשפחות ואנשי מקצוע כאחד. ${description || 'צרו קשר היום לתיאום צפייה פרטית ולחוות את הנכס הייחודי הזה. אל תפספסו את ההזדמנות להפוך את הבית הזה לביתכם!'}`,
        },
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

    // Persist landing page to database
    let landingPageId: string | null = null;
    if (propertyId) {
      try {
        // Generate simple HTML for the landing page
        const html = generateLandingPageHTML({
          name,
          address,
          price,
          rooms,
          size,
          description: generatedDescription,
          seoTitle,
          seoDescription,
        });

        const landingPage = await prisma.landingPage.create({
          data: {
            propertyId,
            ownerUid,
            url: landingPageUrl,
            html,
          },
        });

        landingPageId = landingPage.id;
        console.log('[Ad Generator] Landing page persisted:', landingPageId);
      } catch (dbError) {
        console.error('[Ad Generator] Failed to persist landing page:', dbError);
        // Continue even if DB persistence fails
      }
    }

    return NextResponse.json({
      generatedDescription,
      priceRecommendation,
      landingPageUrl,
      landingPageId,
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
});

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

function generateLandingPageHTML(data: any): string {
  const { name, address, price, rooms, size, description, seoTitle, seoDescription } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDescription}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .header p { font-size: 1.2rem; opacity: 0.9; }
    .details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 40px 0; }
    .detail-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .detail-card .label { font-size: 0.875rem; color: #666; margin-bottom: 5px; }
    .detail-card .value { font-size: 1.5rem; font-weight: bold; color: #667eea; }
    .description { margin: 40px 0; }
    .description h2 { margin-bottom: 20px; }
    .description p { margin-bottom: 15px; }
    .cta { text-align: center; margin: 40px 0; }
    .cta-button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 1.125rem; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="container">
      <h1>${name}</h1>
      <p>${address || ''}</p>
    </div>
  </div>

  <div class="container">
    <div class="details">
      ${price ? `<div class="detail-card"><div class="label">Price</div><div class="value">₪${price.toLocaleString()}</div></div>` : ''}
      ${rooms ? `<div class="detail-card"><div class="label">Rooms</div><div class="value">${rooms}</div></div>` : ''}
      ${size ? `<div class="detail-card"><div class="label">Size</div><div class="value">${size} m²</div></div>` : ''}
    </div>

    <div class="description">
      <h2>About This Property</h2>
      <p>${description?.english || 'Contact us for more details about this exceptional property.'}</p>
    </div>

    <div class="cta">
      <a href="mailto:info@effinity.co.il" class="cta-button">Contact Us to Schedule a Viewing</a>
    </div>
  </div>
</body>
</html>`;
}
