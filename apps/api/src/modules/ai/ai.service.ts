import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import 'dotenv/config';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type Color = 'silver' | 'gold' | 'multi';

function baseFromFilename(filename: string): string {
  const base = (filename?.split(/[\\/]/).pop() || filename || '').replace(/\.[a-z0-9]+$/i, '');
  return base.replace(/[-_]+/g, ' ').trim();
}

function guessColorFromName(filename: string): Color {
  const heb = filename || '';
  const lc = heb.toLowerCase();

  // חריג: שרשרת פנינים צבעונית → multi
  if (/שרשרת.*פנינים.*צבעונ/.test(heb) || /colorful.*pearl/.test(lc)) return 'multi';

  // רמזים לשאר
  if (/(gold|זהב)/i.test(heb)) return 'gold';
  if (/(silver|כסף)/i.test(heb)) return 'silver';
  return 'silver';
}

export interface PropertyScoreResult {
  score: number; // 0-100
  category: 'excellent' | 'good' | 'fair' | 'poor';
  reasons: string[];
  marketInsights: string[];
  recommendations: string[];
}

@Injectable()
export class AiService {
  async parseDefaults(text: string) {
    if (!text?.trim()) return {};

    if (!process.env.OPENAI_API_KEY) {
      console.error('[AI] ENV MISSING: OPENAI_API_KEY');
      throw new Error('OPENAI_API_KEY is missing');
    } else {
      console.log('[AI] Using OPENAI key prefix:', process.env.OPENAI_API_KEY.slice(0, 8) + '...');
    }

    // JSON Schema עם required מלא (למצב strict)
    const jsonSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        vendor: { type: 'string' },
        price: { type: 'number' },
        inventoryQty: { type: 'integer' },
        inventoryPolicy: { type: 'string', enum: ['deny', 'continue'] },
        requiresShipping: { type: 'boolean' },
        taxable: { type: 'boolean' },
        fulfillment: { type: 'string', enum: ['manual'] },
        status: { type: 'string', enum: ['active', 'draft', 'archived'] },
        weightUnit: { type: 'string', enum: ['g', 'kg', 'lb', 'oz'] },
        productType: { type: 'string' },
        productCategory: { type: 'string' },
        tags: { type: 'string' },
        published: { type: 'boolean' }
      },
      required: [
        'vendor',
        'price',
        'inventoryQty',
        'inventoryPolicy',
        'requiresShipping',
        'taxable',
        'fulfillment',
        'status',
        'weightUnit',
        'productType',
        'productCategory',
        'tags',
        'published'
      ]
    };

    try {
      // פורמט החדש של Responses API: text.format עם name+schema+strict
      const res = await (client as any).responses.create({
        model: 'gpt-4o-mini',
        input: text,
        instructions:
          'Parse the input into Shopify product defaults strictly matching the schema.',
        text: {
          format: {
            type: 'json_schema',
            name: 'shopify_defaults',
            schema: jsonSchema as any,
            strict: true
          }
        },
        temperature: 0.2
      });

      const outText =
        (res as any).output_text ??
        (res as any)?.output?.[0]?.content?.[0]?.text?.value ??
        '';

      console.log('[AI] output_text length (parseDefaults):', outText?.length ?? 0);

      try {
        return outText ? JSON.parse(outText) : {};
      } catch (parseErr) {
        console.error('[AI] JSON parse error (parseDefaults):', parseErr);
        console.error('[AI] Raw outText:', outText);
        throw parseErr;
      }
    } catch (err: any) {
      console.error('[AI] OpenAI call failed (parseDefaults):', err?.status || '', err?.message || '');
      if (err?.response?.data) console.error('[AI] response.data:', err.response.data);
      if (err?.stack) console.error(err.stack);
      throw err;
    }
  }

  // חדשה: הפקת Title/Description/Tags + צבע לכל קובץ
  // חדשה: הפקת Title/Description/Tags + צבע לכל קובץ – עם schema שעונה לדרישה (root: object)
async generatePerItem(items: { filename: string }[]): Promise<Array<{
  filename: string;
  title: string;
  description: string;
  tags: string;
  color: Color;
}>> {
  if (!items?.length) return [];

  // סכימת פריט בודד (חובה: required כולל את כל המפתחות)
const itemSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    filename: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    tags: { type: 'string' },
    color: { type: 'string', enum: ['silver', 'gold', 'multi'] }
  },
  required: ['filename', 'title', 'description', 'tags', 'color']
};


  // *** חשוב: השורש הוא OBJECT עם מאפיין items שהוא ARRAY ***
  const jsonSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      items: {
        type: 'array',
        items: itemSchema
      }
    },
    required: ['items']
  };

  const instructions =
    'For each filename, generate a concise **Hebrew** product title (3–7 words) and an HTML description (<p>...</p>, 1–2 short sentences). ' +
    'Return comma-separated tags (Hebrew). ' +
    'Choose a single color for each item: "silver" or "gold" for all items, ' +
    'EXCEPT when the filename clearly refers to the colorful pearl necklace (contains Hebrew "שרשרת פנינים צבעונית" or English "colorful pearl necklace"), then set color = "multi". ' +
    'Infer meaning from the filename text (no vision). Keep it Shopify-friendly.';

  try {
    const res = await (client as any).responses.create({
      model: 'gpt-4o-mini',
      input: JSON.stringify(items),
      instructions,
      text: {
        format: {
          type: 'json_schema',
          name: 'shopify_ai_items',
          schema: jsonSchema as any,
          strict: true
        }
      },
      temperature: 0.4
    });

    const outText =
      (res as any).output_text ??
      (res as any)?.output?.[0]?.content?.[0]?.text?.value ??
      '{}';

    // מצפים לאובייקט עם שדה items
    const parsed = JSON.parse(outText);
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch (err: any) {
    // Fallback אם יש 429/בעיה ב־API
    if (err?.status === 429) {
      console.error('[AI] quota exceeded in generatePerItem – fallback applied');
      return items.map(({ filename }) => {
        const title = baseFromFilename(filename);
        const color = guessColorFromName(filename);
        return {
          filename,
          title: title || 'פריט ללא שם',
          description: '<p>תיאור יתווסף מאוחר יותר.</p>',
          tags: 'תכשיטים, אקססוריז',
          color
        };
      });
    }
    console.error('[AI] OpenAI call failed (generatePerItem):', err?.status || '', err?.message || '');
    if (err?.response?.data) console.error('[AI] response.data:', err.response.data);
    if (err?.stack) console.error(err.stack);
    throw err;
  }
}

  async scoreProperty(property: any): Promise<PropertyScoreResult> {
    if (!process.env.OPENAI_API_KEY) {
      console.error('[AI] ENV MISSING: OPENAI_API_KEY for property scoring');
      throw new Error('OPENAI_API_KEY is missing');
    }

    const propertyData = {
      address: property.address,
      city: property.city,
      neighborhood: property.neighborhood,
      price: property.price,
      currency: property.currency || 'ILS',
      rooms: property.rooms,
      size: property.size,
      floor: property.floor,
      type: property.type,
      description: property.description,
      amenities: property.amenities,
      yearBuilt: property.yearBuilt,
      agentName: property.agentName,
      provider: property.provider
    };

    const jsonSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        score: { type: 'number', minimum: 0, maximum: 100 },
        category: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] },
        reasons: { type: 'array', items: { type: 'string' } },
        marketInsights: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } }
      },
      required: ['score', 'category', 'reasons', 'marketInsights', 'recommendations']
    };

    const instructions = `
Analyze this Israeli real estate property and provide a comprehensive scoring and insights:

1. Score the property from 0-100 based on:
   - Location desirability (neighborhood, city, proximity to amenities)
   - Price competitiveness for the Israeli market
   - Property specifications (size, rooms, floor, condition)
   - Investment potential and rental yield prospects

2. Categorize as: excellent (85-100), good (70-84), fair (50-69), poor (0-49)

3. Provide specific reasons for the score in Hebrew
4. Give market insights relevant to Israeli real estate
5. Offer actionable recommendations for buyers/investors

Consider Israeli market specifics: city popularity, neighborhood trends, price per square meter norms, and rental market conditions.
`;

    try {
      const res = await (client as any).responses.create({
        model: 'gpt-4o-mini',
        input: JSON.stringify(propertyData),
        instructions,
        text: {
          format: {
            type: 'json_schema',
            name: 'property_score',
            schema: jsonSchema,
            strict: true
          }
        },
        temperature: 0.3
      });

      const outText = (res as any).output_text ??
                      (res as any)?.output?.[0]?.content?.[0]?.text?.value ?? '';

      console.log('[AI] Property scoring output length:', outText?.length ?? 0);

      try {
        const result = JSON.parse(outText) as PropertyScoreResult;
        console.log('[AI] Property scored:', result.score, result.category);
        return result;
      } catch (parseErr) {
        console.error('[AI] JSON parse failed for property scoring:', parseErr);
        console.log('[AI] Raw output:', outText);

        // Fallback scoring
        return {
          score: 50,
          category: 'fair',
          reasons: ['לא ניתן לנתח את הנכס באופן מלא'],
          marketInsights: ['נדרש ניתוח נוסף של השוק המקומי'],
          recommendations: ['מומלץ לבדוק נכסים דומים באזור']
        };
      }
    } catch (err: any) {
      console.error('[AI] Property scoring failed:', err?.status || '', err?.message || '');
      if (err?.response?.data) console.error('[AI] response.data:', err.response.data);

      // Fallback scoring
      return {
        score: 50,
        category: 'fair',
        reasons: ['שגיאה בניתוח הנכס'],
        marketInsights: ['לא ניתן לקבל תובנות שוק כעת'],
        recommendations: ['נסה שוב מאוחר יותר']
      };
    }
  }

}
