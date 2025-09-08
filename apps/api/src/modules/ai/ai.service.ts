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

}
