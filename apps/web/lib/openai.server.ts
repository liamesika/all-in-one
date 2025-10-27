import OpenAI from 'openai';

// Lazy-load OpenAI client to avoid build-time errors
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function generateProductData(
  imageUrl: string,
  language: 'en' | 'he',
  productCategory?: string
) {
  const systemPrompt =
    language === 'he'
      ? 'אתה מומחה בכתיבה שיווקית לחנויות אינטרנט. צור תיאור מוצר מקצועי בעברית.'
      : 'You are an expert e-commerce copywriter. Create professional product descriptions.';

  const userPrompt =
    language === 'he'
      ? `צור עבור התמונה הזו: שם מוצר קצר ומושך, תיאור מפורט (2-3 משפטים), תגיות רלוונטיות (3-5), ומחיר בסיס הגיוני בשקלים. ${productCategory ? `קטגוריה: ${productCategory}` : ''}`
      : `For this product image, generate: a catchy product name, detailed description (2-3 sentences), relevant tags (3-5), and a realistic base price in USD. ${productCategory ? `Category: ${productCategory}` : ''}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the AI response - expect structured format
    const nameMatch = content.match(/(?:name|שם):\s*(.+)/i);
    const descMatch = content.match(/(?:description|תיאור):\s*(.+?)(?=\n(?:tags|תגיות|price|מחיר)|$)/is);
    const tagsMatch = content.match(/(?:tags|תגיות):\s*(.+?)(?=\n(?:price|מחיר)|$)/is);
    const priceMatch = content.match(/(?:price|מחיר):\s*(?:[$₪])?(\d+(?:\.\d{2})?)/i);

    return {
      name: nameMatch?.[1]?.trim() || 'Product Name',
      description: descMatch?.[1]?.trim() || content.slice(0, 200),
      tags: tagsMatch?.[1]?.trim() || 'product, new',
      basePrice: parseFloat(priceMatch?.[1] || '29.99'),
    };
  } catch (error) {
    console.error('[OpenAI] Product generation error:', error);
    throw error;
  }
}

export async function generateCampaignContent(brief: {
  goal: string;
  budget: string;
  targetRegion: string;
  targetAudience: string;
  productCategory: string;
  additionalNotes?: string;
}) {
  const systemPrompt = `You are an expert digital marketing strategist. Generate detailed audience segments and compelling ad copy variants for e-commerce campaigns.`;

  const userPrompt = `
Campaign Brief:
- Goal: ${brief.goal}
- Budget: ${brief.budget}
- Region: ${brief.targetRegion}
- Target Audience: ${brief.targetAudience}
- Product Category: ${brief.productCategory}
${brief.additionalNotes ? `- Notes: ${brief.additionalNotes}` : ''}

Generate:
1. Three distinct audience segments with demographics, interests, and estimated reach
2. Three ad copy variants (Professional tone, Friendly tone, Urgent tone) with headline, body text, and CTA

Format as JSON with this structure:
{
  "audiences": [
    {
      "name": "...",
      "description": "...",
      "demographics": "...",
      "interests": ["...", "..."],
      "estimatedReach": "..."
    }
  ],
  "adCopies": [
    {
      "headline": "...",
      "body": "...",
      "cta": "...",
      "tone": "..."
    }
  ]
}
`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      audiences: parsed.audiences || [],
      adCopies: parsed.adCopies || [],
    };
  } catch (error) {
    console.error('[OpenAI] Campaign generation error:', error);
    throw error;
  }
}

export async function generateImage(
  prompt: string,
  size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024'
) {
  try {
    const openai = getOpenAIClient();
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: size,
      quality: 'hd',
      n: 1,
    });

    return response.data[0]?.url || null;
  } catch (error) {
    console.error('[OpenAI] Image generation error:', error);
    throw error;
  }
}
